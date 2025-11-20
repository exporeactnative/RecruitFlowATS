import { supabase } from '@/lib/supabase';
import * as Calendar from 'expo-calendar';
import { activitiesService } from './activitiesService';
import { Platform } from 'react-native';

export interface CalendarEvent {
  id: string;
  candidate_id: string;
  title: string;
  description?: string;
  event_type: 'interview' | 'phone_screen' | 'meeting' | 'follow_up';
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  attendees?: string[];
  google_event_id?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export const calendarService = {
  // Request calendar permissions
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  },

  // Get device calendars
  async getDeviceCalendars() {
    if (Platform.OS === 'web') return [];
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  },

  // Get all events for a candidate
  async getEvents(candidateId: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get ALL events (for Schedule tab) - including past events
  async getAllUpcomingEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create a new event
  async createEvent(
    candidateId: string,
    title: string,
    description?: string,
    eventType: CalendarEvent['event_type'] = 'interview',
    startTime?: string,
    endTime?: string,
    location?: string,
    meetingLink?: string,
    createdBy?: string,
    createdByName?: string,
    addToDeviceCalendar: boolean = false
  ): Promise<CalendarEvent> {
    // Create in Supabase
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        candidate_id: candidateId,
        title,
        description: description || null,
        event_type: eventType,
        start_time: startTime || new Date().toISOString(),
        end_time: endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        location: location || null,
        meeting_link: meetingLink || null,
        attendees: null,
        created_by: createdBy || null,
        created_by_name: createdByName || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Add to device calendar if requested
    if (addToDeviceCalendar && Platform.OS !== 'web') {
      try {
        const hasPermission = await this.requestPermissions();
        if (hasPermission) {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find((cal) => cal.allowsModifications);
          
          if (defaultCalendar) {
            await Calendar.createEventAsync(defaultCalendar.id, {
              title,
              notes: description,
              startDate: startTime,
              endDate: endTime,
              location,
            });
          }
        }
      } catch (err) {
        console.error('Failed to add to device calendar:', err);
      }
    }

    // Log activity with detailed description
    if (startTime) {
      const eventTypeLabel = eventType.replace('_', ' ');
      const startDateTime = new Date(startTime);
      const timeStr = startDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const dateStr = startDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      await activitiesService.createActivity(
        candidateId,
        'interview_scheduled',
        `Scheduled ${eventTypeLabel} - ${timeStr}, ${dateStr}${location ? ` at ${location}` : ''}`,
        createdBy,
        createdByName
      );
    }

    return data;
  },

  // Update an event
  async updateEvent(
    eventId: string,
    title: string,
    description?: string,
    eventType?: CalendarEvent['event_type'],
    startTime?: string,
    endTime?: string,
    location?: string,
    meetingLink?: string
  ): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title,
        description: description || null,
        event_type: eventType || 'interview',
        start_time: startTime,
        end_time: endTime,
        location: location || null,
        meeting_link: meetingLink || null,
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
    if (error) throw error;
  },

  // Subscribe to realtime event updates
  subscribeToEvents(
    candidateId: string, 
    onUpdate: (event: CalendarEvent) => void,
    onDelete?: (eventId: string) => void
  ) {
    const channelName = candidateId ? `calendar_events:${candidateId}` : 'calendar_events:all';
    
    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table: 'calendar_events',
    };
    
    // Only add filter if candidateId is provided
    if (candidateId) {
      channelConfig.filter = `candidate_id=eq.${candidateId}`;
    }
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(payload.new as CalendarEvent);
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
