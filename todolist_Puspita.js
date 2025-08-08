// Select DOM elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const dueDateInput = document.getElementById('due-date-input');

// Load tasks from localStorage or initialize empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks to the UI
function renderTasks() {
    taskList.innerHTML = '';
    let activeCount = 0;
    const today = new Date();
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) li.classList.add('completed');
        li.classList.add('fade-in');

        // Overdue highlighting
        if (task.dueDate && !task.completed) {
            const due = new Date(task.dueDate);
            if (due < today.setHours(0,0,0,0)) {
                li.classList.add('overdue');
            }
        }

        // Checkbox for completed
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.onchange = () => toggleCompleted(index);

        // Task text or edit input
        let span;
        if (task.editing) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.text;
            input.className = 'edit-input';
            input.onkeydown = (e) => {
                if (e.key === 'Enter') finishEdit(index, input.value);
                if (e.key === 'Escape') cancelEdit(index);
            };
            input.onblur = () => finishEdit(index, input.value);
            setTimeout(() => input.focus(), 0);
            li.appendChild(input);
        } else {
            span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            span.ondblclick = () => startEdit(index);
            li.appendChild(span);
        }

        // Due date display
        if (task.dueDate) {
            const dueSpan = document.createElement('span');
            dueSpan.className = 'due-date';
            dueSpan.textContent = `Due: ${task.dueDate}`;
            li.appendChild(dueSpan);
        }

        // Actions
        const actions = document.createElement('div');
        actions.className = 'task-actions';

        if (task.editing) {
            const doneBtn = document.createElement('button');
            doneBtn.className = 'edit-btn';
            doneBtn.textContent = 'Done';
            doneBtn.onclick = () => finishEdit(index, li.querySelector('.edit-input').value);
            actions.appendChild(doneBtn);
        } else {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Edit';
            editBtn.onclick = () => startEdit(index);
            actions.appendChild(editBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(index, li);

        actions.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(actions);
        taskList.appendChild(li);

        if (!task.completed) activeCount++;
    });
    taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
}

// Add a new task
function addTask() {
    const value = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    if (value) {
        tasks.push({ text: value, completed: false, dueDate });
        saveTasks();
        renderTasks();
        taskInput.value = '';
        dueDateInput.value = '';
        taskInput.focus();
    }
}

// Toggle completed state
function toggleCompleted(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Start inline editing
function startEdit(index) {
    tasks = tasks.map((t, i) => ({ ...t, editing: i === index }));
    renderTasks();
}

// Finish inline editing
function finishEdit(index, value) {
    const trimmed = value.trim();
    if (trimmed) {
        tasks[index].text = trimmed;
        tasks[index].editing = false;
        saveTasks();
        renderTasks();
    } else {
        cancelEdit(index);
    }
}

// Cancel editing
function cancelEdit(index) {
    tasks[index].editing = false;
    renderTasks();
}

// Delete a task with fade-out animation
function deleteTask(index, li) {
    li.classList.add('fade-out');
    setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }, 400);
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

// Migrate old format if needed
if (tasks.length && typeof tasks[0] === 'string') {
    tasks = tasks.map(text => ({ text, completed: false, dueDate: '' }));
    saveTasks();
}
if (tasks.length && typeof tasks[0] === 'object' && !('dueDate' in tasks[0])) {
    tasks = tasks.map(t => ({ ...t, dueDate: '' }));
    saveTasks();
}

// Initial render
renderTasks(); 