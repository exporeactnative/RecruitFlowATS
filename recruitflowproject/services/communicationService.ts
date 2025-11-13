import { supabase } from '@/lib/supabase';
import * as MailComposer from 'expo-mail-composer';
import { Linking, Platform } from 'react-native';

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
  
  // Make a phone call (opens native dialer)
  async makeCall(phoneNumber: string, candidateId: string, userId: string, userName: string, candidateName?: string): Promise<void> {
    const url = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Simulator or device without phone capability
      console.log('Phone call not available on this device (simulator). Logging activity only.');
    }
    
    // Always log the call attempt in database (even in simulator for testing)
    await supabase.from('calls').insert({
      candidate_id: candidateId,
      call_type: 'outbound',
      phone_number: phoneNumber,
      status: canOpen ? 'initiated' : 'simulated',
      created_by: userId || null,
      created_by_name: userName,
    });

    // Log activity with candidate name
    const description = candidateName 
      ? `Called ${candidateName} at ${phoneNumber}`
      : `Called ${phoneNumber}`;
    
    await supabase.from('activities').insert({
      candidate_id: candidateId,
      activity_type: 'call',
      description,
      created_by: userId || null,
      created_by_name: userName,
    });
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

  // Log a completed call
  async logCall(
    candidateId: string,
    phoneNumber: string,
    duration: number,
    notes: string,
    userId: string,
    userName: string
  ): Promise<Call> {
    const { data, error } = await supabase
      .from('calls')
      .insert({
        candidate_id: candidateId,
        call_type: 'outbound',
        phone_number: phoneNumber,
        duration,
        notes,
        status: 'completed',
        created_by: userId,
        created_by_name: userName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ===== SMS MESSAGES =====

  // Send SMS (opens native SMS app)
  async sendSMS(phoneNumber: string, message: string, candidateId: string, userId: string, userName: string, candidateName?: string): Promise<void> {
    const url = Platform.select({
      ios: `sms:${phoneNumber}&body=${encodeURIComponent(message)}`,
      android: `sms:${phoneNumber}?body=${encodeURIComponent(message)}`,
      default: `sms:${phoneNumber}`,
    });

    const canOpen = await Linking.canOpenURL(url!);
    
    if (canOpen) {
      await Linking.openURL(url!);
    } else {
      console.log('SMS not available on this device (simulator). Logging activity only.');
    }
    
    // Always log the SMS in database (even in simulator for testing)
    await supabase.from('sms_messages').insert({
      candidate_id: candidateId,
      direction: 'outbound',
      phone_number: phoneNumber,
      message_body: message,
      status: canOpen ? 'sent' : 'simulated',
      created_by: userId || null,
      created_by_name: userName,
    });

    // Log activity with candidate name
    const description = candidateName 
      ? `SMS sent to ${candidateName}`
      : `SMS sent to ${phoneNumber}`;
    
    await supabase.from('activities').insert({
      candidate_id: candidateId,
      activity_type: 'sms',
      description,
      created_by: userId || null,
      created_by_name: userName,
    });
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

  // Send email (opens native email composer)
  async sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    candidateId: string,
    userId: string,
    userName: string,
    candidateName?: string
  ): Promise<void> {
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Email is not available on this device');
    }

    const result = await MailComposer.composeAsync({
      recipients: [toEmail],
      subject,
      body,
    });

    if (result.status === 'sent') {
      // Log the email in database
      await supabase.from('emails').insert({
        candidate_id: candidateId,
        direction: 'outbound',
        to_email: toEmail,
        from_email: userName, // You might want to use actual email
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
};
