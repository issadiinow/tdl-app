class TodoApp {
    constructor() {
        this.todoLists = [];
        this.init();
    }

    init() {
        console.log('Todo App V1 Initialized - Basic Layout and Form');
        this.bindEvents();
        this.render();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event Binding
    bindEvents() {
        // Save button event
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.createTodoList();
        });

        // Cancel button event
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // Enter key navigation
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

        // CREATE NEW button (placeholder for V2)
        document.getElementById('createNewBtn').addEventListener('click', () => {
            console.log('CREATE NEW clicked - Will be implemented in V2');
            document.getElementById('personName').focus();
        });
    }

    // Todo List Operations
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
            tasks: [] // Empty tasks array for V1
        };

        this.todoLists.push(newTodoList);
        console.log('New todo list created:', newTodoList);
        
        this.render();
        this.clearForm();
        
        this.showMessage(`${combinedName} todo list created successfully!`);
    }

    clearForm() {
        document.getElementById('personName').value = '';
        document.getElementById('todoListTitle').value = '';
        document.getElementById('personName').focus();
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
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Rendering Methods
    render() {
        const todoGrid = document.getElementById('todoGrid');
        todoGrid.innerHTML = '';

        if (this.todoLists.length === 0) {
            todoGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1; 
                    text-align: center; 
                    color: #666; 
                    font-size: 1.1rem;
                    padding: 2rem;
                ">
                    No todo lists yet. Create your first one using the form above!
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
            <p style="margin-top: 1rem; opacity: 0.9; font-size: 0.9rem;">
                Todo list created successfully!<br>
                <small>Tasks will be added in Version 3</small>
            </p>
        `;

        return card;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();

    // Add CSS animation for messages
    const style = document.createElement('style');
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
});
