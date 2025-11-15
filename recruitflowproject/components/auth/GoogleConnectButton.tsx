import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { googleAuthService, GoogleUserInfo } from '@/services/googleAuthService';
import { BrandColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface GoogleConnectButtonProps {
  onSuccess?: (userInfo: GoogleUserInfo) => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export function GoogleConnectButton({ 
  onSuccess, 
  onError,
  buttonText = "Connect Google Account"
}: GoogleConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
    responseType: 'code',
    usePKCE: true,
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  // Check if already connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleAuthSuccess(code);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', 'Failed to connect to Google');
      setLoading(false);
    }
  }, [response]);

  const checkConnection = async () => {
    const isAuth = await googleAuthService.isAuthenticated();
    setIsConnected(isAuth);
    
    if (isAuth) {
      const info = await googleAuthService.getStoredUserInfo();
      setUserInfo(info);
    }
  };

  const handleAuthSuccess = async (code: string) => {
    try {
      setLoading(true);

      // Exchange code for tokens
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      
      if (!tokens) {
        throw new Error('Failed to get tokens');
      }

      // Get user info
      const info = await googleAuthService.getUserInfo(tokens.accessToken);
      
      if (!info) {
        throw new Error('Failed to get user info');
      }

      setUserInfo(info);
      setIsConnected(true);

      // Store Google connection in Supabase user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            google_connected: true,
            google_email: info.email,
            google_name: info.name,
          },
        });
      }

      Alert.alert(
        'Success!',
        `Connected to Google as ${info.name}`,
        [{ text: 'OK' }]
      );

      onSuccess?.(info);
    } catch (error) {
      console.error('Error handling auth success:', error);
      Alert.alert('Error', 'Failed to complete Google authentication');
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      // Already connected, show info
      Alert.alert(
        'Google Connected',
        `Connected as ${userInfo?.name || userInfo?.email}`,
        [
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: handleDisconnect,
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error prompting auth:', error);
      Alert.alert('Error', 'Failed to start Google authentication');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleAuthService.signOut();
      
      // Update Supabase user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            google_connected: false,
            google_email: null,
            google_name: null,
          },
        });
      }

      setIsConnected(false);
      setUserInfo(null);
      
      Alert.alert('Disconnected', 'Google account has been disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      Alert.alert('Error', 'Failed to disconnect Google account');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isConnected && styles.buttonConnected,
        loading && styles.buttonDisabled,
      ]}
      onPress={handleConnect}
      disabled={loading || !request}
    >
      {loading ? (
        <ActivityIndicator color={BrandColors.white} />
      ) : (
        <>
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'logo-google'}
            size={24}
            color={BrandColors.white}
          />
          <Text style={styles.buttonText}>
            {isConnected
              ? `Connected: ${userInfo?.email || 'Google'}`
              : buttonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4', // Google Blue
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonConnected: {
    backgroundColor: '#34A853', // Google Green
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
