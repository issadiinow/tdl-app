import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [todoLists, setTodoLists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentEditingList, setCurrentEditingList] = useState(null);
  const [personName, setPersonName] = useState('');
  const [todoListTitle, setTodoListTitle] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Initialize with sample data
  useEffect(() => {
    const initialData = [
      {
        id: generateId(),
        name: "ISSA'S TDL",
        tasks: [
          { id: generateId(), text: "go for a swim", completed: false },
          { id: generateId(), text: "complete project", completed: false },
          { id: generateId(), text: "read a book", completed: true },
          { id: generateId(), text: "exercise routine", completed: false }
        ]
      },
      {
        id: generateId(),
        name: "WORK TASKS",
        tasks: [
          { id: generateId(), text: "finish report", completed: false },
          { id: generateId(), text: "team meeting", completed: true },
          { id: generateId(), text: "code review", completed: false }
        ]
      },
      {
        id: generateId(),
        name: "PERSONAL GOALS",
        tasks: [
          { id: generateId(), text: "learn new skill", completed: false },
          { id: generateId(), text: "plan vacation", completed: false },
          { id: generateId(), text: "organize files", completed: true }
        ]
      }
    ];
    setTodoLists(initialData);
  }, []);

  // Show confirmation modal
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (pendingAction) {
      pendingAction();
    }
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  // Create new todo list
  const handleCreateTodoList = () => {
    if (!personName.trim() || !todoListTitle.trim()) {
      alert('Please enter both name and TDL title');
      return;
    }

    const combinedName = `${personName.toUpperCase()}'S ${todoListTitle.toUpperCase()}`;
    const newTodoList = {
      id: generateId(),
      name: combinedName,
      tasks: []
    };

    setTodoLists(prevLists => [...prevLists, newTodoList]);
    setPersonName('');
    setTodoListTitle('');
    setShowCreateModal(false);
  };

  // Delete todo list
  const handleDeleteTodoList = (listId) => {
    showConfirmation('Are you sure you want to delete this list?', () => {
      setTodoLists(prevLists => prevLists.filter(list => list.id !== listId));
    });
  };

  // Open task modal
  const handleOpenTaskModal = (listId) => {
    setCurrentEditingList(listId);
    setShowTaskModal(true);
  };

  // Close task modal
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setCurrentEditingList(null);
    setNewTaskInput('');
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTaskInput.trim() || !currentEditingList) return;

    const newTask = {
      id: generateId(),
      text: newTaskInput.trim(),
      completed: false
    };

    setTodoLists(prevLists => 
      prevLists.map(list => 
        list.id === currentEditingList 
          ? { ...list, tasks: [...list.tasks, newTask] }
          : list
      )
    );

    setNewTaskInput('');
  };

  // Toggle task completion
  const handleToggleTask = (listId, taskId) => {
    setTodoLists(prevLists => 
      prevLists.map(list => 
        list.id === listId 
          ? {
              ...list,
              tasks: list.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, completed: !task.completed }
                  : task
              )
            }
          : list
      )
    );
  };

  // Edit task
  const handleEditTask = (listId, taskId) => {
    const todoList = todoLists.find(list => list.id === listId);
    const task = todoList?.tasks.find(task => task.id === taskId);
    
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
      setTodoLists(prevLists => 
        prevLists.map(list => 
          list.id === listId 
            ? {
                ...list,
                tasks: list.tasks.map(t => 
                  t.id === taskId 
                    ? { ...t, text: newText.trim() }
                    : t
                )
              }
            : list
        )
      );
    }
  };

  // Delete task
  const handleDeleteTask = (listId, taskId) => {
    showConfirmation('Are you sure you want to delete this task?', () => {
      setTodoLists(prevLists => 
        prevLists.map(list => 
          list.id === listId 
            ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
            : list
        )
      );
    });
  };

  // Get current todo list
  const getCurrentTodoList = () => {
    return todoLists.find(list => list.id === currentEditingList);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-placeholder">TODO</div>
        </div>
        <button className="create-new-btn" onClick={() => setShowCreateModal(true)}>
          CREATE NEW
        </button>
      </header>

      {/* Todo Lists Grid */}
      <div className="todo-grid">
        {todoLists.map(todoList => (
          <TodoCard 
            key={todoList.id}
            todoList={todoList}
            onOpenTaskModal={handleOpenTaskModal}
            onDeleteTodoList={handleDeleteTodoList}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      {/* Create New Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCreateModal(false);
            setPersonName('');
            setTodoListTitle('');
          }
        }}>
          <div className="modal">
            <div className="modal-header">
              <h2>CREATE NEW TDL</h2>
              <button className="close-btn" onClick={() => {
                setShowCreateModal(false);
                setPersonName('');
                setTodoListTitle('');
              }}>×</button>
            </div>
            <div className="modal-body">
              <label htmlFor="personName">NAME...</label>
              <input 
                type="text" 
                id="personName"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter your name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const titleInput = document.getElementById('todoListTitle');
                    if (titleInput) titleInput.focus();
                  }
                }}
              />
              <label htmlFor="todoListTitle">TDL TITLE...</label>
              <input 
                type="text" 
                id="todoListTitle"
                value={todoListTitle}
                onChange={(e) => setTodoListTitle(e.target.value)}
                placeholder="Enter TDL title..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTodoList();
                  }
                }}
              />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => {
                  setShowCreateModal(false);
                  setPersonName('');
                  setTodoListTitle('');
                }}>CANCEL</button>
                <button className="save-btn" onClick={handleCreateTodoList}>SAVE TO DO LIST</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseTaskModal();
          }
        }}>
          <div className="task-modal">
            <div className="task-modal-header">
              <h2>{getCurrentTodoList()?.name || 'TASK NAME'}</h2>
              <button className="close-btn" onClick={handleCloseTaskModal}>×</button>
            </div>
            <div className="task-modal-body">
              <div className="task-input-section">
                <input 
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Enter task..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask();
                    }
                  }}
                />
                <button className="add-task-btn" onClick={handleAddTask}>ADD NEW TASK</button>
              </div>
              <div className="task-list">
                {getCurrentTodoList()?.tasks.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    No tasks yet. Add your first task above!
                  </p>
                ) : (
                  getCurrentTodoList()?.tasks.map(task => (
                    <div key={task.id} className={`task-list-item ${task.completed ? 'completed' : ''}`}>
                      <span className="task-text">{task.text}</span>
                      <div className="task-actions">
                        <button 
                          className="task-btn complete-btn"
                          onClick={() => handleToggleTask(currentEditingList, task.id)}
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? '↺' : '✓'}
                        </button>
                        <button 
                          className="task-btn edit-btn"
                          onClick={() => handleEditTask(currentEditingList, task.id)}
                          title="Edit task"
                        >
                          ✎
                        </button>
                        <button 
                          className="task-btn delete-btn"
                          onClick={() => handleDeleteTask(currentEditingList, task.id)}
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="task-modal-actions">
                <button className="cancel-btn" onClick={handleCloseTaskModal}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancelConfirmation();
          }
        }}>
          <div className="confirm-modal">
            <div className="confirm-modal-body">
              <p>{confirmMessage}</p>
              <div className="confirm-actions">
                <button className="confirm-cancel-btn" onClick={handleCancelConfirmation}>×</button>
                <button className="confirm-ok-btn" onClick={handleConfirmAction}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TodoCard Component
const TodoCard = ({ todoList, onOpenTaskModal, onDeleteTodoList, onToggleTask, onDeleteTask }) => {
  const completedTasks = todoList.tasks.filter(task => task.completed).length;
  const totalTasks = todoList.tasks.length;
  const visibleTasks = todoList.tasks.slice(0, 4);

  return (
    <div className="todo-card" onClick={() => onOpenTaskModal(todoList.id)}>
      <div className="todo-header">
        <div className="todo-title">{todoList.name}</div>
        <button 
          className="delete-todo-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTodoList(todoList.id);
          }}
          title="Delete this todo list"
        >
          ×
        </button>
      </div>
      <div className="tasks-container">
        {visibleTasks.map(task => (
          <div key={task.id} className="task-item">
            <span className={`task-text ${task.completed ? 'completed' : ''}`}>
              {task.text}
            </span>
            <div className="task-actions">
              <button 
                className="task-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTask(todoList.id, task.id);
                }}
                title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed ? '↺' : '✓'}
              </button>
              <button 
                className="task-btn delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(todoList.id, task.id);
                }}
                title="Delete task"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {totalTasks > 4 && (
          <div className="task-item">
            <span className="task-text">+{totalTasks - 4} more tasks...</span>
          </div>
        )}
        {totalTasks === 0 && (
          <div className="task-item">
            <span className="task-text" style={{ color: '#666', fontStyle: 'italic' }}>
              No tasks yet - click to add some!
            </span>
          </div>
        )}
      </div>
      <button className="view-more-btn">
        {totalTasks === 0 ? 'ADD TASKS' : `VIEW MORE (${completedTasks}/${totalTasks} completed)`}
      </button>
    </div>
  );
};

export default App;