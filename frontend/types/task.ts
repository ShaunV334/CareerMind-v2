export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
}

export interface Tasks {
  [date: string]: Task[];
}
