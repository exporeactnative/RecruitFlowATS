import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleConnectButton } from '@/components/auth/GoogleConnectButton';
import { supabase } from '@/lib/supabase';

type ThemePreference = 'light' | 'dark' | 'auto';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>('auto');
  const [callMethod, setCallMethod] = useState<'twilio' | 'native'>('twilio');
  const [smsMethod, setSmsMethod] = useState<'twilio' | 'native'>('twilio');
  const [emailMethod, setEmailMethod] = useState<'gmail' | 'native'>('native');

  useEffect(() => {
    loadPreferences();
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload a profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploadingAvatar(true);

      // Create file name
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const [theme, call, sms, email] = await Promise.all([
        AsyncStorage.getItem('theme_preference'),
        AsyncStorage.getItem('call_method'),
        AsyncStorage.getItem('sms_method'),
        AsyncStorage.getItem('email_method'),
      ]);
      
      if (theme) setThemePreference(theme as ThemePreference);
      if (call) setCallMethod(call as 'twilio' | 'native');
      if (sms) setSmsMethod(sms as 'twilio' | 'native');
      if (email) setEmailMethod(email as 'gmail' | 'native');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem('theme_preference', preference);
      setThemePreference(preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const saveCallMethod = async (method: 'twilio' | 'native') => {
    try {
      await AsyncStorage.setItem('call_method', method);
      setCallMethod(method);
    } catch (error) {
      console.error('Error saving call method:', error);
      Alert.alert('Error', 'Failed to save call method');
    }
  };

  const saveSmsMethod = async (method: 'twilio' | 'native') => {
    try {
      await AsyncStorage.setItem('sms_method', method);
      setSmsMethod(method);
    } catch (error) {
      console.error('Error saving SMS method:', error);
      Alert.alert('Error', 'Failed to save SMS method');
    }
  };

  const saveEmailMethod = async (method: 'gmail' | 'native') => {
    try {
      await AsyncStorage.setItem('email_method', method);
      setEmailMethod(method);
    } catch (error) {
      console.error('Error saving email method:', error);
      Alert.alert('Error', 'Failed to save email method');
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await supabase.auth.updateUser({
        data: { onboarding_completed: false },
      });
      router.push('/onboarding' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[BrandColors.teal[500], BrandColors.teal[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={BrandColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
          
          {/* Avatar */}
          <TouchableOpacity 
            style={[styles.avatarSection, { backgroundColor: colors.card }]}
            onPress={pickImage}
            disabled={uploadingAvatar}
          >
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: BrandColors.teal[500] }]}>
                  <Text style={styles.avatarText}>
                    {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </Text>
                </View>
              )}
              {uploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color={BrandColors.white} />
                </View>
              )}
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.avatarTitle, { color: colors.text }]}>Profile Picture</Text>
              <Text style={[styles.avatarSubtitle, { color: colors.textMuted }]}>Tap to change</Text>
            </View>
            <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={BrandColors.teal[500]} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Name</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {user?.user_metadata?.full_name || 'Not set'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={BrandColors.teal[500]} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {user?.email}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color={BrandColors.teal[500]} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Role</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {user?.user_metadata?.role || 'Recruiter'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Integrations Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Integrations</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
              Connect your Google account to sync calendars, tasks, and send emails directly from RecruitFlow.
            </Text>
            
            <GoogleConnectButton />

            <View style={styles.permissionsInfo}>
              <Text style={[styles.permissionsTitle, { color: colors.text }]}>
                Permissions requested:
              </Text>
              <Text style={[styles.permissionItem, { color: colors.textMuted }]}>
                • Calendar Events (read/write)
              </Text>
              <Text style={[styles.permissionItem, { color: colors.textMuted }]}>
                • Google Tasks (read/write)
              </Text>
              <Text style={[styles.permissionItem, { color: colors.textMuted }]}>
                • Gmail (send emails)
              </Text>
            </View>
          </View>
        </View>

        {/* Communication Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Communication</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Call Method</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted, marginBottom: 12 }]}>
              Choose how to make calls
            </Text>
            
            <View style={styles.methodOptions}>
              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: callMethod === 'twilio' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveCallMethod('twilio')}
              >
                <Ionicons 
                  name="call" 
                  size={20} 
                  color={callMethod === 'twilio' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: callMethod === 'twilio' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Twilio
                </Text>
                <Text style={[styles.methodBadge, { color: BrandColors.orange[500] }]}>Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: callMethod === 'native' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveCallMethod('native')}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={20} 
                  color={callMethod === 'native' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: callMethod === 'native' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Native
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>SMS Method</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted, marginBottom: 12 }]}>
              Choose how to send text messages
            </Text>
            
            <View style={styles.methodOptions}>
              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: smsMethod === 'twilio' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveSmsMethod('twilio')}
              >
                <Ionicons 
                  name="chatbubble" 
                  size={20} 
                  color={smsMethod === 'twilio' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: smsMethod === 'twilio' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Twilio
                </Text>
                <Text style={[styles.methodBadge, { color: BrandColors.orange[500] }]}>Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: smsMethod === 'native' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveSmsMethod('native')}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={20} 
                  color={smsMethod === 'native' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: smsMethod === 'native' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Native
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Email Method</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted, marginBottom: 12 }]}>
              Choose how to send emails
            </Text>
            
            <View style={styles.methodOptions}>
              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: emailMethod === 'gmail' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveEmailMethod('gmail')}
              >
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color={emailMethod === 'gmail' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: emailMethod === 'gmail' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Gmail API
                </Text>
                <Text style={[styles.methodBadge, { color: BrandColors.orange[500] }]}>Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: emailMethod === 'native' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveEmailMethod('native')}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={20} 
                  color={emailMethod === 'native' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.methodOptionText,
                  { color: emailMethod === 'native' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Native
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardLabel, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted, marginBottom: 12 }]}>
              Choose how RecruitFlow looks
            </Text>
            
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: themePreference === 'light' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveThemePreference('light')}
              >
                <Ionicons 
                  name="sunny" 
                  size={24} 
                  color={themePreference === 'light' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.themeOptionText,
                  { color: themePreference === 'light' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: themePreference === 'dark' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveThemePreference('dark')}
              >
                <Ionicons 
                  name="moon" 
                  size={24} 
                  color={themePreference === 'dark' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.themeOptionText,
                  { color: themePreference === 'dark' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: themePreference === 'auto' ? BrandColors.teal[500] : colors.border,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => saveThemePreference('auto')}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={24} 
                  color={themePreference === 'auto' ? BrandColors.teal[500] : colors.textMuted} 
                />
                <Text style={[
                  styles.themeOptionText,
                  { color: themePreference === 'auto' ? BrandColors.teal[500] : colors.text }
                ]}>
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={handleResetOnboarding}
          >
            <Ionicons name="refresh-outline" size={22} color={BrandColors.teal[500]} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              View Onboarding Again
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
              Sign Out
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textMuted }]}>
            RecruitFlow v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textMuted }]}>
            Made with ❤️ for better hiring
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.white,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  avatarSubtitle: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionsInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionItem: {
    fontSize: 13,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  methodOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  methodBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
});
