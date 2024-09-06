document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Fetch and display todos
    function fetchTodos() {
        fetch('/api/todos')
            .then(response => response.json())
            .then(todos => {
                todoList.innerHTML = '';
                todos.forEach(todo => {
                    const li = createTodoElement(todo);
                    todoList.appendChild(li);
                });
            });
    }

    // Create a todo list item
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${todo.completed ? 'completed' : ''}">${todo.task}</span>
            <div>
                <button class="toggle-btn">${todo.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Toggle completion status
        li.querySelector('.toggle-btn').addEventListener('click', () => {
            fetch(`/api/todos/${todo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed })
            })
            .then(() => fetchTodos());
        });

        // Delete todo
        li.querySelector('.delete-btn').addEventListener('click', () => {
            fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
                .then(() => fetchTodos());
        });

        return li;
    }

    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = todoInput.value.trim();
        if (task) {
            fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task })
            })
            .then(() => {
                todoInput.value = '';
                fetchTodos();
            });
        }
    });

    // Initial fetch
    fetchTodos();
});
