/**
 * HavenHub Main Application Controller & Router
 * Orchestrates multi-user authentication, data isolation, routing, and UI state.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouter();
  initHeaderDate();
  initAudio();
  initSearch();
  initAuth();
});

/* =========================================
   AUTHENTICATION & USER PROFILE ORCHESTRATION
========================================= */
function initAuth() {
  initAvatarColorSwatches();

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('header-user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });

  const currentUser = window.havenAuth.getCurrentUser();
  if (currentUser) {
    initLoggedInUser(currentUser);
  } else {
    // Show auth screen, hide app
    showAuthScreen();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.getElementById('app-container');
  if (authScreen) authScreen.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';

  renderAuthDemoGrid();
}

function renderAuthDemoGrid() {
  const grid = document.getElementById('auth-demo-grid');
  const restoreWrapper = document.getElementById('auth-restore-demo-wrapper');
  if (!grid) return;

  const demoUsers = window.havenAuth ? window.havenAuth.getUsers() : [];
  const demoIds = ['user-alex', 'user-maya', 'user-jordan'];
  const presentDemos = demoUsers.filter(u => demoIds.includes(u.id));

  grid.innerHTML = presentDemos.map(u => `
    <button type="button" class="demo-account-chip" onclick="window.quickDemoLogin('${escapeHtml(u.email)}', 'password123')" title="Log in as ${escapeHtml(u.name)}">
      <div class="demo-avatar-bubble" style="background: ${u.color};">${escapeHtml(u.initials)}</div>
      <span class="demo-chip-name">${escapeHtml(u.name)}</span>
      <span class="demo-chip-house">${escapeHtml(u.householdName)}</span>
    </button>
  `).join('');

  const missingCount = demoIds.length - presentDemos.length;
  if (restoreWrapper) {
    restoreWrapper.style.display = missingCount > 0 ? 'block' : 'none';
  }
}

function initLoggedInUser(user) {
  // 1. Configure scoped storage
  window.havenStorage.setUser(user.id, user);

  // 2. Hide auth screen, show main workspace
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.getElementById('app-container');
  if (authScreen) authScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';

  // 3. Update User Header Profile & Dropdown
  updateUserProfileUI(user);

  // 4. Render initial view
  renderDashboard();
  renderHousehold();
}

function updateUserProfileUI(user) {
  // Header Profile Pill
  const headerAvatar = document.getElementById('header-user-avatar');
  const headerName = document.getElementById('header-user-name');
  const headerHouse = document.getElementById('header-household-name');

  if (headerAvatar) {
    headerAvatar.textContent = user.initials;
    headerAvatar.style.background = user.color || '#6366f1';
  }
  if (headerName) headerName.textContent = user.name;
  if (headerHouse) headerHouse.textContent = user.householdName || 'Household';

  // Dropdown Popover
  const dropAvatar = document.getElementById('dropdown-user-avatar');
  const dropName = document.getElementById('dropdown-user-name');
  const dropEmail = document.getElementById('dropdown-user-email');
  const dropHouse = document.getElementById('dropdown-household-name');

  if (dropAvatar) {
    dropAvatar.textContent = user.initials;
    dropAvatar.style.background = user.color || '#6366f1';
  }
  if (dropName) dropName.textContent = user.name;
  if (dropEmail) dropEmail.textContent = user.email;
  if (dropHouse) dropHouse.textContent = `🏠 ${user.householdName || 'Household'}`;

  // Update Settings View Danger Zone Labels if present
  const settingsAccName = document.getElementById('settings-delete-account-name');
  const settingsHouseName = document.getElementById('settings-delete-household-name');
  if (settingsAccName) settingsAccName.textContent = user.name;
  if (settingsHouseName) settingsHouseName.textContent = user.householdName || 'Household';

  // Populate Switch Account List
  const switchList = document.getElementById('account-switch-list');
  if (switchList) {
    const allUsers = window.havenAuth.getUsers();
    switchList.innerHTML = allUsers.map(u => {
      const isActive = u.id === user.id;
      return `
        <div class="account-switch-item ${isActive ? 'active' : ''}">
          <div class="account-switch-left" onclick="window.switchAccount('${u.id}')" style="cursor: pointer; flex: 1; min-width: 0;">
            <div class="avatar-mini" style="background: ${u.color}; width: 26px; height: 26px; font-size: 0.68rem;">${u.initials}</div>
            <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis;">
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(u.name)}</div>
              <div style="font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(u.householdName)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${isActive ? '<span class="badge badge-success" style="font-size: 0.65rem;">Active</span>' : `
              <span style="font-size: 0.72rem; color: var(--primary); cursor: pointer; padding: 2px 4px;" onclick="window.switchAccount('${u.id}')">Switch</span>
              <button class="account-delete-quick-btn" onclick="event.stopPropagation(); window.promptDeleteAccount('${u.id}')" title="Delete account ${escapeHtml(u.name)}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  // Close open menu if open
  const userMenu = document.getElementById('header-user-menu');
  if (userMenu) userMenu.classList.remove('open');
}

function initAvatarColorSwatches() {
  const swatches = document.querySelectorAll('#avatar-color-swatches .color-swatch-item');
  const colorInput = document.getElementById('signup-color');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => {
        s.classList.remove('active');
        s.textContent = '';
      });
      swatch.classList.add('active');
      swatch.textContent = '✓';
      if (colorInput) colorInput.value = swatch.getAttribute('data-color');
    });
  });
}

