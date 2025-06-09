class TodoApp {
    constructor() {
        this.todoLists = [];
        this.init();
    }

    init() {
        console.log('Todo App V2 Initialized - Modal Implementation');
        this.bindEvents();
        this.render();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Event Binding
    bindEvents() {
        // Show modal on create button click
        document.getElementById('createNewBtn').addEventListener('click', () => {
            this.showCreateModal();
        });

        // Close modal buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideCreateModal();
        });
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideCreateModal();
        });

        // Save button creates new todo list
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.createTodoList();
        });

        // Clicking outside modal hides it
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.hideCreateModal();
            }
        });

        // Enter key handling on inputs
        document.getElementById('personName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('todoListTitle').focus();
            }
        });

        document.getElementById('todoListTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createTodoList();
            }
        });
    }

    // Modal Management
    showCreateModal() {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById('personName').focus();
    }

    hideCreateModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('personName').value = '';
        document.getElementById('todoListTitle').value = '';
    }

    // Create new todo list
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
        console.log('New todo list created:', newTodoList);

        this.render();
        this.hideCreateModal();
        this.showMessage(`"${combinedName}" created successfully!`);
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;

        if (!document.querySelector('#messageAnimation')) {
            const style = document.createElement('style');
            style.id = 'messageAnimation';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Render todo lists or empty message
    render() {
        const todoGrid = document.getElementById('todoGrid');
        todoGrid.innerHTML = '';

        if (this.todoLists.length === 0) {
            todoGrid.innerHTML = `
                <div style="
                    width: 100%; 
                    text-align: center; 
                    color: #666; 
                    font-size: 1.1rem;
                    padding: 3rem;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                ">
                    <h3 style="margin-bottom: 1rem; color: #333;">No todo lists yet!</h3>
                    <p>Click the "CREATE NEW" button to create your first todo list.</p>
                </div>
            `;
            return;
        }

        this.todoLists.forEach(todoList => {
            const todoCard = this.createTodoCard(todoList);
            todoGrid.appendChild(todoCard);
        });
    }

    createTodoCard(todoList) {
        const card = document.createElement('div');
        card.className = 'todo-card';

        card.innerHTML = `
            <h3>${todoList.name}</h3>
            <p>Todo list ready!<br>
            <small style="opacity: 0.8;">Tasks will be available in V3</small></p>
        `;

        return card;
    }
}
