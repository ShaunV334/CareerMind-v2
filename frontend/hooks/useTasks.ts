import { useState, useEffect } from 'react';
import { Tasks, Task } from '@/types/task';
import { useAuth } from '@/lib/auth-context';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Tasks>({});
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tasks from API
  const fetchTasks = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const url = new URL('http://localhost:3000/api/tasks');
      if (startDate) url.searchParams.append('startDate', startDate);
      if (endDate) url.searchParams.append('endDate', endDate);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setTasks(data.tasks || {});
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes from API
  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:3000/api/tasks/notes/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      setNotes(data.notes || '');
    } catch (err: any) {
      console.error('Error fetching notes:', err);
    }
  };

  // Save notes to API
  const saveNotes = async (content: string) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:3000/api/tasks/notes/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to save notes');
      
      setNotes(content);
    } catch (err: any) {
      console.error('Error saving notes:', err);
    }
  };

  const addTask = async (date: string, task: Omit<Task, 'id' | 'createdAt'>): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          ...task,
        }),
      });

      if (!response.ok) throw new Error('Failed to add task');

      const newTask = await response.json();
      
      setTasks(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), newTask],
      }));
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding task:', err);
    }
  };

  const updateTask = async (date: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      
      setTasks(prev => ({
        ...prev,
        [date]: prev[date].map(t => t.id === taskId ? updatedTask : t),
      }));
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (date: string, taskId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(prev => ({
        ...prev,
        [date]: prev[date].filter(task => task.id !== taskId),
      }));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting task:', err);
    }
  };

  return { tasks, notes, loading, error, fetchTasks, fetchNotes, saveNotes, addTask, updateTask, deleteTask };
};
