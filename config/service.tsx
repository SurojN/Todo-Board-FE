import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Task {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  description: string;
}

export const fetchTasks = async () => {
  try {
    const response = await apiClient.get("/tasks");
    return response.data.map((task: any) => ({
      ...task,
      id: task._id, // Map `_id` to `id`
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const createTask = async (task: {
  title: string;
  description: string;
  status: string;
}) => {
  try {
    const response = await apiClient.post("/tasks", task);
    return { ...response.data, id: response.data._id }; // Map `_id` to `id`
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id: string, updatedTask: Partial<Task>) => {
  try {
    const response = await apiClient.put(`/tasks/${id}`, updatedTask);
    return { ...response.data, id: response.data._id }; // Map `_id` to `id`
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (id: string) => {
  try {
    await apiClient.delete(`/tasks/${id}`);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
