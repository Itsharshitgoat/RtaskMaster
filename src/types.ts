export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  priority?: Priority;
}
