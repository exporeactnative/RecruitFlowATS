import { supabase } from '@/lib/supabase';
import { Candidate, CandidateStatus, CandidateStage } from '@/types/candidate';

export interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  department: string;
  currentPosition?: string;
  currentCompany?: string;
  yearsOfExperience: number;
  source: string;
  recruiterId?: string;
  recruiterName?: string;
}

export const candidatesService = {
  // Get all candidates
  async getAllCandidates(): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get candidate by ID
  async getCandidateById(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get candidates by status
  async getCandidatesByStatus(status: CandidateStatus): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Search candidates
  async searchCandidates(query: string): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,position.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new candidate
  async createCandidate(input: CreateCandidateInput): Promise<Candidate> {
    const candidateData: any = {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone || null,
      location: input.location || null,
      position: input.position,
      department: input.department || null,
      current_position: input.currentPosition || null,
      current_company: input.currentCompany || null,
      years_of_experience: input.yearsOfExperience || 0,
      source: input.source || null,
      status: 'new',
      stage: 'Applied',
      recruiter_id: null,
      hiring_manager_id: null,
    };

    // Only add recruiter_id if it's provided and is a valid UUID
    if (input.recruiterId && input.recruiterId.trim() !== '' && input.recruiterId.length === 36) {
      candidateData.recruiter_id = input.recruiterId;
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single();

    if (error) throw error;

    // Don't log activity here - let the caller do it with more details
    return data;
  },

  // Update candidate
  async updateCandidate(
    id: string,
    updates: Partial<Candidate>
  ): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update candidate status
  async updateCandidateStatus(
    id: string,
    status: CandidateStatus,
    stage: CandidateStage,
    userId?: string,
    userName?: string
  ): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({ status, stage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activities').insert({
      candidate_id: id,
      activity_type: 'status_change',
      description: `Status changed to ${stage}`,
      created_by: userId,
      created_by_name: userName,
    });

    return data;
  },

  // Update candidate rating
  async updateCandidateRating(id: string, rating: number): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({ rating })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark candidate as viewed
  async markAsViewed(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .update({ viewed: true })
      .eq('id', id);

    if (error) {
      console.error('Failed to mark candidate as viewed:', error);
    }
  },

  // Delete candidate
  async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw error;
  },

  // Get candidate statistics by status
  async getCandidateStats(): Promise<Record<CandidateStatus, number>> {
    const { data, error } = await supabase
      .from('candidates')
      .select('status');

    if (error) throw error;

    const stats: Record<CandidateStatus, number> = {
      new: data?.filter((c) => c.status === 'new').length || 0,
      screening: data?.filter((c) => c.status === 'screening').length || 0,
      interview: data?.filter((c) => c.status === 'interview').length || 0,
      offer: data?.filter((c) => c.status === 'offer').length || 0,
      hired: data?.filter((c) => c.status === 'hired').length || 0,
      rejected: data?.filter((c) => c.status === 'rejected').length || 0,
      withdrawn: data?.filter((c) => c.status === 'withdrawn').length || 0,
    };

    return stats;
  },

  // Subscribe to all candidates changes (realtime)
  subscribeToAllCandidates(callback: (candidate: Candidate) => void) {
    const channel = supabase
      .channel('candidates_all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as Candidate);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Subscribe to specific candidate changes
  subscribeToCandidate(candidateId: string, callback: (candidate: Candidate) => void) {
    const channel = supabase
      .channel(`candidate_${candidateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `id=eq.${candidateId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            callback(payload.new as Candidate);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ===== ANALYTICS FUNCTIONS =====

  /**
   * Get candidates added in the last 7 days
   */
  async getCandidatesThisWeek(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('candidates')
      .select('id')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching candidates this week:', error);
      return 0;
    }

    return data?.length || 0;
  },

  /**
   * Calculate average time from 'new' status to 'hired' status
   * Returns average in days
   */
  async getAverageTimeToHire(): Promise<number> {
    const { data, error } = await supabase
      .from('candidates')
      .select('created_at, updated_at, status')
      .eq('status', 'hired');

    if (error || !data || data.length === 0) {
      return 0;
    }

    const totalDays = data.reduce((sum, candidate) => {
      const created = new Date(candidate.created_at);
      const hired = new Date(candidate.updated_at);
      const days = Math.floor((hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / data.length);
  },

  /**
   * Calculate offer acceptance rate
   * (hired / (hired + offers + rejected)) * 100
   */
  async getOfferAcceptanceRate(): Promise<number> {
    const { data: allCandidates, error } = await supabase
      .from('candidates')
      .select('status')
      .in('status', ['hired', 'offer', 'rejected']);

    if (error || !allCandidates || allCandidates.length === 0) {
      return 0;
    }

    const hired = allCandidates.filter(c => c.status === 'hired').length;
    const totalOffersExtended = allCandidates.length;
    
    if (totalOffersExtended === 0) return 0;
    
    return Math.round((hired / totalOffersExtended) * 100);
  },

  /**
   * Calculate conversion rates between pipeline stages
   */
  async getConversionRates(): Promise<{
    newToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerToHired: number;
  }> {
    const { data, error } = await supabase
      .from('candidates')
      .select('status');

    if (error || !data) {
      return {
        newToScreening: 0,
        screeningToInterview: 0,
        interviewToOffer: 0,
        offerToHired: 0,
      };
    }

    const statusCounts = {
      new: data.filter(c => c.status === 'new').length,
      screening: data.filter(c => c.status === 'screening').length,
      interview: data.filter(c => c.status === 'interview').length,
      offer: data.filter(c => c.status === 'offer').length,
      hired: data.filter(c => c.status === 'hired').length,
    };

    // Calculate conversion rates (what % moved to next stage)
    const newToScreening = statusCounts.new > 0 
      ? Math.round((statusCounts.screening / (statusCounts.new + statusCounts.screening)) * 100)
      : 0;
    
    const screeningToInterview = statusCounts.screening > 0
      ? Math.round((statusCounts.interview / (statusCounts.screening + statusCounts.interview)) * 100)
      : 0;
    
    const interviewToOffer = statusCounts.interview > 0
      ? Math.round((statusCounts.offer / (statusCounts.interview + statusCounts.offer)) * 100)
      : 0;
    
    const offerToHired = statusCounts.offer > 0
      ? Math.round((statusCounts.hired / (statusCounts.offer + statusCounts.hired)) * 100)
      : 0;

    return {
      newToScreening,
      screeningToInterview,
      interviewToOffer,
      offerToHired,
    };
  },
};
