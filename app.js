/* ==========================================================================
   ZenTask App Core Logic
   Features: Stateful list, search/filter indices, localStorage persist,
             SVG progress circles, time-based greetings, and inline editing.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let tasks = [];
  let currentFilter = 'all'; // 'all', 'active', 'completed'
  let currentCategory = 'all'; // 'all', 'work', 'personal', 'shopping', 'fitness'
  let searchQuery = '';
  let currentSort = 'date-newest'; // 'date-newest', 'date-oldest', 'priority-desc', 'priority-asc'

  // --- Priority Value Map for Sorting ---
  const priorityWeight = {
    low: 1,
    medium: 2,
    high: 3
  };

  // --- DOM Elements ---
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  
  // Header Greeting & Date
  const userGreeting = document.getElementById('user-greeting');
  const currentDate = document.getElementById('current-date');
  
  // Stats
  const statsPercentage = document.getElementById('stats-percentage');
  const statsRatio = document.getElementById('stats-ratio');
  const progressCircle = document.getElementById('progress-circle');
  
  // Filters & Inputs
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const segmentBtns = document.querySelectorAll('.segment-btn');
  const categoryFilterSelect = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');
  
  // Footer
  const itemsLeftText = document.getElementById('items-left-text');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  // --- Initialization Function ---
  function init() {
    loadFromLocalStorage();
    setupDateTimeGreeting();
    render();
    setupEventListeners();
  }

  // --- Date, Time & Greetings Setup ---
  function setupDateTimeGreeting() {
    // Current date format (e.g., "Sunday, May 31, 2026")
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('en-US', options);

    // Time-of-day specific greeting
    const hours = today.getHours();
    let greetingText = 'Hello, Achiever';
    
    if (hours >= 5 && hours < 12) {
      greetingText = 'Good morning, Achiever 🌅';
    } else if (hours >= 12 && hours < 17) {
      greetingText = 'Good afternoon, Builder 🚀';
    } else if (hours >= 17 && hours < 21) {
      greetingText = 'Good evening, Planner 🌌';
    } else {
      greetingText = 'Time to wind down, Maker 💤';
    }
    
    userGreeting.textContent = greetingText;
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Add task submit
    taskForm.addEventListener('submit', handleAddTask);

    // Filters (Segmented tabs)
    segmentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        segmentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        render();
      });
    });

    // Category drop down filter
    categoryFilterSelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      render();
    });

    // Sort select change
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      render();
    });

    // Search query changes
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      
      // Toggle clear search button visibility
      if (searchQuery.length > 0) {
        clearSearchBtn.style.display = 'flex';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      render();
    });

    // Clear search query button click
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      render();
    });

    // Footer actions
    clearCompletedBtn.addEventListener('click', handleClearCompleted);
    resetAllBtn.addEventListener('click', handleResetAll);
  }

  // --- Task Creation Action ---
  function handleAddTask(e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    if (!taskText) return;

    // Retrieve active category & priority selection
    const categoryVal = document.querySelector('input[name="category"]:checked').value;
    const priorityVal = document.querySelector('input[name="priority"]:checked').value;

    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      priority: priorityVal,
      category: categoryVal,
      createdAt: Date.now()
    };

    tasks.push(newTask);
    saveToLocalStorage();
    render();

    // Reset Form Input text cleanly
    taskInput.value = '';
    taskInput.focus();
  }

  // --- Task Operations ---

  // Check state toggle
  function toggleTaskComplete(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    saveToLocalStorage();
    
    // Quick delay before rendering list to let checklist animations pop nicely
    setTimeout(render, 150);
  }

  // Deletion logic with slide/fade out transitions
  function deleteTask(id) {
    const taskEl = document.querySelector(`.task-item[data-id="${id}"]`);
    if (taskEl) {
      taskEl.classList.add('removing');
      
      // Delay removal from array and UI rendering until CSS exit transition ends
      taskEl.addEventListener('animationend', () => {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        render();
      });
    } else {
      tasks = tasks.filter(task => task.id !== id);
      saveToLocalStorage();
      render();
    }
  }

  // Inline editing activation
  function enableInlineEdit(id, textSpan) {
    // Prevent editing if task is already completed
    const task = tasks.find(t => t.id === id);
    if (task && task.completed) return;

    textSpan.contentEditable = true;
    textSpan.classList.add('editing');
    textSpan.focus();

    // Place cursor at the end of the text
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(textSpan);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Save triggers on blur and keydown(Enter)
    function saveEdit() {
      if (textSpan.contentEditable !== 'true') return; // already saved
      
      textSpan.contentEditable = false;
      textSpan.classList.remove('editing');
      
      const newText = textSpan.textContent.trim();
      if (newText && newText !== task.text) {
        tasks = tasks.map(t => {
          if (t.id === id) {
            return { ...t, text: newText };
          }
          return t;
        });
        saveToLocalStorage();
      } else {
        // Restore old text if empty or unchanged
        textSpan.textContent = task.text;
      }
      
      // Clean up event listeners
      textSpan.removeEventListener('blur', saveEdit);
      textSpan.removeEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevents line breaks
        saveEdit();
      }
      if (e.key === 'Escape') {
        textSpan.textContent = task.text; // Revert change
        textSpan.contentEditable = false;
        textSpan.classList.remove('editing');
        textSpan.removeEventListener('blur', saveEdit);
        textSpan.removeEventListener('keydown', handleKeydown);
      }
    }

    textSpan.addEventListener('blur', saveEdit);
    textSpan.addEventListener('keydown', handleKeydown);
  }

  // Footer - Clear completed items
  function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (confirm(`Are you sure you want to clear all ${completedCount} completed task(s)?`)) {
      const completedIds = tasks.filter(t => t.completed).map(t => t.id);
      const visibleCompletedIds = completedIds.filter(id => document.querySelector(`.task-item[data-id="${id}"]`));

      if (visibleCompletedIds.length > 0) {
        let animatedCount = 0;
        visibleCompletedIds.forEach(id => {
          const el = document.querySelector(`.task-item[data-id="${id}"]`);
          if (el) {
            el.classList.add('removing');
            el.addEventListener('animationend', () => {
              animatedCount++;
              if (animatedCount === visibleCompletedIds.length) {
                tasks = tasks.filter(t => !t.completed);
                saveToLocalStorage();
                render();
              }
            });
          }
        });
      } else {
        tasks = tasks.filter(t => !t.completed);
        saveToLocalStorage();
        render();
      }
    }
  }

  // Footer - Reset all app data
  function handleResetAll() {
    if (confirm('Warning: This will delete ALL tasks (both active and completed) and clear your board entirely. Proceed?')) {
      // Add removing class to all active items for a satisfying cascade delete sweep animation
      const items = document.querySelectorAll('.task-item');
      if (items.length > 0) {
        try {
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('removing');
              if (index === items.length - 1) {
                item.addEventListener('animationend', () => {
                  tasks = [];
                  saveToLocalStorage();
                  render();
                });
              }
            }, index * 40); // Cascading exit effect
          });
        } catch (e) {
          tasks = [];
          saveToLocalStorage();
          render();
        }
      } else {
        tasks = [];
        saveToLocalStorage();
        render();
      }
    }
  }

  // --- Filters, Sorting, Search Application ---
  function getFilteredAndSortedTasks() {
    return tasks
      .filter(task => {
        // Status filter
        const matchStatus = 
          currentFilter === 'all' || 
          (currentFilter === 'active' && !task.completed) || 
          (currentFilter === 'completed' && task.completed);
        
        // Category filter
        const matchCategory = 
          currentCategory === 'all' || 
          task.category === currentCategory;

        // Search query filter
        const matchSearch = 
          task.text.toLowerCase().includes(searchQuery);

        return matchStatus && matchCategory && matchSearch;
      })
      .sort((a, b) => {
        // Sort switch
        switch (currentSort) {
          case 'date-newest':
            return b.createdAt - a.createdAt;
          case 'date-oldest':
            return a.createdAt - b.createdAt;
          case 'priority-desc':
            return priorityWeight[b.priority] - priorityWeight[a.priority] || b.createdAt - a.createdAt;
          case 'priority-asc':
            return priorityWeight[a.priority] - priorityWeight[b.priority] || b.createdAt - a.createdAt;
          default:
            return b.createdAt - a.createdAt;
        }
      });
  }

  // --- Rendering UI & Calculations ---
  function render() {
    const listData = getFilteredAndSortedTasks();
    taskList.innerHTML = '';

    // Render list items dynamically
    if (listData.length === 0) {
      taskList.style.display = 'none';
      emptyState.style.display = 'flex';
      updateEmptyStateText();
    } else {
      taskList.style.display = 'flex';
      emptyState.style.display = 'none';

      listData.forEach(task => {
        const itemEl = createTaskDOMElement(task);
        taskList.appendChild(itemEl);
      });
    }

    // Refresh dynamic widgets (Lucide icons, stats calculations, footer text)
    lucide.createIcons();
    updateProgressTracker();
  }

  // Factory for task items
  function createTaskDOMElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);
    li.setAttribute('data-category', task.category);

    // Custom checkmark selector
    const checkLabel = document.createElement('label');
    checkLabel.className = 'checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

    const checkmark = document.createElement('span');
    checkmark.className = 'checkbox-checkmark';
    checkmark.innerHTML = '<i data-lucide="check"></i>';

    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(checkmark);

    // Item text & metadata column
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-item-content';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    // Allow double-click inline editing
    textSpan.addEventListener('dblclick', () => enableInlineEdit(task.id, textSpan));

    const metaRow = document.createElement('div');
    metaRow.className = 'task-meta-row';

    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge badge-priority-${task.priority}`;
    priorityBadge.textContent = task.priority;

    // Category badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge badge-category';
    
    // Add custom icon inside category badge
    let categoryIcon = 'tag';
    if (task.category === 'work') categoryIcon = 'briefcase';
    else if (task.category === 'personal') categoryIcon = 'user';
    else if (task.category === 'shopping') categoryIcon = 'shopping-bag';
    else if (task.category === 'fitness') categoryIcon = 'dumbbell';
    
    categoryBadge.innerHTML = `<i data-lucide="${categoryIcon}"></i> ${task.category}`;

    metaRow.appendChild(priorityBadge);
    metaRow.appendChild(categoryBadge);
    
    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(metaRow);

    // Actions block (Edit & Delete)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn btn-edit';
    editBtn.setAttribute('aria-label', 'Edit Task');
    editBtn.innerHTML = '<i data-lucide="edit-3"></i>';
    editBtn.disabled = task.completed;
    editBtn.addEventListener('click', () => enableInlineEdit(task.id, textSpan));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn btn-delete';
    deleteBtn.setAttribute('aria-label', 'Delete Task');
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(checkLabel);
    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);

    return li;
  }

  // Adjust empty state illustration text relative to filters applied
  function updateEmptyStateText() {
    const titleEl = document.getElementById('empty-title');
    const descEl = document.getElementById('empty-description');

    if (searchQuery.length > 0) {
      titleEl.textContent = 'No Matches Found';
      descEl.textContent = `We couldn't find any tasks matching "${searchQuery}". Try editing your keyword search.`;
    } else if (currentFilter === 'completed') {
      titleEl.textContent = 'No Completed Tasks';
      descEl.textContent = "You haven't completed any tasks yet today. Keep working, you can do it!";
    } else if (currentFilter === 'active') {
      titleEl.textContent = 'No Active Tasks';
      descEl.textContent = "You don't have any pending tasks right now. Create a new objective to begin!";
    } else if (currentCategory !== 'all') {
      titleEl.textContent = `No Tasks in ${currentCategory.toUpperCase()}`;
      descEl.textContent = `Your ${currentCategory} section is currently clean. Switch categories or add a task!`;
    } else {
      titleEl.textContent = 'All Caught Up!';
      descEl.textContent = 'Create a task above to begin organizing your goals for today.';
    }
  }

  // Update dynamic stats metrics (Percentage counters, progress SVG animations)
  function updateProgressTracker() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    // Update Percentage counter
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    statsPercentage.textContent = `${pct}%`;
    
    // Update ratio text label
    statsRatio.textContent = `${completed} of ${total} task${total !== 1 ? 's' : ''} completed`;
    
    // Update remaining items count (footer)
    itemsLeftText.textContent = `${active} active item${active !== 1 ? 's' : ''} remaining`;

    // SVG Circle Stroke Animation Math
    const strokeDashOffset = 150.79 - (150.79 * pct) / 100;
    progressCircle.style.strokeDashoffset = strokeDashOffset;

    // Toggle Clear Completed button activation state
    if (completed > 0) {
      clearCompletedBtn.style.opacity = '1';
      clearCompletedBtn.style.pointerEvents = 'auto';
    } else {
      clearCompletedBtn.style.opacity = '0.5';
      clearCompletedBtn.style.pointerEvents = 'none';
    }
  }

  // --- Local Storage Functions ---
  function saveToLocalStorage() {
    localStorage.setItem('zentask-state', JSON.stringify(tasks));
  }

  function loadFromLocalStorage() {
    const storedState = localStorage.getItem('zentask-state');
    if (storedState) {
      try {
        tasks = JSON.parse(storedState);
      } catch (e) {
        console.error('Failed to parse localStorage task items:', e);
        tasks = [];
      }
    } else {
      // Load some initial, beautiful demo tasks so the app doesn't look barren on first run
      tasks = [
        {
          id: 'demo-1',
          text: 'Double-click any task to edit its text in real-time 📝',
          completed: false,
          priority: 'low',
          category: 'personal',
          createdAt: Date.now() - 3600000 * 3
        },
        {
          id: 'demo-2',
          text: 'Set priority levels and filter tasks by categories for high productivity ⚡',
          completed: false,
          priority: 'high',
          category: 'work',
          createdAt: Date.now() - 3600000 * 2
        },
        {
          id: 'demo-3',
          text: 'Check this task to observe the glowing SVG progress bar complete! 🎉',
          completed: true,
          priority: 'medium',
          category: 'fitness',
          createdAt: Date.now() - 3600000 * 1
        }
      ];
      saveToLocalStorage();
    }
  }

  // --- Kickoff Application ---
  init();
});
