import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./config/service";

interface Task {
  id: string; // Ensure this matches the backend's `_id` field
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  description: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = ["TODO", "IN_PROGRESS", "DONE"];

  useEffect(() => {
    const loadTasks = async () => {
      const tasksData = await fetchTasks();
      setTasks(tasksData);
    };
    loadTasks();
  }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (source.droppableId === "DONE") return;

    if (
      source.droppableId === "IN_PROGRESS" &&
      destination.droppableId === "TODO"
    ) {
      return;
    }

    const updatedTasks = [...tasks];
    const movedTask = updatedTasks.find((task) => task.id === draggableId);
    if (movedTask) {
      try {
        movedTask.status = destination.droppableId;
        await updateTask(movedTask.id, { status: movedTask.status });
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTaskData = {
        title: newTask.title,
        description: newTask.description,
        status: "TODO",
      };
      const createdTask = await createTask(newTaskData);
      setTasks([...tasks, createdTask]);
      handleCloseCreateModal();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      try {
        const updatedTask = {
          title: newTask.title,
          description: newTask.description,
          status: editingTask.status, // Ensure status is preserved
        };
        const updatedTaskFromServer = await updateTask(
          editingTask.id,
          updatedTask
        );
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id
              ? { ...updatedTaskFromServer, id: editingTask.id }
              : task
          )
        );
        handleCloseModal();
      } catch (error) {
        console.error("Error editing task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateForm(true);
    setNewTask({ title: "", description: "" });
  };

  const handleCloseCreateModal = () => {
    setShowCreateForm(false);
    setNewTask({ title: "", description: "" });
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setNewTask({ title: "", description: "" });
    setEditingTask(null);
    setIsEditMode(false);
  };

  const handleCardClick = (task: Task) => {
    setNewTask({ title: task.title, description: task.description });
    setEditingTask(task);
    setIsEditMode(false);
    setShowForm(true);
  };

  const handleEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setNewTask({ title: task.title, description: task.description });
    setEditingTask(task);
    setIsEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="jira-board">
      <header className="board-header">
        <h1 className="">Task Management</h1>
        <button className="add-task-btn" onClick={handleOpenCreateModal}>
          + Add Task
        </button>
      </header>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                required
              />
              <div className="modal-actions">
                <button type="submit">Create Task</button>
                <button type="button" onClick={handleCloseCreateModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditMode ? "Edit Task" : "View Task"}</h2>
            <form onSubmit={handleEditTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
                readOnly={!isEditMode}
                className={!isEditMode ? "readonly-input" : ""}
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                required
                readOnly={!isEditMode}
                className={!isEditMode ? "readonly-input" : ""}
              />
              <div className="modal-actions">
                {isEditMode ? (
                  <>
                    <button type="submit">Save Changes</button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(editingTask!.id)}
                    >
                      Delete Task
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsEditMode(true)}>
                      Edit
                    </button>
                    <button type="button" onClick={handleCloseModal}>
                      Close
                    </button>
                  </>
                )}
                {isEditMode && (
                  <button type="button" onClick={handleCloseModal}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-columns">
          {columns.map((column) => (
            <div key={column} className="board-column">
              <h2>{column.replace("_", " ")}</h2>
              <Droppable droppableId={column}>
                {(provided, snapshot) => (
                  <div
                    className={`task-list ${
                      snapshot.isDraggingOver ? "dragging-over" : ""
                    }`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {tasks
                      .filter((task) => task.status === column)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${
                                snapshot.isDragging ? "dragging" : ""
                              }`}
                              onClick={() => handleCardClick(task)}
                            >
                              <h3>{task.title}</h3>
                              <p>{task.description}</p>
                              <button
                                className="edit-btn"
                                onClick={(e) => handleEditClick(e, task)}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
