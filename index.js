class TodoApp {
    constructor() {
        this.todoLists = [];
        this.currentEditingList = null;
        this.currentEditingTask = null;
        this.confirmCallback = null;

        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.render();
    }

    loadData() {
        this.todoLists = [
            {
                id: this.generateId(),
                name: "ISSA'S TDL",
                tasks: [
                    { id: this.generateId(), text: "go for a swim", completed: false },
                    { id: this.generateId(), text: "complete project", completed: false },
                    { id: this.generateId(), text: "read a book", completed: true },
                    { id: this.generateId(), text: "exercise routine", completed: false }
                ]
            },
            {
                id: this.generateId(),
                name: "WORK TASKS",
                tasks: [
                    { id: this.generateId(), text: "finish report", completed: false },
                    { id: this.generateId(), text: "team meeting", completed: true },
                    { id: this.generateId(), text: "code review", completed: false }
                ]
            },
            {
                id: this.generateId(),
                name: "PERSONAL GOALS",
                tasks: [
                    { id: this.generateId(), text: "learn new skill", completed: false },
                    { id: this.generateId(), text: "plan vacation", completed: false },
                    { id: this.generateId(), text: "organize files", completed: true }
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

        document.getElementById('closeTaskModal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        document.getElementById('newTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.getElementById('taskModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('taskModalOverlay')) this.hideTaskModal();
        });

        document.getElementById('confirmCancelBtn').addEventListener('click', () => this.hideConfirmModal());

        document.getElementById('confirmOkBtn').addEventListener('click', () => {
            if (this.confirmCallback) this.confirmCallback();
            this.hideConfirmModal();
        });

        document.getElementById('confirmModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('confirmModalOverlay')) this.hideConfirmModal();
        });

        document.getElementById('personName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('todoListTitle').focus();
        });

        document.getElementById('todoListTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createTodoList();
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
        this.currentEditingTask = null;
    }

    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModalOverlay').classList.add('active');
        this.confirmCallback = callback;
    }

    hideConfirmModal() {
        document.getElementById('confirmModalOverlay').classList.remove('active');
        this.confirmCallback = null;
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

    deleteTodoList(listId) {
        this.showConfirmModal('Are you sure you want to delete this list?', () => {
            this.todoLists = this.todoLists.filter(list => list.id !== listId);
            this.saveData();
            this.render();
        });
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
        if (this.currentEditingList === listId) this.renderTaskList();
    }

    editTask(listId, taskId) {
        const todoList = this.todoLists.find(list => list.id === listId);
        if (!todoList) return;

        const task = todoList.tasks.find(task => task.id === taskId);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveData();
            this.render();
            if (this.currentEditingList === listId) this.renderTaskList();
        }
    }

    deleteTask(listId, taskId) {
        const todoList = this.todoLists.find(list => list.id === listId);
        if (!todoList) return;

        this.showConfirmModal('Are you sure you want to delete this task?', () => {
            todoList.tasks = todoList.tasks.filter(task => task.id !== taskId);
            this.saveData();
            this.render();
            if (this.currentEditingList === listId) this.renderTaskList();
        });
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
        card.onclick = (e) => {
            if (!e.target.classList.contains('delete-todo-btn')) {
                this.showTaskModal(todoList.id);
            }
        };

        const completedTasks = todoList.tasks.filter(task => task.completed).length;
        const totalTasks = todoList.tasks.length;
        const visibleTasks = todoList.tasks.slice(0, 4);

        card.innerHTML = `
            <div class="todo-header">
                <div class="todo-title">${todoList.name}</div>
                <button class="delete-todo-btn" onclick="event.stopPropagation(); app.deleteTodoList('${todoList.id}')" title="Delete this todo list">×</button>
            </div>
            <div class="tasks-container">
                ${visibleTasks.map(task => `
                    <div class="task-item">
                        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                        <div class="task-actions">
                            <button class="task-btn" onclick="event.stopPropagation(); app.toggleTask('${todoList.id}', '${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                                ${task.completed ? '↺' : '✓'}
                            </button>
                            <button class="task-btn delete-btn" onclick="event.stopPropagation(); app.deleteTask('${todoList.id}', '${task.id}')" title="Delete task">×</button>
                        </div>
                    </div>
                `).join('')}
                ${totalTasks > 4 ? `<div class="task-item"><span class="task-text">+${totalTasks - 4} more tasks...</span></div>` : ''}
                ${totalTasks === 0 ? `<div class="task-item"><span class="task-text" style="color: #666; font-style: italic;">No tasks yet - click to add some!</span></div>` : ''}
            </div>
            <button class="view-more-btn">
                ${totalTasks === 0 ? 'ADD TASKS' : `VIEW MORE (${completedTasks}/${totalTasks} completed)`}
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
                    <button class="task-btn edit-btn" onclick="app.editTask('${this.currentEditingList}', '${task.id}')" title="Edit task">
                        ✎
                    </button>
                    <button class="task-btn delete-btn" onclick="app.deleteTask('${this.currentEditingList}', '${task.id}')" title="Delete task">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
