import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
  candidate_id: string;
  content: string;
  note_type: 'general' | 'interview' | 'phone_screen' | 'reference' | 'follow_up';
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export const notesService = {
  // Get all notes for a candidate
  async getNotes(candidateId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new note
  async createNote(
    candidateId: string,
    content: string,
    noteType: Note['note_type'],
    createdBy: string,
    createdByName: string
  ): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        candidate_id: candidateId,
        content,
        note_type: noteType,
        created_by: createdBy || null,
        created_by_name: createdByName,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity (only if we have a valid user ID)
    if (createdBy) {
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'note_added',
        description: `Note added: ${noteType}`,
        created_by: createdBy,
        created_by_name: createdByName,
      });
    }

    return data;
  },

  // Update a note
  async updateNote(noteId: string, content: string): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) throw error;
  },

  // Subscribe to realtime notes updates
  subscribeToNotes(candidateId: string, callback: (note: Note) => void) {
    const channel = supabase
      .channel(`notes:${candidateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `candidate_id=eq.${candidateId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as Note);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
