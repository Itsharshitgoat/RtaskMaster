import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { addTask } from "./storage";
import { Priority, Task } from "./types";

interface FormValues {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: string;
}

interface AddTaskProps {
  onTaskAdded?: () => void;
}

export default function AddTask({ onTaskAdded }: AddTaskProps) {
  const { pop } = useNavigation();
  const [titleError, setTitleError] = useState<string | undefined>();

  async function handleSubmit(values: FormValues) {
    if (!values.title) {
      setTitleError("The field is required");
      return;
    }

    try {
      const now = Date.now();
      const newTask: Task = {
        id: uuidv4(),
        title: values.title,
        description: values.description || undefined,
        completed: false,
        createdAt: now,
        updatedAt: now,
        dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
        priority: (values.priority as Priority) || undefined,
      };

      await addTask(newTask);
      await showToast({ style: Toast.Style.Success, title: "Task added" });

      if (onTaskAdded) {
        onTaskAdded();
      }
      pop(); // go back if pushed onto the nav stack
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to add task",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Task" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter task title"
        error={titleError}
        onChange={() => setTitleError(undefined)}
      />
      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Optional description"
      />
      <Form.DatePicker id="dueDate" title="Due Date" />
      <Form.Dropdown id="priority" title="Priority" defaultValue="">
        <Form.Dropdown.Item value="" title="None" />
        <Form.Dropdown.Item value="low" title="Low" />
        <Form.Dropdown.Item value="medium" title="Medium" />
        <Form.Dropdown.Item value="high" title="High" />
      </Form.Dropdown>
    </Form>
  );
}
