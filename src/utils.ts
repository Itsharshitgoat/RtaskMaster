import { Icon, Color } from "@raycast/api";
import { Task, Priority } from "./types";

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 1. Incomplete first
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // 2. Due date (earliest first)
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate - b.dueDate;
      }
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }

    // 3. Priority
    const priorityWeight = { high: 3, medium: 2, low: 1, undefined: 0 };
    const aWeight =
      priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
    const bWeight =
      priorityWeight[b.priority as keyof typeof priorityWeight] || 0;

    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }

    // 4. Creation date (newest first)
    return b.createdAt - a.createdAt;
  });
}

export function getStatusIcon(completed: boolean) {
  return completed
    ? { source: Icon.CheckCircle, tintColor: Color.Green }
    : { source: Icon.Circle, tintColor: Color.SecondaryText };
}

export function getPriorityIcon(priority?: Priority) {
  switch (priority) {
    case "high":
      return { value: "🔥", tooltip: "High Priority" };
    case "medium":
      return { value: "⚡", tooltip: "Medium Priority" };
    case "low":
      return { value: "🔽", tooltip: "Low Priority" };
    default:
      return undefined;
  }
}

export function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
