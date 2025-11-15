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