function showAuthAlert(message, type = 'error') {
  const alertEl = document.getElementById('auth-alert');
  const msgEl = document.getElementById('auth-alert-message');
  const iconEl = document.getElementById('auth-alert-icon');
  if (!alertEl || !msgEl) return;

  alertEl.className = `auth-alert show ${type}`;
  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = type === 'success' ? '✓' : '⚠️';
}

function hideAuthAlert() {
  const alertEl = document.getElementById('auth-alert');
  if (alertEl) alertEl.className = 'auth-alert';
}

window.switchAuthTab = function(tab) {
  hideAuthAlert();
  const signinBtn = document.getElementById('tab-btn-signin');
  const signupBtn = document.getElementById('tab-btn-signup');
  const signinForm = document.getElementById('auth-signin-form');
  const signupForm = document.getElementById('auth-signup-form');

  if (tab === 'signin') {
    if (signinBtn) signinBtn.classList.add('active');
    if (signupBtn) signupBtn.classList.remove('active');
    if (signinForm) signinForm.classList.add('active');
    if (signupForm) signupForm.classList.remove('active');
  } else {
    if (signupBtn) signupBtn.classList.add('active');
    if (signinBtn) signinBtn.classList.remove('active');
    if (signupForm) signupForm.classList.add('active');
    if (signinForm) signinForm.classList.remove('active');
  }
};

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
};

window.handleSignInSubmit = function(e) {
  e.preventDefault();
  hideAuthAlert();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  const result = window.havenAuth.login(email, password);
  if (result.success) {
    window.showToast(`Welcome back, ${result.user.name}! 👋`, 'success');
    window.playHapticChime();
    initLoggedInUser(result.user);
  } else {
    showAuthAlert(result.message, 'error');
  }
};

window.handleSignUpSubmit = function(e) {
  e.preventDefault();
  hideAuthAlert();
  const name = document.getElementById('signup-name').value;
  const householdName = document.getElementById('signup-household').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const color = document.getElementById('signup-color').value;

  const result = window.havenAuth.signup({
    name,
    householdName,
    email,
    password,
    color
  });

  if (result.success) {
    window.showToast(`Welcome to HavenHub, ${result.user.name}! Your household is ready.`, 'success');
    window.playHapticChime();
    initLoggedInUser(result.user);
  } else {
    showAuthAlert(result.message, 'error');
  }
};

window.quickDemoLogin = function(email, password) {
  hideAuthAlert();
  const result = window.havenAuth.login(email, password);
  if (result.success) {
    window.showToast(`Logged in as ${result.user.name} (${result.user.householdName})`, 'success');
    window.playHapticChime();
    initLoggedInUser(result.user);
  } else {
    showAuthAlert(result.message, 'error');
  }
};

window.handleSignOut = function() {
  window.havenAuth.logout();
  const userMenu = document.getElementById('header-user-menu');
  if (userMenu) userMenu.classList.remove('open');
  showAuthScreen();
  window.showToast("You have been signed out", "info");
};

window.switchAccount = function(userId) {
  const result = window.havenAuth.switchUser(userId);
  if (result.success) {
    window.showToast(`Switched account to ${result.user.name}`, 'success');
    window.playHapticChime();
    initLoggedInUser(result.user);
    window.switchTab('dashboard');
  }
};

window.handleOpenAddAccount = function() {
  const userMenu = document.getElementById('header-user-menu');
  if (userMenu) userMenu.classList.remove('open');
  showAuthScreen();
  window.switchAuthTab('signup');
};

