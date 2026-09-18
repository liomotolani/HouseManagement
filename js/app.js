/**
 * HavenHub Main Application Controller & Router
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouter();
  initHeaderDate();
  initAudio();
  initSearch();

  // Initial render of default view (Dashboard)
  renderDashboard();
  renderHousehold(); // to populate sidebar avatars
});

/* =========================================
   THEME MANAGER
========================================= */
function initTheme() {
  const savedTheme = localStorage.getItem('havenhub_theme_preference') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('havenhub_theme_preference', next);
      updateThemeIcon(next);
      window.showToast(`Switched to ${next} theme`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.title = "Switch to Dark Mode";
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    btn.title = "Switch to Light Mode";
  }
}

/* =========================================
   ROUTER & NAVIGATION
========================================= */
function initRouter() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);

      // Close mobile sidebar if open
      closeMobileSidebar();
    });
  });

  // Mobile menu buttons
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (mobileToggle && sidebar && backdrop) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

window.switchTab = function(tabId) {
  // Update nav links
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Hide all tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });

  // Show selected tab view
  const targetView = document.getElementById(`tab-view-${tabId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update header title
  const headerTitle = document.getElementById('header-page-title');
  const titles = {
    'dashboard': 'Dashboard Overview',
    'chores': 'Household Chores & Tasks',
    'expenses': 'Expenses, Rent & Utilities',
    'pantry': 'Pantry Inventory & Groceries',
    'maintenance': 'Appliance & Home Maintenance',
    'household': 'Household Directory & Noticeboard',
    'settings': 'Data Management & System Settings'
  };
  if (headerTitle && titles[tabId]) {
    headerTitle.textContent = titles[tabId];
  }

  // Trigger module-specific renders
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'chores') renderChores();
  if (tabId === 'expenses') renderExpenses();
  if (tabId === 'pantry') renderPantry();
  if (tabId === 'maintenance') renderMaintenance();
  if (tabId === 'household') renderHousehold();
};

/* =========================================
   HEADER DATE & TIME
========================================= */
function initHeaderDate() {
  const dateEl = document.getElementById('header-current-date');
  if (!dateEl) return;

  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  dateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

/* =========================================
   UNIVERSAL MODAL CONTROLLER
========================================= */
window.openModal = function(contentHtml) {
  const overlay = document.getElementById('app-modal-overlay');
  const container = document.getElementById('app-modal-container');
  if (!overlay || !container) return;

  container.innerHTML = contentHtml;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  const overlay = document.getElementById('app-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// Close modal on escape key or clicking outside
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeModal();
});

document.addEventListener('click', (e) => {
  const overlay = document.getElementById('app-modal-overlay');
  if (overlay && e.target === overlay) {
    window.closeModal();
  }
});

/* =========================================
   TOAST NOTIFICATION ENGINE
========================================= */
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast`;

  let icon = 'ℹ️';
  let iconClass = 'info';
  if (type === 'success') { icon = '✓'; iconClass = 'success'; }
  else if (type === 'warning') { icon = '⚠️'; iconClass = 'warning'; }
  else if (type === 'danger' || type === 'error') { icon = '✕'; iconClass = 'error'; }

  toast.innerHTML = `
    <div class="toast-icon ${iconClass}">${icon}</div>
    <div style="flex: 1; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* =========================================
   AUDIO CHIME (WEB AUDIO API SYNTHESIZER)
========================================= */
let audioCtx = null;
function initAudio() {
  // Lazily initialized on first user gesture
}

window.playHapticChime = function() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Two-tone cheerful arpeggio chime (C5 -> G5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Audio Context blocked or not supported - silently ignore
  }
};

/* =========================================
   QUICK SEARCH FILTER
========================================= */
function initSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;

    // Check if on chores tab or others
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab');
    if (activeTab === 'chores') {
      const cards = document.querySelectorAll('#chores-list-container .chore-card');
      cards.forEach(c => {
        const text = c.textContent.toLowerCase();
        c.style.display = text.includes(q) ? 'flex' : 'none';
      });
    } else if (activeTab === 'expenses') {
      const rows = document.querySelectorAll('#expenses-table-body tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    } else if (activeTab === 'pantry') {
      const items = document.querySelectorAll('#pantry-items-grid .pantry-item-card');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }
  });
}

/* =========================================
   DATA MANAGEMENT (BACKUP / RESTORE)
========================================= */
window.handleExportData = function() {
  window.havenStorage.exportJSON();
  window.showToast("Household data exported to JSON file", "success");
};

window.handleImportData = function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const success = window.havenStorage.importJSON(evt.target.result);
    if (success) {
      window.showToast("Household data successfully restored!", "success");
      // Reload active view
      const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
      window.switchTab(activeTab);
    } else {
      window.showToast("Error restoring backup. Invalid file format.", "error");
    }
  };
  reader.readAsText(file);
};

window.handleResetDefault = function() {
  if (confirm("Are you sure you want to reset all household data to factory sample state? All custom entries will be replaced.")) {
    window.havenStorage.resetToDefault();
    window.showToast("Household reset to demo sample data", "info");
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
    window.switchTab(activeTab);
  }
};
