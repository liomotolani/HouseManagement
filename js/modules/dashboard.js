/**
 * HavenHub Dashboard Controller
 */

function renderDashboard() {
  const store = window.havenStorage;
  const user = window.havenAuth?.getCurrentUser();
  const chores = store.getChores();
  const expenses = store.getExpenses();
  const pantry = store.getPantry();
  const maintenance = store.getMaintenance();
  const activities = store.data.activities || [];

  // Update Welcome Banner
  if (user) {
    const greetingTitle = document.getElementById('dash-greeting-title');
    const greetingSub = document.getElementById('dash-greeting-sub');
    const greetingRole = document.getElementById('dash-greeting-role');
    if (greetingTitle) greetingTitle.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    if (greetingSub) greetingSub.textContent = `${user.householdName || 'Household'} dashboard overview • Everything looks clean and organized.`;
    if (greetingRole) greetingRole.textContent = `👑 ${user.role || 'Primary Resident'}`;
  }

  // 1. Calculate Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingChores = chores.filter(c => !c.completed).length;
  const todayChores = chores.filter(c => c.dueDate <= todayStr && !c.completed).length;

  const pendingBills = expenses.filter(e => e.status === 'pending');
  const pendingBillsTotal = pendingBills.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const lowPantryItems = pantry.filter(p => p.quantity <= p.minQuantity).length;

  const urgentMaint = maintenance.filter(m => {
    const diffDays = Math.ceil((new Date(m.nextDue) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  }).length;

  // Render Stat Values
  document.getElementById('stat-chores-count').textContent = pendingChores;
  document.getElementById('stat-chores-sub').textContent = `${todayChores} due today or overdue`;

  document.getElementById('stat-bills-amount').textContent = `$${pendingBillsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('stat-bills-sub').textContent = `${pendingBills.length} unpaid household bills`;

  document.getElementById('stat-pantry-count').textContent = lowPantryItems;
  document.getElementById('stat-pantry-sub').textContent = lowPantryItems > 0 ? `Needs grocery restock` : `Stock levels healthy`;

  document.getElementById('stat-maint-count').textContent = urgentMaint;
  document.getElementById('stat-maint-sub').textContent = urgentMaint > 0 ? `Requires attention soon` : `All systems operational`;

  // 2. Render Expense Breakdown Donut Chart
  renderExpenseDonutChart(expenses);

  // 3. Render Today's Priority Chores
  const priorityChoresContainer = document.getElementById('dashboard-urgent-chores');
  if (priorityChoresContainer) {
    const urgentList = chores.filter(c => !c.completed).slice(0, 4);
    if (urgentList.length === 0) {
      priorityChoresContainer.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-state-icon">✨</div>
          <h3>All Chores Done!</h3>
          <p>The house is sparkling clean. Enjoy your day!</p>
        </div>
      `;
    } else {
      priorityChoresContainer.innerHTML = urgentList.map(c => {
        const member = store.getMember(c.assigneeId);
        return `
          <div class="chore-card" style="margin-bottom: 8px;">
            <div class="chore-left">
              <button class="custom-checkbox" onclick="window.toggleChoreFromDash('${c.id}')" aria-label="Toggle Complete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
              <div class="chore-details">
                <span class="chore-title">${c.title}</span>
                <div class="chore-meta">
                  <span class="badge badge-${c.priority}">${c.priority.toUpperCase()}</span>
                  <span>📅 Due: ${c.dueDate === todayStr ? 'Today' : c.dueDate}</span>
                </div>
              </div>
            </div>
            <div class="chore-right">
              <div class="assignee-chip">
                <span class="assignee-avatar" style="background: ${member.color};">${member.initials}</span>
                <span>${member.name.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Render Activity Stream
  const activityContainer = document.getElementById('dashboard-activity-feed');
  if (activityContainer) {
    if (activities.length === 0) {
      activityContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No recent activities yet.</p>`;
    } else {
      activityContainer.innerHTML = activities.slice(0, 5).map(act => {
        const member = store.getMember(act.memberId);
        return `
          <div class="activity-item">
            <div class="activity-avatar" style="background: ${member.color || '#6366f1'};">${member.initials || 'HH'}</div>
            <div class="activity-content">
              <span>${act.text}</span>
              <div class="activity-time">${act.time}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderExpenseDonutChart(expenses) {
  const chartWrapper = document.getElementById('dashboard-chart-container');
  if (!chartWrapper) return;

  const categories = {
    housing: { label: 'Housing / Rent', amount: 0, color: '#6366f1' },
    utilities: { label: 'Utilities', amount: 0, color: '#06b6d4' },
    groceries: { label: 'Groceries', amount: 0, color: '#10b981' },
    other: { label: 'Maintenance & Misc', amount: 0, color: '#f59e0b' }
  };

  let total = 0;
  expenses.forEach(e => {
    const cat = categories[e.category] ? e.category : 'other';
    categories[cat].amount += Number(e.amount);
    total += Number(e.amount);
  });

  if (total === 0) {
    chartWrapper.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No expenses recorded yet.</p>`;
    return;
  }

  // SVG Donut calculation
  const radius = 65;
  const circumference = 2 * Math.PI * radius; // ~408.4
  let currentOffset = 0;

  let slicesSvg = '';
  let legendHtml = '';

  for (const [key, data] of Object.entries(categories)) {
    if (data.amount > 0) {
      const percentage = data.amount / total;
      const strokeLength = percentage * circumference;
      const strokeDashoffset = -currentOffset;

      slicesSvg += `
        <circle 
          cx="90" cy="90" r="${radius}" 
          fill="none" 
          stroke="${data.color}" 
          stroke-width="22" 
          stroke-dasharray="${strokeLength} ${circumference - strokeLength}" 
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          style="transition: stroke-dasharray 0.5s ease;"
        />
      `;
      currentOffset += strokeLength;

      legendHtml += `
        <div class="legend-item">
          <div class="legend-color-tag">
            <div class="legend-dot" style="background: ${data.color};"></div>
            <span>${data.label}</span>
          </div>
          <span class="legend-amount">$${data.amount.toFixed(0)}</span>
        </div>
      `;
    }
  }

  chartWrapper.innerHTML = `
    <div class="chart-container">
      <svg class="chart-svg" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="${radius}" fill="none" stroke="var(--bg-tertiary)" stroke-width="22" />
        ${slicesSvg}
      </svg>
      <div class="chart-hole-text">
        <div class="chart-hole-amount">$${total.toFixed(0)}</div>
        <div class="chart-hole-label">Total Spend</div>
      </div>
      <div class="chart-legend">
        ${legendHtml}
      </div>
    </div>
  `;
}

window.toggleChoreFromDash = function(id) {
  const updated = window.havenStorage.toggleChore(id);
  if (updated) {
    window.showToast(updated.completed ? `Chore completed! Great job! 🎉` : `Chore marked incomplete`, 'success');
    window.playHapticChime();
    renderDashboard();
    if (typeof window.renderChores === 'function') window.renderChores();
  }
};