window.toggleUserMenu = function(e) {
  e.stopPropagation();
  const userMenu = document.getElementById('header-user-menu');
  if (userMenu) userMenu.classList.toggle('open');
};

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
      closeMobileSidebar();
    });
  });

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
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`tab-view-${tabId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

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
function initAudio() {}

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
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.1);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Silently ignore if audio context is blocked
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
      const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
      window.switchTab(activeTab);
    } else {
      window.showToast("Error restoring backup. Invalid file format.", "error");
    }
  };
  reader.readAsText(file);
};

window.handleResetDefault = function() {
  const user = window.havenAuth?.getCurrentUser();
  const houseName = user?.householdName || 'this household';
  if (confirm(`Are you sure you want to reset data for '${houseName}'? All custom entries will be replaced with fresh sample data.`)) {
    window.havenStorage.resetToDefault();
    window.showToast(`Reset ${houseName} data to starter state`, "info");
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
    window.switchTab(activeTab);
  }
};

/* =========================================
   ACCOUNT DELETION & DEMO RESTORE
   ========================================= */
window.promptDeleteAccount = function(userId = null) {
  const currentUser = window.havenAuth.getCurrentUser();
  const targetId = userId || (currentUser ? currentUser.id : null);
  if (!targetId) {
    window.showToast("No account selected for deletion.", "warning");
    return;
  }

  const targetUser = window.havenAuth.getUserById(targetId);
  if (!targetUser) {
    window.showToast("Account not found. It may have already been deleted.", "warning");
    updateUserProfileUI(currentUser);
    return;
  }

  const isActive = targetId === (currentUser ? currentUser.id : null);
  const remaining = window.havenAuth.getUsers().length;

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title" style="color: var(--danger);">🗑️ Delete Account</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="padding: 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid var(--danger-border); border-radius: var(--radius-md); margin-bottom: 16px;">
        <p style="margin: 0 0 6px; font-weight: 600; color: var(--danger);">You are about to permanently delete:</p>
        <p style="margin: 0; font-size: 0.9rem;"><strong>${escapeHtml(targetUser.name)}</strong> (${escapeHtml(targetUser.email)})</p>
        <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-secondary);">🏠 ${escapeHtml(targetUser.householdName)}</p>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
        This will erase the account and <strong>all private data</strong> for this household: chore streaks, split bills, pantry inventory, appliance logs, and noticeboard notes. This action <strong>cannot be reversed</strong>.
      </p>
      ${isActive ? `<p style="font-size: 0.8rem; color: var(--warning);">⚠️ This is your currently signed-in account. You will be signed out after deletion.</p>` : ''}
      <div class="form-group" style="margin-top: 16px;">
        <label class="form-label" for="delete-account-confirm">Type <strong>DELETE</strong> to confirm</label>
        <input type="text" id="delete-account-confirm" class="form-control" placeholder="Type DELETE" autocomplete="off" />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
      <button type="button" class="btn btn-danger" id="btn-confirm-account-delete" onclick="window.handleConfirmAccountDelete('${targetId}', ${isActive})">
        Permanently Delete
      </button>
    </div>
  `;

  window.openModal(modalHtml);

  const confirmInput = document.getElementById('delete-account-confirm');
  const confirmBtn = document.getElementById('btn-confirm-account-delete');
  if (confirmInput && confirmBtn) {
    confirmInput.focus();
    confirmInput.addEventListener('input', () => {
      confirmBtn.disabled = confirmInput.value.trim().toUpperCase() !== 'DELETE';
    });
    confirmBtn.disabled = true;
  }
};

window.handleConfirmAccountDelete = function(userId, wasActive) {
  const confirmInput = document.getElementById('delete-account-confirm');
  const verification = confirmInput ? confirmInput.value : '';

  const result = window.havenAuth.deleteAccount(userId, verification);
  if (!result.success) {
    window.showToast(result.message || "Deletion failed.", "error");
    return;
  }

  window.closeModal();
  window.showToast(`Account "${result.deletedUser.name}" and all its data has been deleted.`, "success");

  if (wasActive) {
    showAuthScreen();
  } else {
    const stillHere = window.havenAuth.getCurrentUser();
    if (stillHere) {
      updateUserProfileUI(stillHere);
      renderHousehold();
      renderDashboard();
    } else {
      showAuthScreen();
    }
  }
};

window.handleRestoreDemoAccounts = function() {
  const result = window.havenAuth.restoreDemoAccounts();
  if (result.success && result.count > 0) {
    window.showToast(`Restored ${result.count} demo account${result.count === 1 ? '' : 's'} (Alex, Maya, Jordan)`, "success");
  } else {
    window.showToast("Demo accounts are already present.", "info");
  }
  renderAuthDemoGrid();
  const currentUser = window.havenAuth.getCurrentUser();
  if (currentUser) updateUserProfileUI(currentUser);
};
