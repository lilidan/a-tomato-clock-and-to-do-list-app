class PomodoroTimer {
    constructor() {
        this.workTime = 25;
        this.breakTime = 5;
        this.currentTime = this.workTime * 60;
        this.isRunning = false;
        this.isWorkSession = true;
        this.completedSessions = 0;
        this.interval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.sessionType = document.getElementById('session-type');
        this.completedSessionsDisplay = document.getElementById('completed-sessions');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.workTimeInput.addEventListener('change', () => this.updateSettings());
        this.breakTimeInput.addEventListener('change', () => this.updateSettings());
    }
    
    loadSettings() {
        const savedWorkTime = localStorage.getItem('pomodoro-work-time');
        const savedBreakTime = localStorage.getItem('pomodoro-break-time');
        const savedCompletedSessions = localStorage.getItem('pomodoro-completed');
        
        if (savedWorkTime) {
            this.workTime = parseInt(savedWorkTime);
            this.workTimeInput.value = this.workTime;
        }
        
        if (savedBreakTime) {
            this.breakTime = parseInt(savedBreakTime);
            this.breakTimeInput.value = this.breakTime;
        }
        
        if (savedCompletedSessions) {
            this.completedSessions = parseInt(savedCompletedSessions);
        }
        
        this.currentTime = this.workTime * 60;
        this.updateCompletedSessions();
    }
    
    updateSettings() {
        this.workTime = parseInt(this.workTimeInput.value);
        this.breakTime = parseInt(this.breakTimeInput.value);
        
        localStorage.setItem('pomodoro-work-time', this.workTime);
        localStorage.setItem('pomodoro-break-time', this.breakTime);
        
        if (!this.isRunning) {
            this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
            this.updateDisplay();
        }
    }
    
    start() {
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.interval = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            
            if (this.currentTime <= 0) {
                this.sessionComplete();
            }
        }, 1000);
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.interval);
    }
    
    reset() {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
        this.updateDisplay();
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            this.completedSessions++;
            this.updateCompletedSessions();
            localStorage.setItem('pomodoro-completed', this.completedSessions);
            this.showNotification('Work session complete! Time for a break.');
            this.isWorkSession = false;
            this.currentTime = this.breakTime * 60;
        } else {
            this.showNotification('Break time over! Ready for another work session?');
            this.isWorkSession = true;
            this.currentTime = this.workTime * 60;
        }
        
        this.updateSessionType();
        this.updateDisplay();
        this.playNotificationSound();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.title = `${this.timerDisplay.textContent} - Tomato Clock`;
    }
    
    updateSessionType() {
        this.sessionType.textContent = this.isWorkSession ? 'Work' : 'Break';
    }
    
    updateCompletedSessions() {
        this.completedSessionsDisplay.textContent = this.completedSessions;
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    playNotificationSound() {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
    }
}

class TodoList {
    constructor() {
        this.todos = [];
        this.nextId = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTodos();
        this.updateStats();
    }
    
    initializeElements() {
        this.newTodoInput = document.getElementById('new-todo');
        this.addTodoBtn = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');
        this.totalTasks = document.getElementById('total-tasks');
        this.completedTasks = document.getElementById('completed-tasks');
    }
    
    bindEvents() {
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }
    
    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        const savedNextId = localStorage.getItem('todos-next-id');
        
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
        
        if (savedNextId) {
            this.nextId = parseInt(savedNextId);
        }
        
        this.renderTodos();
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('todos-next-id', this.nextId);
    }
    
    addTodo() {
        const text = this.newTodoInput.value.trim();
        
        if (text === '') {
            return;
        }
        
        const todo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.newTodoInput.value = '';
        this.renderTodos();
        this.updateStats();
        this.saveTodos();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
            this.updateStats();
            this.saveTodos();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
        this.updateStats();
        this.saveTodos();
    }
    
    renderTodos() {
        this.todoList.innerHTML = '';
        
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTodo(${todo.id})">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})" title="Delete task">×</button>
            `;
            
            this.todoList.appendChild(li);
        });
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let timer;
let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    timer = new PomodoroTimer();
    todoApp = new TodoList();
});