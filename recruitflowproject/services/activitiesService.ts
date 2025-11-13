import { supabase } from '@/lib/supabase';

export interface Activity {
  id: string;
  candidate_id: string;
  activity_type: 'call' | 'sms' | 'email' | 'note' | 'status_change' | 'interview_scheduled' | 'task_created';
  description: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export const activitiesService = {
  // Get recent activities across all candidates
  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get activities for a specific candidate
  async getCandidateActivities(candidateId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new activity
  async createActivity(
    candidateId: string,
    activityType: Activity['activity_type'],
    description: string,
    createdBy: string = '',
    createdByName: string = 'Recruiter'
  ): Promise<Activity> {
    const activityData: any = {
      candidate_id: candidateId,
      activity_type: activityType,
      description,
      created_by: createdBy && createdBy.trim() !== '' ? createdBy : null,
      created_by_name: createdByName,
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
