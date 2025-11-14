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

    // Create task in Google Tasks
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await supabase.functions.invoke('create-task', {
          body: {
            title,
            notes: description,
            due: dueDate,
            candidateId,
            candidateName: assignedToName,
            userId: assignedTo,
            userName: assignedToName,
          },
        });

        // Update task with Google Task ID if successful
        if (response.data?.taskId) {
          await supabase
            .from('tasks')
            .update({ google_task_id: response.data.taskId })
            .eq('id', data.id);
        }
      }
    } catch (error) {
      console.log('Failed to create Google Task:', error);
      // Don't fail the whole operation if Google Tasks fails
    }

    // Log activity
    try {
      const activityData: any = {
        candidate_id: candidateId,
        activity_type: 'task_created',
        description: `Task created: ${title}`,
        created_by_name: assignedToName || 'Recruiter',
      };
      
      // Only add created_by if we have a valid UUID
      if (assignedTo && assignedTo.length > 0) {
        activityData.created_by = assignedTo;
      }
      
      const { error: activityError } = await supabase.from('activities').insert(activityData);
      
      if (activityError) {
        console.error('Failed to log activity:', activityError);
      } else {
        console.log('Activity logged successfully for task:', title);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
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
