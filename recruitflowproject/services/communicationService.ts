import { supabase } from '@/lib/supabase';
import * as MailComposer from 'expo-mail-composer';
import { Linking, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Call {
  id: string;
  candidate_id: string;
  call_type: 'inbound' | 'outbound';
  phone_number: string;
  duration?: number;
  status?: string;
  recording_url?: string;
  notes?: string;
  twilio_call_sid?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface SMS {
  id: string;
  candidate_id: string;
  direction: 'inbound' | 'outbound';
  phone_number: string;
  message_body: string;
  status?: string;
  twilio_message_sid?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

export interface Email {
  id: string;
  candidate_id: string;
  direction: 'inbound' | 'outbound';
  to_email: string;
  from_email: string;
  subject?: string;
  body: string;
  html_body?: string;
  status: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

export const communicationService = {
  // ===== PHONE CALLS =====
  
  // Make a phone call via Twilio Edge Function
  async makeCall(phoneNumber: string, candidateId: string, userId: string, userName: string, candidateName?: string): Promise<void> {
    try {
      // Call Twilio via Edge Function
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: {
          to: phoneNumber,
          candidateId,
          candidateName,
          userId,
          userName,
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Twilio Edge Function failed: ${error.message || 'Unknown error'}`);
      }

      // Check if the Edge Function actually succeeded
      if (!data || !data.success) {
        throw new Error(data?.error || 'Twilio call failed - no response from server');
      }

      // Log the call in database only if successful
      await supabase.from('calls').insert({
        candidate_id: candidateId,
        call_type: 'outbound',
        phone_number: phoneNumber,
        status: 'initiated',
        twilio_call_sid: data?.callSid,
        created_by: userId || null,
        created_by_name: userName,
      });

      // Log activity with candidate name
      const description = candidateName 
        ? `Called ${candidateName} at ${phoneNumber} via Twilio`
        : `Called ${phoneNumber} via Twilio`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'call',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error: any) {
      console.error('Twilio call failed:', error);
      // Provide specific error message
      const errorMessage = error.message || 'Failed to initiate call via Twilio';
      throw new Error(errorMessage);
    }
  },

  // Get call history for a candidate
  async getCallHistory(candidateId: string): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Log a call (simple version for native calls)
  async logCall(
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    try {
      await supabase.from('calls').insert({
        candidate_id: candidateId,
        call_type: 'outbound',
        phone_number: 'N/A',
        status: 'completed',
        created_by: userId || null,
        created_by_name: userName,
      });

      const description = candidateName 
        ? `Called ${candidateName} via native phone app`
        : `Made call via native phone app`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'call',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error) {
      console.error('Failed to log call:', error);
    }
  },

  // Log an SMS (simple version for native SMS)
  async logSMS(
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    try {
      await supabase.from('sms_messages').insert({
        candidate_id: candidateId,
        direction: 'outbound',
        phone_number: 'N/A',
        message_body: 'Sent via native messaging app',
        status: 'sent',
        created_by: userId || null,
        created_by_name: userName,
      });

      const description = candidateName 
        ? `SMS sent to ${candidateName} via native app`
        : `SMS sent via native app`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'sms',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error) {
      console.error('Failed to log SMS:', error);
    }
  },

  // Log an email (simple version for native email)
  async logEmail(
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    try {
      await supabase.from('emails').insert({
        candidate_id: candidateId,
        direction: 'outbound',
        to_email: 'N/A',
        from_email: 'N/A',
        subject: 'Sent via native email app',
        body: '',
        status: 'sent',
        created_by: userId || null,
        created_by_name: userName,
      });

      const description = candidateName 
        ? `Email sent to ${candidateName} via native app`
        : `Email sent via native app`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'email',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  },

  // ===== SMS MESSAGES =====

  // Send SMS via Twilio Edge Function
  async sendSMS(phoneNumber: string, message: string, candidateId: string, userId: string, userName: string, candidateName?: string): Promise<void> {
    try {
      // Send SMS via Twilio Edge Function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: phoneNumber,
          message,
          candidateId,
          candidateName,
          userId,
          userName,
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Twilio Edge Function failed: ${error.message || 'Unknown error'}`);
      }

      // Check if the Edge Function actually succeeded
      if (!data || !data.success) {
        throw new Error(data?.error || 'SMS send failed - no response from server');
      }

      // Log the SMS in database only if successful
      await supabase.from('sms_messages').insert({
        candidate_id: candidateId,
        direction: 'outbound',
        phone_number: phoneNumber,
        message_body: message,
        status: 'sent',
        twilio_message_sid: data?.messageSid,
        created_by: userId || null,
        created_by_name: userName,
      });

      // Log activity with candidate name
      const description = candidateName 
        ? `SMS sent to ${candidateName} via Twilio`
        : `SMS sent to ${phoneNumber} via Twilio`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'sms',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error: any) {
      console.error('Twilio SMS failed:', error);
      // Provide specific error message
      const errorMessage = error.message || 'Failed to send SMS via Twilio';
      throw new Error(errorMessage);
    }
  },

  // Get SMS history for a candidate
  async getSMSHistory(candidateId: string): Promise<SMS[]> {
    const { data, error } = await supabase
      .from('sms_messages')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ===== EMAIL =====

  // Send email via Gmail Edge Function
  async sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    try {
      // Send email via Edge Function (Gmail API)
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject,
          body,
          candidateId,
          candidateName,
          userId,
          userName,
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Gmail Edge Function failed: ${error.message || 'Unknown error'}`);
      }

      // Check if the Edge Function actually succeeded
      if (!data || !data.success) {
        throw new Error(data?.error || 'Email send failed - no response from server');
      }

      // Log the email in database only if successful
      await supabase.from('emails').insert({
        candidate_id: candidateId,
        direction: 'outbound',
        to_email: toEmail,
        from_email: 'admin@bjsllc.com',
        subject,
        body,
        status: 'sent',
        created_by: userId || null,
        created_by_name: userName,
      });

      // Log activity with candidate name
      const description = candidateName 
        ? `Email sent to ${candidateName}: ${subject}`
        : `Email sent: ${subject}`;
      
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'email',
        description,
        created_by: userId || null,
        created_by_name: userName,
      });
    } catch (error: any) {
      console.error('Email send failed:', error);
      // Provide specific error message
      const errorMessage = error.message || 'Failed to send email via Gmail';
      throw new Error(errorMessage);
    }
  },

  // Get email history for a candidate
  async getEmailHistory(candidateId: string): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ===== TWILIO INTEGRATION (Server-side) =====
  // Note: These would typically be called from a backend API
  // For security, Twilio credentials should never be in the mobile app

  // Placeholder for Twilio call via backend API
  async makeTwilioCall(phoneNumber: string, candidateId: string): Promise<void> {
    // This would call your backend API endpoint
    // Example: POST /api/twilio/call
    // Backend would use Twilio SDK to initiate the call
    console.log('Twilio call would be initiated via backend API');
    throw new Error('Twilio integration requires backend API setup');
  },

  // Placeholder for Twilio SMS via backend API
  async sendTwilioSMS(phoneNumber: string, message: string, candidateId: string): Promise<void> {
    // This would call your backend API endpoint
    // Example: POST /api/twilio/sms
    // Backend would use Twilio SDK to send the SMS
    console.log('Twilio SMS would be sent via backend API');
    throw new Error('Twilio integration requires backend API setup');
  },

  // ===== PREFERENCE MANAGEMENT =====

  async getCallPreference(): Promise<'twilio' | 'native'> {
    try {
      const pref = await AsyncStorage.getItem('call_method');
      return (pref as 'twilio' | 'native') || 'twilio'; // Default to Twilio
    } catch {
      return 'twilio';
    }
  },

  async getSMSPreference(): Promise<'twilio' | 'native'> {
    try {
      const pref = await AsyncStorage.getItem('sms_method');
      return (pref as 'twilio' | 'native') || 'twilio'; // Default to Twilio
    } catch {
      return 'twilio';
    }
  },

  async getEmailPreference(): Promise<'gmail' | 'native'> {
    try {
      const pref = await AsyncStorage.getItem('email_method');
      return (pref as 'gmail' | 'native') || 'native'; // Default to native for email
    } catch {
      return 'native';
    }
  },

  // ===== SMART COMMUNICATION METHODS (WITH PREFERENCES) =====

  // Smart call - uses preference with fallback
  async smartCall(
    phoneNumber: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    const preference = await this.getCallPreference();
    
    if (preference === 'twilio') {
      try {
        await this.makeCall(phoneNumber, candidateId, userId, userName, candidateName);
        Alert.alert('Call Initiated', 'Your phone will ring shortly. Answer to connect with the candidate.');
      } catch (error: any) {
        console.error('Twilio call failed, falling back to native:', error);
        Alert.alert(
          'Twilio Unavailable',
          'Falling back to native phone app. ' + (error.message || ''),
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Phone', 
              onPress: async () => {
                await Linking.openURL(`tel:${phoneNumber}`);
                await this.logCall(candidateId, userId, userName, candidateName);
              }
            }
          ]
        );
      }
    } else {
      // Native phone app
      const canOpen = await Linking.canOpenURL(`tel:${phoneNumber}`);
      if (canOpen) {
        await Linking.openURL(`tel:${phoneNumber}`);
        await this.logCall(candidateId, userId, userName, candidateName);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    }
  },

  // Smart SMS - uses preference with fallback
  async smartSMS(
    phoneNumber: string,
    message: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    const preference = await this.getSMSPreference();
    
    if (preference === 'twilio') {
      try {
        await this.sendSMS(phoneNumber, message, candidateId, userId, userName, candidateName);
        Alert.alert('SMS Sent', 'Message sent via Twilio successfully!');
      } catch (error: any) {
        console.error('Twilio SMS failed, falling back to native:', error);
        Alert.alert(
          'Twilio Unavailable',
          'Falling back to native messaging app. ' + (error.message || ''),
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Messages', 
              onPress: async () => {
                await Linking.openURL(`sms:${phoneNumber}`);
                await this.logSMS(candidateId, userId, userName, candidateName);
              }
            }
          ]
        );
      }
    } else {
      // Native messaging app
      const canOpen = await Linking.canOpenURL(`sms:${phoneNumber}`);
      if (canOpen) {
        await Linking.openURL(`sms:${phoneNumber}`);
        await this.logSMS(candidateId, userId, userName, candidateName);
      } else {
        Alert.alert('Error', 'Unable to send SMS on this device');
      }
    }
  },

  // Smart email - uses preference with fallback
  async smartEmail(
    email: string,
    subject: string,
    body: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    const preference = await this.getEmailPreference();
    
    if (preference === 'gmail') {
      try {
        await this.sendEmail(email, subject, body, candidateId, userId, userName, candidateName);
        Alert.alert('Email Sent', 'Email sent via Gmail API successfully!');
      } catch (error: any) {
        console.error('Gmail API failed, falling back to native:', error);
        Alert.alert(
          'Gmail API Unavailable',
          'Opening native email client. ' + (error.message || ''),
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Email', 
              onPress: async () => {
                const encodedSubject = encodeURIComponent(subject);
                const encodedBody = encodeURIComponent(body);
                await Linking.openURL(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`);
                await this.logEmail(candidateId, userId, userName, candidateName);
              }
            }
          ]
        );
      }
    } else {
      // Native email client
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      const canOpen = await Linking.canOpenURL(`mailto:${email}`);
      if (canOpen) {
        await Linking.openURL(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`);
        await this.logEmail(candidateId, userId, userName, candidateName);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    }
  },

  // ===== API WRAPPERS WITH BETTER ERROR HANDLING =====

  // Send email via Gmail API with result
  async sendEmailViaAPI(
    toEmail: string,
    subject: string,
    body: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sendEmail(toEmail, subject, body, candidateId, userId, userName, candidateName);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send email' };
    }
  },

  // Make call via Twilio API with result
  async makeCallViaAPI(
    phoneNumber: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeCall(phoneNumber, candidateId, userId, userName, candidateName);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to make call' };
    }
  },

  // Send SMS via Twilio API with result
  async sendSMSViaAPI(
    phoneNumber: string,
    message: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sendSMS(phoneNumber, message, candidateId, userId, userName, candidateName);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send SMS' };
    }
  },
};
