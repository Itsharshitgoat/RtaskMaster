import {
  List,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { deleteTask, getTasks, updateTask } from "./storage";
import { Task } from "./types";
import { formatDate, getPriorityIcon, getStatusIcon, sortTasks } from "./utils";
import AddTask from "./add-task";
import EditTask from "./edit-task";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(sortTasks(fetchedTasks));
    } catch (error) {
      showToast({ style: Toast.Style.Failure, title: "Failed to load tasks" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function toggleCompletion(task: Task) {
    const updatedTask = {
      ...task,
      completed: !task.completed,
      updatedAt: Date.now(),
    };
    await updateTask(updatedTask);
    await loadTasks();
    showToast({
      style: Toast.Style.Success,
      title: updatedTask.completed ? "Task completed" : "Task pending",
    });
  }

  async function handleDelete(taskId: string) {
    await deleteTask(taskId);
    await loadTasks();
    showToast({ style: Toast.Style.Success, title: "Task deleted" });
  }

  const filteredTasks = tasks.filter((task) => {
    const query = searchText.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.priority && task.priority.toLowerCase().includes(query)) ||
      (query === "completed" && task.completed) ||
      (query === "pending" && !task.completed)
    );
  });

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search tasks by title, priority, 'completed', or 'pending'..."
      actions={
        <ActionPanel>
          <Action.Push
            title="Add Task"
            icon={Icon.Plus}
            target={<AddTask onTaskAdded={loadTasks} />}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
          />
        </ActionPanel>
      }
    >
      <List.EmptyView
        title="No tasks found"
        description="Press ⌘+N to add a new task"
        icon={Icon.List}
      />
      {filteredTasks.map((task) => {
        const priorityIcon = getPriorityIcon(task.priority);
        const accessories = [];

        if (priorityIcon) {
          accessories.push({
            text: priorityIcon.value,
            tooltip: priorityIcon.tooltip,
          });
        }
        if (task.dueDate) {
          accessories.push({
            date: new Date(task.dueDate),
            tooltip: `Due: ${formatDate(task.dueDate)}`,
            icon: Icon.Calendar,
          });
        }

        return (
          <List.Item
            key={task.id}
            title={task.title}
            subtitle={task.description}
            icon={getStatusIcon(task.completed)}
            accessories={accessories}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title={
                      task.completed ? "Mark as Pending" : "Mark as Completed"
                    }
                    icon={task.completed ? Icon.Circle : Icon.CheckCircle}
                    onAction={() => toggleCompletion(task)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action.Push
                    title="Edit Task"
                    icon={Icon.Pencil}
                    target={<EditTask task={task} onTaskUpdated={loadTasks} />}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action
                    title="Delete Task"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => handleDelete(task.id)}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action.Push
                    title="Add New Task"
                    icon={Icon.Plus}
                    target={<AddTask onTaskAdded={loadTasks} />}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
