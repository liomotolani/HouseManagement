/**
 * HavenHub Pantry & Groceries Controller
 */

let currentPantryLocation = 'all';

function renderPantry() {
  const store = window.havenStorage;
  const items = store.getPantry();
  const groceries = store.getGroceryList();
  const gridContainer = document.getElementById('pantry-items-grid');
  const groceryContainer = document.getElementById('grocery-checklist-container');
  if (!gridContainer || !groceryContainer) return;

  // 1. Render Inventory Items
  const filtered = items.filter(item => {
    if (currentPantryLocation === 'all') return true;
    return item.location === currentPantryLocation;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🥫</div>
        <h3>No items found</h3>
        <p>Your inventory in this location is empty.</p>
        <button class="btn btn-primary btn-sm" onclick="window.openAddPantryModal()">+ Add Inventory Item</button>
      </div>
    `;
  } else {
    gridContainer.innerHTML = filtered.map(item => {
      const isOut = item.quantity === 0;
      const isLow = !isOut && item.quantity <= item.minQuantity;

      let statusBadge = `<span class="badge badge-low">In Stock</span>`;
      let cardClass = '';

      if (isOut) {
        statusBadge = `<span class="badge badge-urgent">Out of Stock</span>`;
        cardClass = 'out-stock';
      } else if (isLow) {
        statusBadge = `<span class="badge badge-medium">Low Stock</span>`;
        cardClass = 'low-stock';
      }

      return `
        <div class="pantry-item-card ${cardClass}">
          <div class="pantry-item-header">
            <div>
              <div class="pantry-item-title">${escapeHtml(item.name)}</div>
              <div class="pantry-item-location">📍 ${escapeHtml(item.location)}</div>
            </div>
            ${statusBadge}
          </div>
          
          <div class="pantry-qty-control">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Stock:</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="qty-btn" onclick="window.updateItemQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-display">${item.quantity} ${escapeHtml(item.unit || '')}</span>
              <button class="qty-btn" onclick="window.updateItemQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 0.72rem; color: var(--text-muted);">Min Level: ${item.minQuantity}</span>
            <button class="icon-btn" style="width: 24px; height: 24px;" onclick="window.deletePantryPrompt('${item.id}')" title="Remove item">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Grocery Checklist
  if (groceries.length === 0) {
    groceryContainer.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">
        🛒 Shopping list is empty! Everything is well stocked.
      </div>
    `;
  } else {
    groceryContainer.innerHTML = groceries.map(g => {
      return `
        <div class="grocery-check-item ${g.bought ? 'bought' : ''}">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <input 
              type="checkbox" 
              ${g.bought ? 'checked' : ''} 
              onchange="window.toggleGroceryBought('${g.id}')" 
              style="width: 17px; height: 17px; cursor: pointer; accent-color: var(--primary);" 
            />
            <span style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(g.text)}</span>
            ${g.source === 'auto' ? '<span class="badge badge-warning" style="font-size: 0.65rem;">Auto-Restock</span>' : ''}
          </div>
          <button class="icon-btn" style="width: 24px; height: 24px;" onclick="window.deleteGrocery('${g.id}')" title="Remove">✕</button>
        </div>
      `;
    }).join('');
  }
}

window.filterPantry = function(location, btnElement) {
  currentPantryLocation = location;
  document.querySelectorAll('#pantry-filter-pills .filter-pill').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderPantry();
};

window.updateItemQty = function(id, delta) {
  const item = window.havenStorage.updatePantryQty(id, delta);
  if (item) {
    if (item.quantity <= item.minQuantity && delta < 0) {
      window.showToast(`'${item.name}' is low! Added to your grocery list.`, 'warning');
    }
    renderPantry();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.deletePantryPrompt = function(id) {
  if (confirm("Remove this item from inventory?")) {
    window.havenStorage.deletePantryItem(id);
    window.showToast("Item deleted", "info");
    renderPantry();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
  }
};

window.toggleGroceryBought = function(id) {
  window.havenStorage.toggleGroceryItem(id);
  renderPantry();
};

window.deleteGrocery = function(id) {
  window.havenStorage.deleteGroceryItem(id);
  renderPantry();
};

window.clearBoughtGroceries = function() {
  window.havenStorage.clearBoughtGroceries();
  window.showToast("Cleared completed grocery items", "info");
  renderPantry();
};

window.addQuickGrocery = function(e) {
  e.preventDefault();
  const input = document.getElementById('quick-grocery-input');
  const val = input.value.trim();
  if (val) {
    window.havenStorage.addGroceryItem(val);
    input.value = '';
    renderPantry();
    window.showToast("Item added to shopping list", "success");
  }
};

window.openAddPantryModal = function() {
  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">🥫 Add Inventory Item</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-pantry-form" onsubmit="window.handlePantrySubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Item Name</label>
          <input type="text" id="pantry-form-name" class="form-control" placeholder="e.g. Greek Yogurt, Dish Soap" required autofocus />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location</label>
            <select id="pantry-form-location" class="form-control">
              <option value="pantry">Pantry / Dry Storage</option>
              <option value="fridge">Refrigerator & Freezer</option>
              <option value="cleaning">Cleaning & Household</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Unit of Measure</label>
            <input type="text" id="pantry-form-unit" class="form-control" placeholder="e.g. bottles, pcs, boxes" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Current Quantity</label>
            <input type="number" id="pantry-form-qty" class="form-control" value="1" min="0" required />
          </div>
          <div class="form-group">
            <label class="form-label">Min Alert Threshold</label>
            <input type="number" id="pantry-form-min" class="form-control" value="1" min="0" required />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Add Item</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handlePantrySubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('pantry-form-name').value.trim();
  const location = document.getElementById('pantry-form-location').value;
  const unit = document.getElementById('pantry-form-unit').value.trim() || 'units';
  const quantity = parseInt(document.getElementById('pantry-form-qty').value, 10);
  const minQuantity = parseInt(document.getElementById('pantry-form-min').value, 10);

  if (!name) return;

  window.havenStorage.addPantryItem({
    name,
    location,
    unit,
    quantity,
    minQuantity
  });

  window.closeModal();
  window.showToast("Inventory item saved!", "success");
  renderPantry();
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
};
