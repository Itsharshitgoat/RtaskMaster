import { LocalStorage } from "@raycast/api";
import { Task } from "./types";

const STORAGE_KEY = "tasks";

export async function getTasks(): Promise<Task[]> {
  const item = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!item) {
    return [];
  }
  try {
    return JSON.parse(item) as Task[];
  } catch (error) {
    console.error("Failed to parse tasks from storage", error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export async function addTask(task: Task): Promise<void> {
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
}

export async function updateTask(updatedTask: Task): Promise<void> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    await saveTasks(tasks);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const tasks = await getTasks();
  const filteredTasks = tasks.filter((t) => t.id !== taskId);
  await saveTasks(filteredTasks);
}
