import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { updateTask } from "./storage";
import { Priority, Task } from "./types";

interface FormValues {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: string;
}

interface EditTaskProps {
  task: Task;
  onTaskUpdated?: () => void;
}

export default function EditTask({ task, onTaskUpdated }: EditTaskProps) {
  const { pop } = useNavigation();
  const [titleError, setTitleError] = useState<string | undefined>();

  async function handleSubmit(values: FormValues) {
    if (!values.title) {
      setTitleError("The field is required");
      return;
    }

    try {
      const updatedTask: Task = {
        ...task,
        title: values.title,
        description: values.description || undefined,
        updatedAt: Date.now(),
        dueDate: values.dueDate ? values.dueDate.getTime() : undefined,
        priority: (values.priority as Priority) || undefined,
      };

      await updateTask(updatedTask);
      await showToast({ style: Toast.Style.Success, title: "Task updated" });

      if (onTaskUpdated) {
        onTaskUpdated();
      }
      pop(); // go back
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to update task",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Task" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        defaultValue={task.title}
        placeholder="Enter task title"
        error={titleError}
        onChange={() => setTitleError(undefined)}
      />
      <Form.TextArea
        id="description"
        title="Description"
        defaultValue={task.description || ""}
        placeholder="Optional description"
      />
      <Form.DatePicker
        id="dueDate"
        title="Due Date"
        defaultValue={task.dueDate ? new Date(task.dueDate) : null}
      />
      <Form.Dropdown
        id="priority"
        title="Priority"
        defaultValue={task.priority || ""}
      >
        <Form.Dropdown.Item value="" title="None" />
        <Form.Dropdown.Item value="low" title="Low" />
        <Form.Dropdown.Item value="medium" title="Medium" />
        <Form.Dropdown.Item value="high" title="High" />
      </Form.Dropdown>
    </Form>
  );
}
