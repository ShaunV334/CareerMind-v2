'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check, Loader } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { getWeekRange, formatDateKey, isToday } from '@/utils/dateHelpers';
import { Task } from '@/types/task';

const WeeklyTasksPage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const { tasks, notes, loading, error, fetchTasks, fetchNotes, saveNotes, addTask, updateTask, deleteTask } = useTasks();

  const { start: weekStart } = getWeekRange(currentWeek);
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const dayNames: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Fetch tasks and notes when week changes
  useEffect(() => {
    const startDate = formatDateKey(weekDays[0]);
    const endDate = formatDateKey(weekDays[6]);
    fetchTasks(startDate, endDate);
    fetchNotes();
  }, [currentWeek]);

  // Sync notesText with notes from hook
  useEffect(() => {
    setNotesText(notes);
  }, [notes]);

  const navigateWeek = (direction: number): void => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const handleAddTask = (dayIndex: number): void => {
    if (!newTaskText.trim()) return;
    
    const dateKey = formatDateKey(weekDays[dayIndex]);
    addTask(dateKey, {
      text: newTaskText,
      completed: false
    });
    
    setNewTaskText('');
    setActiveDay(null);
  };

  const formatDate = (date: Date): string => {
    return date.getDate().toString().padStart(2, '0');
  };

  if (loading && Object.keys(tasks).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && Object.keys(tasks).length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-4">
            Error loading tasks: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-foreground">Weekly Tasks</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl shadow-sm border border-border overflow-hidden">
          {weekDays.map((day, index) => {
            const dateKey = formatDateKey(day);
            const dayTasks: Task[] = tasks[dateKey] || [];
            const today = isToday(day);
            
            return (
              <div 
                key={index} 
                className={`min-h-[400px] p-4 bg-card ${
                  today ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
              >
                {/* Day Header */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {dayNames[index]}
                  </div>
                  <div className={`text-2xl font-light ${
                    today ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                  }`}>
                    {formatDate(day)}
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2 mb-4">
                  {dayTasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        onClick={() => updateTask(dateKey, task.id, { completed: !task.completed })}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground hover:border-foreground'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm min-w-0 ${
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(dateKey, task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all flex-shrink-0"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Task */}
                {activeDay === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskText(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => 
                        e.key === 'Enter' && handleAddTask(index)
                      }
                      placeholder="Add a task..."
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddTask(index)}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setActiveDay(null);
                          setNewTaskText('');
                        }}
                        className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveDay(index)}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add task
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Notes Section */}
        <div className="mt-8 bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Someday / Notes</h3>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.currentTarget.value)}
            onBlur={() => saveNotes(notesText)}
            placeholder="Add notes, ideas, or tasks for someday..."
            className="w-full h-32 p-4 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyTasksPage;
