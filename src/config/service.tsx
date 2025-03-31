import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api", // Fallback to localhost
  headers: {
    "Content-Type": "application/json",
  },
});
export default apiClient;

export interface Task {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  description: string;
}

export const fetchTasks = async () => {
  try {
    const response = await apiClient.get("/tasks");
    return Array.isArray(response.data) ? response.data : []; // Ensure response is an array
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return []; // Return an empty array on error
  }
};

export const createTask = async (task: {
  title: string;
  description: string;
}) => {
  try {
    const response = await apiClient.post("/tasks", task);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id: string, updatedTask: Partial<Task>) => {
  try {
    const response = await apiClient.put(`/tasks/${id}`, updatedTask);
    return response.data;
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
