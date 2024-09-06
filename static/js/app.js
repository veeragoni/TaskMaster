document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const categorySelect = document.getElementById('category-select');
    const dueDateInput = document.getElementById('due-date-input');
    const todoList = document.getElementById('todo-list');

    console.log('DOM content loaded');

    // Fetch categories and populate the dropdown
    function fetchCategories() {
        console.log('Fetching categories');
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                console.log('Categories fetched:', categories);
                categorySelect.innerHTML = '<option value="">Select a category</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Fetch and display todos
    function fetchTodos() {
        console.log('Fetching todos');
        fetch('/api/todos')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(todos => {
                console.log('Todos fetched:', todos);
                todoList.innerHTML = '';
                todos.forEach(todo => {
                    const li = createTodoElement(todo);
                    todoList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
                todoList.innerHTML = '<li>Error loading todos. Please try again later.</li>';
            });
    }

    // Create a todo list item
    function createTodoElement(todo) {
        console.log('Creating todo element:', todo);
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        const taskText = todo.task || 'Unnamed Task';
        const categoryText = todo.category || 'No Category';
        const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'No due date';
        console.log('Task text:', taskText);
        console.log('Category text:', categoryText);
        console.log('Due date:', dueDate);
        li.innerHTML = `
            <span class="${todo.completed ? 'completed' : ''}">${taskText}</span>
            <span class="category">${categoryText}</span>
            <span class="due-date">Due: ${dueDate}</span>
            <div>
                <button class="toggle-btn">${todo.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Toggle completion status
        li.querySelector('.toggle-btn').addEventListener('click', () => {
            console.log('Toggling todo completion:', todo.id);
            try {
                fetch(`/api/todos/${todo.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: !todo.completed })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(updatedTodo => {
                    console.log('Todo updated:', updatedTodo);
                    todo.completed = updatedTodo.completed;
                    li.querySelector('span:first-child').classList.toggle('completed');
                    li.querySelector('.toggle-btn').textContent = todo.completed ? 'Undo' : 'Complete';
                })
                .catch(error => {
                    console.error('Error toggling todo completion:', error);
                    alert('Failed to update todo. Please try again.');
                });
            } catch (error) {
                console.error('Error in toggle event listener:', error);
            }
        });

        // Delete todo
        li.querySelector('.delete-btn').addEventListener('click', () => {
            console.log('Deleting todo:', todo.id);
            try {
                fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        console.log('Todo deleted successfully');
                        li.remove();
                    })
                    .catch(error => {
                        console.error('Error deleting todo:', error);
                        alert('Failed to delete todo. Please try again.');
                    });
            } catch (error) {
                console.error('Error in delete event listener:', error);
            }
        });

        return li;
    }

    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        console.log('Form submitted');
        e.preventDefault();
        const task = todoInput.value.trim();
        const category = categorySelect.value;
        const dueDate = dueDateInput.value;
        console.log('Task:', task, 'Category:', category, 'Due Date:', dueDate);
        if (task && category) {
            fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, category, due_date: dueDate })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(newTodo => {
                console.log('New todo added:', newTodo);
                todoInput.value = '';
                categorySelect.value = '';
                dueDateInput.value = '';
                const li = createTodoElement(newTodo);
                todoList.appendChild(li);
            })
            .catch(error => {
                console.error('Error adding todo:', error);
                alert('Failed to add todo. Please try again.');
            });
        } else {
            console.log('Task or category is empty');
            alert('Please enter a task and select a category.');
        }
    });

    // Initial fetch
    fetchCategories();
    fetchTodos();
});
