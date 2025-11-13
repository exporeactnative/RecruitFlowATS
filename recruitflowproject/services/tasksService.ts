import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  candidate_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  assigned_to_name: string;
  google_task_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const tasksService = {
  // Get all tasks for a candidate
  async getTasks(candidateId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get tasks assigned to a user
  async getMyTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create a new task
  async createTask(
    candidateId: string,
    title: string,
    description?: string,
    dueDate?: string,
    priority: Task['priority'] = 'medium',
    assignedTo?: string,
    assignedToName?: string
  ): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        candidate_id: candidateId,
        title,
        description: description || null,
        due_date: dueDate || null,
        priority,
        assigned_to: assignedTo || null,
        assigned_to_name: assignedToName || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity (only if we have a user ID)
    if (assignedTo) {
      await supabase.from('activities').insert({
        candidate_id: candidateId,
        activity_type: 'task_created',
        description: `Task created: ${title}`,
        created_by: assignedTo,
        created_by_name: assignedToName,
      });
    }

    return data;
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update task
  async updateTask(
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'due_date' | 'priority'>>
  ): Promise<Task> {
    const { data, error} = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  // Subscribe to realtime task updates
  subscribeToTasks(candidateId: string, callback: (task: Task) => void) {
    const channel = supabase
      .channel(`tasks:${candidateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `candidate_id=eq.${candidateId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as Task);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
