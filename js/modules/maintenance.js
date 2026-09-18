/**
 * HavenHub Maintenance & Appliances Controller
 */

function renderMaintenance() {
  const store = window.havenStorage;
  const list = store.getMaintenance();
  const container = document.getElementById('maintenance-grid-container');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔧</div>
        <h3>No appliances logged</h3>
        <p>Keep track of appliance warranties, filter replacements, and regular upkeep.</p>
        <button class="btn btn-primary btn-sm" onclick="window.openAddMaintenanceModal()">+ Add Appliance / System</button>
      </div>
    `;
    return;
  }

  const today = new Date();

  container.innerHTML = list.map(item => {
    const dueDate = new Date(item.nextDue);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusText = '';
    let statusClass = '';
    let iconEmoji = '🛠️';

    if (item.category.toLowerCase().includes('hvac')) iconEmoji = '❄️';
    else if (item.category.toLowerCase().includes('kitchen')) iconEmoji = '🧊';
    else if (item.category.toLowerCase().includes('safety')) iconEmoji = '🚨';
    else if (item.category.toLowerCase().includes('laundry')) iconEmoji = '🧺';

    if (diffDays < 0) {
      statusText = `⚠️ Overdue by ${Math.abs(diffDays)} days`;
      statusClass = 'color: var(--danger); font-weight: 700;';
    } else if (diffDays <= 14) {
      statusText = `⚡ Due in ${diffDays} days`;
      statusClass = 'color: var(--warning); font-weight: 700;';
    } else {
      statusText = `✓ Due in ${diffDays} days`;
      statusClass = 'color: var(--success); font-weight: 600;';
    }

    return `
      <div class="maintenance-card">
        <div class="maintenance-header">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div class="appliance-icon">${iconEmoji}</div>
            <div>
              <div class="appliance-title">${escapeHtml(item.title)}</div>
              <div class="appliance-model">${escapeHtml(item.model || 'Standard model')} • ${escapeHtml(item.category)}</div>
            </div>
          </div>
          <button class="icon-btn" style="width: 28px; height: 28px;" onclick="window.deleteMaintenancePrompt('${item.id}')" title="Delete">✕</button>
        </div>

        <div class="maintenance-countdown-box">
          <div>
            <div class="countdown-label">Next Service Target</div>
            <div class="countdown-val" style="${statusClass}">${statusText}</div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${item.nextDue}</span>
        </div>

        <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
          <strong>Notes:</strong> ${escapeHtml(item.notes || 'No specific notes recorded.')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <span style="font-size: 0.72rem; color: var(--text-muted);">Last: ${item.lastService || 'N/A'}</span>
          <button class="btn btn-sm btn-secondary" onclick="window.logServiceDone('${item.id}')">
            ✓ Log Serviced Today
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.logServiceDone = function(id) {
  const item = window.havenStorage.logServiceDone(id);
  if (item) {
    window.showToast(`Logged service for '${item.title}'! Schedule updated.`, 'success');
    renderMaintenance();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.deleteMaintenancePrompt = function(id) {
  if (confirm("Remove this appliance / maintenance log?")) {
    window.havenStorage.deleteMaintenance(id);
    window.showToast("Appliance record deleted", "info");
    renderMaintenance();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.openAddMaintenanceModal = function() {
  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">🔧 Log Appliance or Home System</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-maint-form" onsubmit="window.handleMaintSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">System / Appliance Name</label>
          <input type="text" id="maint-form-title" class="form-control" placeholder="e.g. Water Heater Flushing, Dryer Vent Clean" required autofocus />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="maint-form-category" class="form-control">
              <option value="HVAC">HVAC & Heating</option>
              <option value="Kitchen">Kitchen Appliances</option>
              <option value="Safety">Safety & Alarms</option>
              <option value="Laundry">Laundry</option>
              <option value="Plumbing">Plumbing</option>
              <option value="General">General Upkeep</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Model / Serial Info</label>
            <input type="text" id="maint-form-model" class="form-control" placeholder="e.g. Whirlpool W10298" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Last Serviced Date</label>
            <input type="date" id="maint-form-last" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Service Cycle (Months)</label>
            <input type="number" id="maint-form-freq" class="form-control" value="3" min="1" max="60" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Maintenance Instructions / Notes</label>
          <textarea id="maint-form-notes" class="form-control" placeholder="Filter dimensions, replacement parts, plumber tips..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Add Maintenance Item</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleMaintSubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('maint-form-title').value.trim();
  const category = document.getElementById('maint-form-category').value;
  const model = document.getElementById('maint-form-model').value.trim();
  const lastService = document.getElementById('maint-form-last').value;
  const frequencyMonths = parseInt(document.getElementById('maint-form-freq').value, 10) || 3;
  const notes = document.getElementById('maint-form-notes').value.trim();

  if (!title) return;

  const nextDue = new Date(lastService);
  nextDue.setMonth(nextDue.getMonth() + frequencyMonths);

  window.havenStorage.addMaintenance({
    title,
    category,
    model,
    lastService,
    nextDue: nextDue.toISOString().split('T')[0],
    frequencyMonths,
    notes
  });

  window.closeModal();
  window.showToast("Maintenance task scheduled!", "success");
  renderMaintenance();
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
};
