import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri } from 'expo-auth-session';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Define the scopes (permissions) required for RecruitFlow
const GOOGLE_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',  // Read/Write Calendar Events
  'https://www.googleapis.com/auth/tasks',            // Read/Write Tasks
  'https://www.googleapis.com/auth/gmail.send',       // Send Emails
  'https://www.googleapis.com/auth/gmail.readonly',   // Read Emails
];

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_access_token',
  REFRESH_TOKEN: 'google_refresh_token',
  TOKEN_EXPIRY: 'google_token_expiry',
  USER_INFO: 'google_user_info',
};

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  id: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
}

class GoogleAuthService {
  private clientId: string;

  constructor() {
    // Get from environment variables
    this.clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
    
    if (!this.clientId) {
      console.warn('⚠️ Google Client ID not found in environment variables');
    }
  }

  /**
   * Create the Google Auth configuration
   */
  createAuthRequest() {
    return Google.useAuthRequest({
      clientId: this.clientId,
      scopes: GOOGLE_SCOPES,
      redirectUri: makeRedirectUri({
        scheme: 'recruitflow',
        path: 'auth/google',
      }),
      responseType: 'code',
      usePKCE: true,
      extraParams: {
        access_type: 'offline', // Request refresh token
        prompt: 'consent',      // Force consent screen to get refresh token
      },
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
    try {
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          redirect_uri: makeRedirectUri({
            scheme: 'recruitflow',
            path: 'auth/google',
          }),
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const data = await response.json();
      
      const tokens: GoogleTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };

      // Store tokens securely
      await this.storeTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return null;
    }
  }

  /**
   * Store tokens securely
   */
  async storeTokens(tokens: GoogleTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      
      if (tokens.expiresIn) {
        const expiryTime = Date.now() + tokens.expiresIn * 1000;
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        return null;
      }

      // Check if token is expired
      const expiryTime = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      if (expiryTime && Date.now() >= parseInt(expiryTime)) {
        // Token expired, try to refresh
        return await this.refreshAccessToken();
      }

      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.clientId,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      const tokens: GoogleTokens = {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };

      // Store new access token
      await this.storeTokens(tokens);

      return tokens.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      
      const userInfo: GoogleUserInfo = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        id: data.id,
      };

      // Store user info
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Get stored user info
   */
  async getStoredUserInfo(): Promise<GoogleUserInfo | null> {
    try {
      const userInfoStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('Error getting stored user info:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Sign out - clear all stored tokens
   */
  async signOut(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO);
      console.log('✅ Google tokens cleared');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Make an authenticated API call to Google services
   */
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available. Please sign in with Google.');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
