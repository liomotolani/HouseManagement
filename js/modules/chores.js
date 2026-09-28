/**
 * HavenHub Chores & Tasks Controller
 */

let currentChoreFilter = 'all';

function renderChores() {
  const store = window.havenStorage;
  const chores = store.getChores();
  const members = store.getMembers();
  const container = document.getElementById('chores-list-container');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter chores
  const filtered = chores.filter(c => {
    if (currentChoreFilter === 'pending') return !c.completed;
    if (currentChoreFilter === 'completed') return c.completed;
    if (currentChoreFilter === 'today') return c.dueDate <= todayStr && !c.completed;
    if (currentChoreFilter === 'urgent') return c.priority === 'urgent';
    return true; // 'all'
  });

  // Calculate chore stats
  const total = chores.length;
  const completedCount = chores.filter(c => c.completed).length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const rateDisplay = document.getElementById('chores-completion-pct');
  if (rateDisplay) rateDisplay.textContent = `${completionRate}%`;

  const barDisplay = document.getElementById('chores-progress-bar');
  if (barDisplay) barDisplay.style.width = `${completionRate}%`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No chores found</h3>
        <p>No tasks match the selected filter. Add a new chore to get started!</p>
        <button class="btn btn-primary btn-sm" onclick="window.openAddChoreModal()">+ Add New Chore</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const member = store.getMember(c.assigneeId);
    const isOverdue = !c.completed && c.dueDate < todayStr;
    const isToday = !c.completed && c.dueDate === todayStr;

    let dueBadge = `📅 ${c.dueDate}`;
    if (isOverdue) dueBadge = `<span style="color: var(--danger); font-weight:700;">⚠️ Overdue (${c.dueDate})</span>`;
    else if (isToday) dueBadge = `<span style="color: var(--warning); font-weight:700;">⚡ Due Today</span>`;

    return `
      <div class="chore-card ${c.completed ? 'completed' : ''}" id="chore-row-${c.id}">
        <div class="chore-left">
          <button class="custom-checkbox" onclick="window.toggleChore('${c.id}')" aria-label="Toggle Complete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <div class="chore-details">
            <span class="chore-title">${escapeHtml(c.title)}</span>
            <div class="chore-meta">
              <span class="badge badge-${c.priority}">${c.priority.toUpperCase()}</span>
              <span class="badge badge-neutral">🔄 ${capitalize(c.frequency)}</span>
              <span>${dueBadge}</span>
              ${c.streak > 0 ? `<span class="streak-badge">🔥 ${c.streak} Streak</span>` : ''}
            </div>
          </div>
        </div>
        <div class="chore-right">
          <div class="assignee-chip" title="Assigned to ${escapeHtml(member.name)}">
            <span class="assignee-avatar" style="background: ${member.color};">${member.initials}</span>
            <span>${escapeHtml(member.name.split(' ')[0])}</span>
          </div>
          <button class="icon-btn" style="width: 32px; height: 32px;" onclick="window.deleteChorePrompt('${c.id}')" title="Delete chore">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.filterChores = function(filterName, btnElement) {
  currentChoreFilter = filterName;
  document.querySelectorAll('#chores-filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderChores();
};

window.toggleChore = function(id) {
  const chore = window.havenStorage.toggleChore(id);
  if (chore) {
    if (chore.completed) {
      window.playHapticChime();
      window.showToast(`'${chore.title}' completed! 🎉`, 'success');
    } else {
      window.showToast(`Chore reset to pending`, 'info');
    }
    renderChores();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.deleteChorePrompt = function(id) {
  if (confirm("Are you sure you want to remove this chore?")) {
    window.havenStorage.deleteChore(id);
    window.showToast("Chore deleted", "info");
    renderChores();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.openAddChoreModal = function() {
  const store = window.havenStorage;
  const members = store.getMembers();

  const currentUser = window.havenAuth?.getCurrentUser();
  const membersOptions = members.map(m => {
    const isSelected = currentUser && (m.name.toLowerCase() === currentUser.name.toLowerCase() || m.id === `m-${currentUser.id}`);
    return `<option value="${m.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(m.name)}</option>`;
  }).join('');

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">✨ Add Household Chore</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-chore-form" onsubmit="window.handleChoreSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Chore Title</label>
          <input type="text" id="chore-form-title" class="form-control" placeholder="e.g., Sanitize refrigerator shelves" required autofocus />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Assign To</label>
            <select id="chore-form-assignee" class="form-control">
              ${membersOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="chore-form-priority" class="form-control">
              <option value="medium">Medium</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Frequency</label>
            <select id="chore-form-frequency" class="form-control">
              <option value="daily">Daily</option>
              <option value="weekly" selected>Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="one-off">One-off</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" id="chore-form-due" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Add Chore</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleChoreSubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('chore-form-title').value.trim();
  const assigneeId = document.getElementById('chore-form-assignee').value;
  const priority = document.getElementById('chore-form-priority').value;
  const frequency = document.getElementById('chore-form-frequency').value;
  const dueDate = document.getElementById('chore-form-due').value;

  if (!title) return;

  window.havenStorage.addChore({
    title,
    assigneeId,
    priority,
    frequency,
    dueDate
  });

  window.closeModal();
  window.showToast("New chore added successfully!", "success");
  renderChores();
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
