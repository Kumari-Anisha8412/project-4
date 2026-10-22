/**
 * TaskMaster Pro - Professional Daily Task Manager
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Full CRUD with LocalStorage persistence
 * - Backward compatibility with previous "myTasks" storage
 * - Search, Status Filtering, Category Filtering & Dynamic Sorting
 * - Priority levels (High, Medium, Low)
 * - Due date status detection (Today, Tomorrow, Overdue)
 * - Light / Dark Theme toggle with persistence
 * - Custom animated Toast notifications (No browser alert())
 * - Custom Confirmation Modal (No browser confirm())
 * - Export & Import tasks (JSON backup)
 * - Bulk actions (Mark All Done, Clear Completed)
 * - Keyboard shortcuts (Esc to cancel, Ctrl+K to search)
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. DOM Elements
    // -------------------------------------------------------------------------
    const elements = {
        // Form & Inputs
        taskForm: document.getElementById('taskForm'),
        taskInput: document.getElementById('taskInput'),
        categorySelect: document.getElementById('category'),
        prioritySelect: document.getElementById('priority'),
        taskDateInput: document.getElementById('taskDate'),
        taskTimeInput: document.getElementById('taskTime'),
        addButton: document.getElementById('addButton'),
        btnText: document.getElementById('btnText'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),
        formHeading: document.getElementById('formHeading'),

        // Search & Filters
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        filterCategory: document.getElementById('filterCategory'),
        sortBy: document.getElementById('sortBy'),

        // Lists & Empty State
        taskList: document.getElementById('taskList'),
        emptyState: document.getElementById('emptyState'),
        taskCount: document.getElementById('taskCount'),

        // Stats & Progress
        statTotal: document.getElementById('statTotal'),
        statPending: document.getElementById('statPending'),
        statCompleted: document.getElementById('statCompleted'),
        statRate: document.getElementById('statRate'),
        progressBar: document.getElementById('progressBar'),
        progressText: document.getElementById('progressText'),
        currentDateDisplay: document.getElementById('currentDateDisplay'),

        // Theme & Bulk Actions
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        markAllCompletedBtn: document.getElementById('markAllCompletedBtn'),
        clearCompletedBtn: document.getElementById('clearCompletedBtn'),
        exportTasksBtn: document.getElementById('exportTasksBtn'),
        importFileInput: document.getElementById('importFileInput'),

        // Modal & Toast
        confirmModal: document.getElementById('confirmModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalMessage: document.getElementById('modalMessage'),
        modalConfirmBtn: document.getElementById('modalConfirmBtn'),
        modalCancelBtn: document.getElementById('modalCancelBtn'),
        toastContainer: document.getElementById('toastContainer')
    };

    // -------------------------------------------------------------------------
    // 2. Application State
    // -------------------------------------------------------------------------
    const STORAGE_KEY = 'taskmaster_pro_tasks_v2';
    const THEME_KEY = 'taskmaster_pro_theme';

    // Load tasks with fallback to previous legacy key "myTasks"
    let tasks = loadInitialTasks();
    let currentFilter = 'All';
    let currentCategoryFilter = 'All';
    let searchQuery = '';
    let currentSort = 'newest';
    let editingTaskId = null;
    let pendingModalAction = null;

    // -------------------------------------------------------------------------
    // 3. Storage & Initialization
    // -------------------------------------------------------------------------
    function loadInitialTasks() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);

            // Migration from previous version
            const legacy = localStorage.getItem('myTasks');
            if (legacy) {
                const parsedLegacy = JSON.parse(legacy);
                return parsedLegacy.map(t => ({
                    id: t.id || Date.now() + Math.random(),
                    title: t.title || 'Untitled Task',
                    category: t.category || 'Personal',
                    priority: t.priority || 'Medium',
                    date: t.date || '',
                    time: t.time || '',
                    completed: Boolean(t.completed),
                    createdAt: t.id || Date.now()
                }));
            }
        } catch (error) {
            console.error('Failed to parse saved tasks:', error);
        }
        return [];
    }

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            // Keep legacy sync just in case
            localStorage.setItem('myTasks', JSON.stringify(tasks));
        } catch (error) {
            showToast('Unable to save tasks to local storage.', 'error');
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
        showToast(`${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} mode enabled`, 'info');
    }

    function updateHeaderDate() {
        const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        const todayStr = new Date().toLocaleDateString(undefined, options);
        if (elements.currentDateDisplay) {
            elements.currentDateDisplay.textContent = todayStr + ' • Organize your workflow & accomplish more';
        }
    }

    // -------------------------------------------------------------------------
    // 4. Toast & Custom Modal Notifications
    // -------------------------------------------------------------------------
    function showToast(message, type = 'info', duration = 3000) {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span>${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function showConfirmModal(title, message, onConfirm) {
        elements.modalTitle.textContent = title;
        elements.modalMessage.textContent = message;
        elements.confirmModal.classList.remove('hidden');
        pendingModalAction = onConfirm;
        elements.modalConfirmBtn.focus();
    }

    function closeConfirmModal() {
        elements.confirmModal.classList.add('hidden');
        pendingModalAction = null;
    }

    // -------------------------------------------------------------------------
    // 5. Date & Time Helpers
    // -------------------------------------------------------------------------
    function getDateStatus(dateStr) {
        if (!dateStr) return null;

        const target = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Overdue', isOverdue: true, isToday: false };
        } else if (diffDays === 0) {
            return { label: 'Due Today', isOverdue: false, isToday: true };
        } else if (diffDays === 1) {
            return { label: 'Tomorrow', isOverdue: false, isToday: false };
        } else {
            const formatted = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return { label: formatted, isOverdue: false, isToday: false };
        }
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12;
        return `${formattedH}:${minutes} ${ampm}`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // -------------------------------------------------------------------------
    // 6. Task Rendering & Filtering
    // -------------------------------------------------------------------------
    function renderTasks() {
        const query = searchQuery.trim().toLowerCase();

        // 1. Filter
        const filteredTasks = tasks.filter(task => {
            // Status Filter
            if (currentFilter === 'Pending' && task.completed) return false;
            if (currentFilter === 'Completed' && !task.completed) return false;
            if (currentFilter === 'Today') {
                const todayStr = new Date().toISOString().split('T')[0];
                if (task.date !== todayStr) return false;
            }

            // Category Filter
            if (currentCategoryFilter !== 'All' && task.category !== currentCategoryFilter) {
                return false;
            }

            // Search Query
            if (query) {
                const matchesTitle = task.title.toLowerCase().includes(query);
                const matchesCat = task.category.toLowerCase().includes(query);
                if (!matchesTitle && !matchesCat) return false;
            }

            return true;
        });

        // 2. Sort
        filteredTasks.sort((a, b) => {
            if (currentSort === 'newest') {
                return (b.createdAt || 0) - (a.createdAt || 0);
            }
            if (currentSort === 'oldest') {
                return (a.createdAt || 0) - (b.createdAt || 0);
            }
            if (currentSort === 'priority') {
                const weight = { High: 3, Medium: 2, Low: 1 };
                return (weight[b.priority] || 2) - (weight[a.priority] || 2);
            }
            if (currentSort === 'date') {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date) - new Date(b.date);
            }
            if (currentSort === 'alphabetical') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        // 3. Clear List & Populate
        elements.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            elements.emptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.add('hidden');

            const fragment = document.createDocumentFragment();
            filteredTasks.forEach(task => {
                const li = createTaskElement(task);
                fragment.appendChild(li);
            });
            elements.taskList.appendChild(fragment);
        }

        // 4. Update Stats
        updateStats();

        // 5. Update Count Label
        elements.taskCount.textContent = `Showing ${filteredTasks.length} of ${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const dateStatus = getDateStatus(task.date);
        const formattedTime = formatTime(task.time);

        // Category class name
        const catClass = `badge-cat-${(task.category || 'other').toLowerCase()}`;
        const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

        // Due date markup
        let dateMarkup = '';
        if (dateStatus) {
            let statusClass = '';
            if (!task.completed) {
                if (dateStatus.isOverdue) statusClass = 'meta-overdue';
                else if (dateStatus.isToday) statusClass = 'meta-today';
            }

            dateMarkup = `
                <span class="meta-item ${statusClass}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${dateStatus.label}
                </span>
            `;
        }

        let timeMarkup = '';
        if (formattedTime) {
            timeMarkup = `
                <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${formattedTime}
                </span>
            `;
        }

        li.innerHTML = `
            <div class="task-check-wrap">
                <button type="button" class="custom-checkbox" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
            </div>

            <div class="task-content">
                <div class="task-title-row">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                </div>
                <div class="task-meta">
                    <span class="badge ${catClass}">${escapeHtml(task.category || 'General')}</span>
                    <span class="badge ${priorityClass}">⚡ ${escapeHtml(task.priority || 'Medium')}</span>
                    ${dateMarkup}
                    ${timeMarkup}
                </div>
            </div>

            <div class="task-actions">
                <button type="button" class="action-btn edit-action" title="Edit Task" aria-label="Edit Task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button type="button" class="action-btn delete-action" title="Delete Task" aria-label="Delete Task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // Bind interactive events
        const checkbox = li.querySelector('.custom-checkbox');
        checkbox.addEventListener('click', () => toggleTaskComplete(task.id));

        const editBtn = li.querySelector('.edit-action');
        editBtn.addEventListener('click', () => startEditing(task.id));

        const deleteBtn = li.querySelector('.delete-action');
        deleteBtn.addEventListener('click', () => {
            showConfirmModal(
                'Delete Task',
                `Are you sure you want to permanently delete "${task.title}"?`,
                () => {
                    deleteTask(task.id);
                }
            );
        });

        return li;
    }

    // -------------------------------------------------------------------------
    // 7. Stats & Progress Update
    // -------------------------------------------------------------------------
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        elements.statTotal.textContent = total;
        elements.statPending.textContent = pending;
        elements.statCompleted.textContent = completed;
        elements.statRate.textContent = `${percentage}%`;

        elements.progressBar.style.width = `${percentage}%`;
        elements.progressText.textContent = `${percentage}% Completed`;
    }

    // -------------------------------------------------------------------------
    // 8. CRUD Operations
    // -------------------------------------------------------------------------
    function handleFormSubmit(e) {
        e.preventDefault();

        const title = elements.taskInput.value.trim();
        if (!title) {
            showToast('Please enter a task description!', 'warning');
            elements.taskInput.focus();
            return;
        }

        const category = elements.categorySelect.value;
        const priority = elements.prioritySelect.value;
        const date = elements.taskDateInput.value;
        const time = elements.taskTimeInput.value;

        if (editingTaskId !== null) {
            // Update existing
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.title = title;
                task.category = category;
                task.priority = priority;
                task.date = date;
                task.time = time;
                task.updatedAt = Date.now();
                showToast('Task updated successfully!', 'success');
            }
            cancelEditing();
        } else {
            // Add new
            const newTask = {
                id: Date.now(),
                title: title,
                category: category,
                priority: priority,
                date: date,
                time: time,
                completed: false,
                createdAt: Date.now()
            };
            tasks.unshift(newTask);
            showToast('New task added!', 'success');
            elements.taskForm.reset();
        }

        saveTasks();
        renderTasks();
    }

    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;

        saveTasks();
        renderTasks();

        if (task.completed) {
            showToast(`Completed: "${task.title}"`, 'success');
        } else {
            showToast(`Marked pending: "${task.title}"`, 'info');
        }
    }

    function startEditing(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        editingTaskId = task.id;
        elements.taskInput.value = task.title;
        elements.categorySelect.value = task.category || 'Personal';
        elements.prioritySelect.value = task.priority || 'Medium';
        elements.taskDateInput.value = task.date || '';
        elements.taskTimeInput.value = task.time || '';

        elements.btnText.textContent = 'Save Changes';
        elements.formHeading.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="title-icon">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Task
        `;
        elements.cancelEditBtn.classList.remove('hidden');

        // Scroll to form smoothly
        elements.taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elements.taskInput.focus();
    }

    function cancelEditing() {
        editingTaskId = null;
        elements.taskForm.reset();
        elements.btnText.textContent = 'Add Task';
        elements.formHeading.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="title-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Create New Task
        `;
        elements.cancelEditBtn.classList.add('hidden');
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        if (editingTaskId === taskId) {
            cancelEditing();
        }
        saveTasks();
        renderTasks();
        showToast('Task removed.', 'info');
    }

    function markAllCompleted() {
        if (tasks.length === 0) {
            showToast('No tasks available to mark complete.', 'warning');
            return;
        }

        showConfirmModal(
            'Mark All as Completed',
            'Do you want to mark all active tasks as completed?',
            () => {
                tasks.forEach(t => t.completed = true);
                saveTasks();
                renderTasks();
                showToast('All tasks marked as completed!', 'success');
            }
        );
    }

    function clearCompletedTasks() {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            showToast('No completed tasks to clear.', 'warning');
            return;
        }

        showConfirmModal(
            'Clear Completed Tasks',
            `Are you sure you want to delete all ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`,
            () => {
                tasks = tasks.filter(t => !t.completed);
                saveTasks();
                renderTasks();
                showToast(`Cleared ${completedCount} completed task${completedCount === 1 ? '' : 's'}.`, 'success');
            }
        );
    }

    // -------------------------------------------------------------------------
    // 9. Export & Import Tasks (JSON)
    // -------------------------------------------------------------------------
    function exportTasks() {
        if (tasks.length === 0) {
            showToast('No tasks to export.', 'warning');
            return;
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        const filename = `taskmaster_backup_${new Date().toISOString().split('T')[0]}.json`;

        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast('Tasks exported successfully!', 'success');
    }

    function importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid format: root must be an array of tasks.');
                }

                // Merge safely
                const existingIds = new Set(tasks.map(t => t.id));
                let addedCount = 0;

                imported.forEach(item => {
                    if (item.title) {
                        const newTask = {
                            id: existingIds.has(item.id) ? Date.now() + Math.random() : (item.id || Date.now()),
                            title: item.title,
                            category: item.category || 'Personal',
                            priority: item.priority || 'Medium',
                            date: item.date || '',
                            time: item.time || '',
                            completed: Boolean(item.completed),
                            createdAt: item.createdAt || Date.now()
                        };
                        tasks.push(newTask);
                        existingIds.add(newTask.id);
                        addedCount++;
                    }
                });

                saveTasks();
                renderTasks();
                showToast(`Imported ${addedCount} tasks successfully!`, 'success');
            } catch (err) {
                showToast('Failed to import: file is corrupted or not valid JSON.', 'error');
            } finally {
                elements.importFileInput.value = '';
            }
        };
        reader.readAsText(file);
    }

    // -------------------------------------------------------------------------
    // 10. Event Listeners & Binding
    // -------------------------------------------------------------------------
    function bindEvents() {
        // Form submission & cancel
        elements.taskForm.addEventListener('submit', handleFormSubmit);
        elements.cancelEditBtn.addEventListener('click', cancelEditing);

        // Search
        elements.searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            elements.clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
            renderTasks();
        });

        elements.clearSearchBtn.addEventListener('click', () => {
            elements.searchInput.value = '';
            searchQuery = '';
            elements.clearSearchBtn.classList.add('hidden');
            renderTasks();
            elements.searchInput.focus();
        });

        // Filter tabs (All, Pending, Completed, Today)
        elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                elements.filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        // Category & Sort dropdowns
        elements.filterCategory.addEventListener('change', (e) => {
            currentCategoryFilter = e.target.value;
            renderTasks();
        });

        elements.sortBy.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderTasks();
        });

        // Theme toggle
        elements.themeToggleBtn.addEventListener('click', toggleTheme);

        // Bulk operations
        elements.markAllCompletedBtn.addEventListener('click', markAllCompleted);
        elements.clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        elements.exportTasksBtn.addEventListener('click', exportTasks);
        elements.importFileInput.addEventListener('change', importTasks);

        // Modal triggers
        elements.modalConfirmBtn.addEventListener('click', () => {
            if (typeof pendingModalAction === 'function') {
                pendingModalAction();
            }
            closeConfirmModal();
        });

        elements.modalCancelBtn.addEventListener('click', closeConfirmModal);

        elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === elements.confirmModal) {
                closeConfirmModal();
            }
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Close modal on Escape
            if (e.key === 'Escape') {
                if (!elements.confirmModal.classList.contains('hidden')) {
                    closeConfirmModal();
                } else if (editingTaskId !== null) {
                    cancelEditing();
                }
            }

            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                elements.searchInput.focus();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 11. Application Kickoff
    // -------------------------------------------------------------------------
    function init() {
        initTheme();
        updateHeaderDate();
        bindEvents();
        renderTasks();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
