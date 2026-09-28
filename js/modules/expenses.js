/**
 * HavenHub Expenses & Bills Controller
 */

let currentExpenseCategory = 'all';

function renderExpenses() {
  const store = window.havenStorage;
  const expenses = store.getExpenses();
  const members = store.getMembers();
  const tbody = document.getElementById('expenses-table-body');
  if (!tbody) return;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Metrics
  const totalAll = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalDisplay = document.getElementById('exp-total-amount');
  if (totalDisplay) totalDisplay.textContent = `$${totalAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const paidDisplay = document.getElementById('exp-paid-amount');
  if (paidDisplay) paidDisplay.textContent = `$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const pendingDisplay = document.getElementById('exp-pending-amount');
  if (pendingDisplay) pendingDisplay.textContent = `$${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 2. Render Split Breakdown
  renderSplitCalculator(expenses, members);

  // 3. Filter Table rows
  const filtered = expenses.filter(e => {
    if (currentExpenseCategory === 'all') return true;
    return e.category === currentExpenseCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
          No bills or expenses found in this category.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    const payer = store.getMember(e.paidById);
    const isOverdue = e.status === 'pending' && e.dueDate < todayStr;
    const sharePerPerson = members.length > 0 ? (Number(e.amount) / members.length).toFixed(2) : e.amount;

    return `
      <tr>
        <td>
          <div class="expense-name-cell">
            <strong>${escapeHtml(e.title)}</strong>
            <span>Split: $${sharePerPerson}/person (${members.length} members)</span>
          </div>
        </td>
        <td>
          <span class="badge badge-info" style="text-transform: capitalize;">${escapeHtml(e.category)}</span>
        </td>
        <td>
          <span style="font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem;">
            $${Number(e.amount).toFixed(2)}
          </span>
        </td>
        <td>
          <div class="assignee-chip" style="display: inline-flex;">
            <span class="assignee-avatar" style="background: ${payer.color};">${payer.initials}</span>
            <span>${escapeHtml(payer.name.split(' ')[0])}</span>
          </div>
        </td>
        <td>
          <span style="font-size: 0.82rem; ${isOverdue ? 'color: var(--danger); font-weight: 700;' : ''}">
            ${e.dueDate || 'N/A'} ${isOverdue ? '⚠️' : ''}
          </span>
        </td>
        <td>
          <button 
            class="btn btn-sm ${e.status === 'paid' ? 'btn-secondary' : 'btn-primary'}" 
            onclick="window.toggleExpensePaid('${e.id}')"
            style="min-width: 85px;"
          >
            ${e.status === 'paid' ? '✓ Paid' : 'Pending'}
          </button>
          <button 
            class="icon-btn" 
            style="display: inline-flex; width: 28px; height: 28px; vertical-align: middle; margin-left: 6px;" 
            onclick="window.deleteExpensePrompt('${e.id}')"
            title="Delete Expense"
          >
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderSplitCalculator(expenses, members) {
  const container = document.getElementById('expense-splits-list');
  if (!container || members.length === 0) return;

  // Calculate net balance for each member
  // If Member A paid for a bill, everyone owes them total/N. Member A gets credited (total - total/N).
  const balances = {};
  members.forEach(m => { balances[m.id] = 0; });

  expenses.forEach(e => {
    const amount = Number(e.amount);
    const perPerson = amount / members.length;
    const payerId = e.paidById;

    members.forEach(m => {
      if (m.id === payerId) {
        balances[m.id] += (amount - perPerson);
      } else {
        balances[m.id] -= perPerson;
      }
    });
  });

  container.innerHTML = members.map(m => {
    const bal = balances[m.id] || 0;
    const isOwed = bal >= 0;
    const balColor = isOwed ? 'var(--success)' : 'var(--danger)';
    const balText = isOwed ? `+$${bal.toFixed(2)} (To receive)` : `-$${Math.abs(bal).toFixed(2)} (Owes house)`;

    return `
      <div class="split-member-card">
        <div class="split-member-info">
          <div class="avatar-mini" style="background: ${m.color}; width: 34px; height: 34px; font-size: 0.8rem;">
            ${m.initials}
          </div>
          <div>
            <strong style="font-size: 0.9rem; display: block;">${escapeHtml(m.name)}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(m.role)}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="split-amount" style="color: ${balColor};">
            ${balText}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.filterExpenses = function(cat, btnElement) {
  currentExpenseCategory = cat;
  document.querySelectorAll('#expense-filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderExpenses();
};

window.toggleExpensePaid = function(id) {
  const updated = window.havenStorage.toggleExpenseStatus(id);
  if (updated) {
    window.showToast(`'${updated.title}' updated to ${updated.status.toUpperCase()}`, 'success');
    renderExpenses();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.deleteExpensePrompt = function(id) {
  if (confirm("Delete this expense item?")) {
    window.havenStorage.deleteExpense(id);
    window.showToast("Expense removed", "info");
    renderExpenses();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.openAddExpenseModal = function() {
  const store = window.havenStorage;
  const members = store.getMembers();

  const currentUser = window.havenAuth?.getCurrentUser();
  const membersOptions = members.map(m => {
    const isSelected = currentUser && (m.name.toLowerCase() === currentUser.name.toLowerCase() || m.id === `m-${currentUser.id}`);
    return `<option value="${m.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(m.name)}</option>`;
  }).join('');

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">💳 Add Bill or Expense</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-expense-form" onsubmit="window.handleExpenseSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Expense Title / Description</label>
          <input type="text" id="exp-form-title" class="form-control" placeholder="e.g. Electric & Gas Grid Bill" required autofocus />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Amount ($)</label>
            <input type="number" id="exp-form-amount" class="form-control" placeholder="0.00" step="0.01" min="0.01" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="exp-form-category" class="form-control">
              <option value="utilities">Utilities</option>
              <option value="housing">Housing / Rent</option>
              <option value="groceries">Groceries & Restock</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other / Misc</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Paid By</label>
            <select id="exp-form-payer" class="form-control">
              ${membersOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" id="exp-form-due" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Add Expense</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleExpenseSubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('exp-form-title').value.trim();
  const amount = parseFloat(document.getElementById('exp-form-amount').value);
  const category = document.getElementById('exp-form-category').value;
  const paidById = document.getElementById('exp-form-payer').value;
  const dueDate = document.getElementById('exp-form-due').value;

  if (!title || isNaN(amount)) return;

  window.havenStorage.addExpense({
    title,
    amount,
    category,
    paidById,
    dueDate
  });

  window.closeModal();
  window.showToast("Expense logged successfully!", "success");
  renderExpenses();
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
};
