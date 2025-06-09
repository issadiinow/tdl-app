class TodoApp {
    constructor() {
        this.todoLists = [];
        this.currentEditingList = null;

        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.render();
    }

    // Data Management (currently in-memory only)
    loadData() {
        this.todoLists = [
            {
                id: this.generateId(),
                name: "JOHN'S DAILY TASKS",
                tasks: [
                    { id: this.generateId(), text: "Morning workout", completed: false },
                    { id: this.generateId(), text: "Check emails", completed: true },
                    { id: this.generateId(), text: "Team meeting at 2pm", completed: false }
                ]
            },
            {
                id: this.generateId(),
                name: "SARAH'S PROJECT GOALS",
                tasks: [
                    { id: this.generateId(), text: "Finish design mockups", completed: false },
                    { id: this.generateId(), text: "Client presentation", completed: false }
                ]
            }
        ];
    }

    saveData() {
        console.log('Data saved to memory');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    bindEvents() {
        document.getElementById('createNewBtn').addEventListener('click', () => this.showCreateModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideCreateModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideCreateModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.createTodoList());

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) this.hideCreateModal();
        });

        document.getElementById('personName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('todoListTitle').focus();
        });

        document.getElementById('todoListTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createTodoList();
        });

        document.getElementById('closeTaskModal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        document.getElementById('newTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.getElementById('taskModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('taskModalOverlay')) this.hideTaskModal();
        });
    }

    showCreateModal() {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById('personName').focus();
    }

    hideCreateModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('personName').value = '';
        document.getElementById('todoListTitle').value = '';
    }

    showTaskModal(listId) {
        const todoList = this.todoLists.find(list => list.id === listId);
        if (!todoList) return;

        this.currentEditingList = listId;
        document.getElementById('taskModalTitle').textContent = todoList.name;
        document.getElementById('taskModalOverlay').classList.add('active');
        this.renderTaskList();
        document.getElementById('newTaskInput').focus();
    }

    hideTaskModal() {
        document.getElementById('taskModalOverlay').classList.remove('active');
        document.getElementById('newTaskInput').value = '';
        this.currentEditingList = null;
    }

    createTodoList() {
        const personName = document.getElementById('personName').value.trim();
        const tdlTitle = document.getElementById('todoListTitle').value.trim();

        if (!personName || !tdlTitle) {
            alert('Please enter both name and TDL title');
            return;
        }

        const combinedName = `${personName.toUpperCase()}'S ${tdlTitle.toUpperCase()}`;

        const newTodoList = {
            id: this.generateId(),
            name: combinedName,
            tasks: []
        };

        this.todoLists.push(newTodoList);
        this.saveData();
        this.render();
        this.hideCreateModal();
    }

    addTask() {
        const taskText = document.getElementById('newTaskInput').value.trim();
        if (!taskText || !this.currentEditingList) return;

        const todoList = this.todoLists.find(list => list.id === this.currentEditingList);
        if (!todoList) return;

        const newTask = {
            id: this.generateId(),
            text: taskText,
            completed: false
        };

        todoList.tasks.push(newTask);
        this.saveData();
        this.render();
        this.renderTaskList();
        document.getElementById('newTaskInput').value = '';
        document.getElementById('newTaskInput').focus();
    }

    toggleTask(listId, taskId) {
        const todoList = this.todoLists.find(list => list.id === listId);
        if (!todoList) return;

        const task = todoList.tasks.find(task => task.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        this.saveData();
        this.render();
        if (this.currentEditingList === listId) {
            this.renderTaskList();
        }
    }

    render() {
        const todoGrid = document.getElementById('todoGrid');
        todoGrid.innerHTML = '';

        this.todoLists.forEach(todoList => {
            const todoCard = this.createTodoCard(todoList);
            todoGrid.appendChild(todoCard);
        });
    }

    createTodoCard(todoList) {
        const card = document.createElement('div');
        card.className = 'todo-card';

        const completedTasks = todoList.tasks.filter(task => task.completed).length;
        const totalTasks = todoList.tasks.length;
        const visibleTasks = todoList.tasks.slice(0, 3);

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('task-btn') && !e.target.classList.contains('add-more-btn')) {
                this.showTaskModal(todoList.id);
            }
        });

        card.innerHTML = `
            <div class="todo-header">
                <div class="todo-title">${todoList.name}</div>
            </div>
            <div class="tasks-container">
                ${visibleTasks.map(task => `
                    <div class="task-item">
                        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                        <div class="task-actions">
                            <button class="task-btn ${task.completed ? 'completed' : ''}" onclick="event.stopPropagation(); app.toggleTask('${todoList.id}', '${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                                ${task.completed ? '↺' : '✓'}
                            </button>
                        </div>
                    </div>
                `).join('')}
                ${totalTasks > 3 ? `<div class="task-item"><span class="task-text">+${totalTasks - 3} more tasks...</span></div>` : ''}
                ${totalTasks === 0 ? `<div class="empty-task-message">No tasks yet - click to add some!</div>` : ''}
                <button class="add-more-btn" onclick="event.stopPropagation(); app.showTaskModal('${todoList.id}')">
                    + Add New Task
                </button>
            </div>
            <button class="view-more-btn">
                ${totalTasks === 0 ? 'ADD FIRST TASK' : `VIEW ALL (${completedTasks}/${totalTasks} completed)`}
            </button>
        `;

        return card;
    }

    renderTaskList() {
        const taskList = document.getElementById('taskList');
        const todoList = this.todoLists.find(list => list.id === this.currentEditingList);

        if (!todoList) {
            taskList.innerHTML = '<p>No tasks found.</p>';
            return;
        }

        if (todoList.tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No tasks yet. Add your first task above!</p>';
            return;
        }

        taskList.innerHTML = todoList.tasks.map(task => `
            <div class="task-list-item ${task.completed ? 'completed' : ''}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-btn complete-btn" onclick="app.toggleTask('${this.currentEditingList}', '${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                        ${task.completed ? '↺' : '✓'}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
