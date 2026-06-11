document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    if (taskInput.value !== '') {
        const li = document.createElement('li');
        li.textContent = taskInput.value;
        li.addEventListener('click', function() {
            li.classList.toggle('completed');
        });
        document.getElementById('taskList').appendChild(li);
        taskInput.value = '';
    }
});