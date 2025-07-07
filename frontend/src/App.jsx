import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost/TDL-APP/backend/api';

  const fetchLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/lists.php`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTodoLists(data.data || data);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError(error.message);
      setTimeout(fetchLists, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchLists();
    return () => abortController.abort();
  }, []);

  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (pendingAction) pendingAction();
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCreateTodoList = async () => {
    if (!personName.trim() || !todoListTitle.trim()) {
      setError('Please enter both name and TDL title');
      return;
    }

    const combinedName = `${personName.toUpperCase()}'S ${todoListTitle.toUpperCase()}`;
    
    try {
      const response = await fetch(`${API_BASE}/lists.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: combinedName })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create list');
      }
      
      await fetchLists();
      setPersonName('');
      setTodoListTitle('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating list:', error);
      setError(error.message);
    }
  };

  const handleDeleteTodoList = (listId) => {
    showConfirmation('Are you sure you want to delete this list?', async () => {
      try {
        const response = await fetch(`${API_BASE}/lists.php?id=${listId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await fetchLists();
      } catch (error) {
        console.error('Error deleting list:', error);
        setError(error.message);
      }
    });
  };

  const handleOpenTaskModal = (listId) => {
    setCurrentEditingList(listId);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setCurrentEditingList(null);
    setNewTaskInput('');
  };

  const handleAddTask = async () => {
    if (!newTaskInput.trim() || !currentEditingList) {
      setError('Task cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/tasks.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: currentEditingList,
          text: newTaskInput.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }
      
      await fetchLists();
      setNewTaskInput('');
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message);
    }
  };

  const handleToggleTask = async (listId, taskId) => {
    try {
      const todoList = todoLists.find(list => list.id === listId);
      const task = todoList?.tasks?.find(task => task.id === taskId);
      
      if (!task) throw new Error('Task not found');

      const response = await fetch(`${API_BASE}/tasks.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          completed: task.completed ? 0 : 1
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      await fetchLists();
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
    }
  };

  const handleEditTask = async (listId, taskId) => {
    const todoList = todoLists.find(list => list.id === listId);
    const task = todoList?.tasks?.find(task => task.id === taskId);
    
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
      try {
        const response = await fetch(`${API_BASE}/tasks.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: taskId,
            text: newText.trim()
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await fetchLists();
      } catch (error) {
        console.error('Error updating task:', error);
        setError(error.message);
      }
    }
  };

  const handleDeleteTask = (listId, taskId) => {
    showConfirmation('Are you sure you want to delete this task?', async () => {
      try {
        const response = await fetch(`${API_BASE}/tasks.php?id=${taskId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await fetchLists();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError(error.message);
      }
    });
  };

  const getCurrentTodoList = () => {
    return todoLists.find(list => list.id === currentEditingList);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton-loader">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-title"></div>
              <div className="skeleton-task"></div>
              <div className="skeleton-task"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && (
        <div className="error-alert">
          {error}
          <button 
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <header className="header">
        <div className="logo-section">
          <div className="logo-placeholder">TODO</div>
        </div>
        <button 
          className="create-new-btn" 
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new todo list"
        >
          CREATE NEW
        </button>
      </header>

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

      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>CREATE NEW TDL</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
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
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('todoListTitle')?.focus()}
              />
              <label htmlFor="todoListTitle">TDL TITLE...</label>
              <input 
                type="text" 
                id="todoListTitle"
                value={todoListTitle}
                onChange={(e) => setTodoListTitle(e.target.value)}
                placeholder="Enter TDL title..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTodoList()}
              />
              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowCreateModal(false)}
                >
                  CANCEL
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleCreateTodoList}
                >
                  SAVE TO DO LIST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseTaskModal()}>
          <div className="task-modal">
            <div className="task-modal-header">
              <h2>{getCurrentTodoList()?.name || 'TASK NAME'}</h2>
              <button 
                className="close-btn" 
                onClick={handleCloseTaskModal}
                aria-label="Close task modal"
              >
                ×
              </button>
            </div>
            <div className="task-modal-body">
              <div className="task-input-section">
                <input 
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Enter task..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  aria-label="New task input"
                />
                <button 
                  className="add-task-btn" 
                  onClick={handleAddTask}
                >
                  ADD NEW TASK
                </button>
              </div>
              <div className="task-list">
                {getCurrentTodoList()?.tasks?.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    No tasks yet. Add your first task above!
                  </p>
                ) : (
                  getCurrentTodoList()?.tasks?.map(task => (
                    <div 
                      key={task.id} 
                      className={`task-list-item ${task.completed ? 'completed' : ''}`}
                    >
                      <span className="task-text">{task.text}</span>
                      <div className="task-actions">
                        <button 
                          className="task-btn complete-btn"
                          onClick={() => handleToggleTask(currentEditingList, task.id)}
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? '↺' : '✓'}
                        </button>
                        <button 
                          className="task-btn edit-btn"
                          onClick={() => handleEditTask(currentEditingList, task.id)}
                          title="Edit task"
                          aria-label="Edit task"
                        >
                          ✎
                        </button>
                        <button 
                          className="task-btn delete-btn"
                          onClick={() => handleDeleteTask(currentEditingList, task.id)}
                          title="Delete task"
                          aria-label="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="task-modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={handleCloseTaskModal}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancelConfirmation()}>
          <div className="confirm-modal">
            <div className="confirm-modal-body">
              <p>{confirmMessage}</p>
              <div className="confirm-actions">
                <button 
                  className="confirm-cancel-btn" 
                  onClick={handleCancelConfirmation}
                >
                  ×
                </button>
                <button 
                  className="confirm-ok-btn" 
                  onClick={handleConfirmAction}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TodoCard = ({ todoList, onOpenTaskModal, onDeleteTodoList, onToggleTask, onDeleteTask }) => {
  const completedTasks = todoList.tasks?.filter(task => task.completed).length || 0;
  const totalTasks = todoList.tasks?.length || 0;
  const visibleTasks = todoList.tasks?.slice(0, 4) || [];

  return (
    <div 
      className="todo-card" 
      onClick={() => onOpenTaskModal(todoList.id)}
      aria-label={`Todo list: ${todoList.name}`}
    >
      <div className="todo-header">
        <div className="todo-title">{todoList.name}</div>
        <button
          className="delete-todo-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTodoList(todoList.id);
          }}
          title="Delete this todo list"
          aria-label="Delete todo list"
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
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
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
                aria-label="Delete task"
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

TodoCard.propTypes = {
  todoList: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired
      })
    )
  }).isRequired,
  onOpenTaskModal: PropTypes.func.isRequired,
  onDeleteTodoList: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired
};

export default App;