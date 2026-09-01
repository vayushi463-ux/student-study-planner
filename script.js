let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const subjectInput = document.getElementById("subjectInput");
    const dateInput = document.getElementById("dateInput");

    const task = taskInput.value.trim();
    const subject = subjectInput.value;
    const date = dateInput.value;

    if (task === "") {
        alert("Please enter a study task.");
        return;
    }

    if (subject === "") {
        alert("Please select a subject.");
        return;
    }

    if (date === "") {
        alert("Please select a date.");
        return;
    }

    tasks.push({
        task: task,
        subject: subject,
        date: date,
        completed: false
    });

    saveTasks();

    taskInput.value = "";
    subjectInput.value = "";
    dateInput.value = "";

    displayTasks();
}

function displayTasks() {
    const taskList = document.getElementById("taskList");

    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="empty">No tasks added yet.</p>';
        return;
    }

    taskList.innerHTML = "";

    tasks.forEach(function(item, index) {
        const div = document.createElement("div");

        div.className = item.completed ? "task completed" : "task";

        div.innerHTML = `
            <h3>${item.task}</h3>
            <p><strong>Subject:</strong> ${item.subject}</p>
            <p><strong>Date:</strong> ${item.date}</p>
            <button onclick="completeTask(${index})">
                ${item.completed ? "Undo" : "Complete"}
            </button>
            <button onclick="deleteTask(${index})">
                Delete
            </button>
        `;

        taskList.appendChild(div);
    });
}

function completeTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    displayTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}

displayTasks();