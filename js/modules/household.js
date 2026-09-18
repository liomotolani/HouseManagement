/**
 * HavenHub Household, Contacts & Noticeboard Controller
 */

function renderHousehold() {
  const store = window.havenStorage;
  const members = store.getMembers();
  const contacts = store.getContacts();
  const notes = store.getNotes();

  // 1. Render Residents
  const membersContainer = document.getElementById('household-members-list');
  if (membersContainer) {
    membersContainer.innerHTML = members.map(m => {
      return `
        <div class="member-card">
          <div class="member-left">
            <div class="member-avatar-lg" style="background: ${m.color};">${m.initials}</div>
            <div>
              <div class="member-name">${escapeHtml(m.name)}</div>
              <div class="member-role">${escapeHtml(m.role)} • 🏆 ${m.choresCompleted || 0} Chores completed</div>
            </div>
          </div>
          ${members.length > 1 ? `
            <button class="icon-btn" style="width: 28px; height: 28px;" onclick="window.deleteMemberPrompt('${m.id}')" title="Remove member">✕</button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // 2. Render Emergency Contacts
  const contactsContainer = document.getElementById('emergency-contacts-grid');
  if (contactsContainer) {
    if (contacts.length === 0) {
      contactsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No emergency service contacts registered.</p>`;
    } else {
      contactsContainer.innerHTML = contacts.map(c => {
        return `
          <div class="emergency-contact-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="contact-service-badge">${escapeHtml(c.service)}</span>
              <button class="icon-btn" style="width: 24px; height: 24px;" onclick="window.deleteContactPrompt('${c.id}')">✕</button>
            </div>
            <div class="contact-name">${escapeHtml(c.name)}</div>
            <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="contact-phone">
              📞 ${escapeHtml(c.phone)}
            </a>
            ${c.email ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(c.email)}</div>` : ''}
            ${c.note ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">ℹ️ ${escapeHtml(c.note)}</div>` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // 3. Render Sticky Notes on Noticeboard
  const notesContainer = document.getElementById('noticeboard-grid');
  if (notesContainer) {
    if (notes.length === 0) {
      notesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--text-muted);">
          📌 No notes on the board. Pin a quick reminder for your housemates!
        </div>
      `;
    } else {
      const tilts = [-2, 1.5, -1, 2, -1.8, 1.2];
      notesContainer.innerHTML = notes.map((n, idx) => {
        const tilt = tilts[idx % tilts.length];
        return `
          <div class="sticky-note ${n.color || 'yellow'}" style="--tilt: ${tilt}deg;">
            <div class="sticky-pin"></div>
            <div class="sticky-content">
              ${escapeHtml(n.content)}
            </div>
            <div class="sticky-footer">
              <span>— ${escapeHtml(n.author || 'Housemate')}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>${n.date || ''}</span>
                <button class="sticky-delete" onclick="window.deleteNote('${n.id}')" title="Unpin note">✕</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Update Sidebar Avatars Stack
  updateSidebarAvatars(members);
}

function updateSidebarAvatars(members) {
  const stack = document.getElementById('sidebar-avatar-stack');
  if (!stack) return;
  stack.innerHTML = members.slice(0, 4).map(m => {
    return `<div class="avatar-mini" style="background: ${m.color};" title="${escapeHtml(m.name)}">${m.initials}</div>`;
  }).join('');
}

window.deleteMemberPrompt = function(id) {
  if (confirm("Remove this resident from the household?")) {
    window.havenStorage.deleteMember(id);
    window.showToast("Resident removed", "info");
    renderHousehold();
  }
};

window.deleteContactPrompt = function(id) {
  if (confirm("Remove this emergency contact?")) {
    window.havenStorage.deleteContact(id);
    window.showToast("Contact removed", "info");
    renderHousehold();
  }
};

window.deleteNote = function(id) {
  window.havenStorage.deleteNote(id);
  window.showToast("Note unpinned", "info");
  renderHousehold();
};

window.openAddMemberModal = function() {
  const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">👤 Add Household Member</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-member-form" onsubmit="window.handleMemberSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="member-form-name" class="form-control" placeholder="e.g. Sam Winchester" required autofocus />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Role in House</label>
            <input type="text" id="member-form-role" class="form-control" placeholder="e.g. Roommate, Tenant, Family" required />
          </div>
          <div class="form-group">
            <label class="form-label">Color Tag</label>
            <input type="color" id="member-form-color" class="form-control" value="${randomColor}" style="height: 44px; padding: 2px 6px;" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Add Member</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleMemberSubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('member-form-name').value.trim();
  const role = document.getElementById('member-form-role').value.trim();
  const color = document.getElementById('member-form-color').value;

  if (!name) return;

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  window.havenStorage.addMember({
    name,
    role,
    color,
    initials
  });

  window.closeModal();
  window.showToast(`Welcome ${name} to HavenHub!`, 'success');
  renderHousehold();
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
};

window.openAddContactModal = function() {
  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">🚨 Add Emergency Contact</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-contact-form" onsubmit="window.handleContactSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Service Type / Company</label>
          <input type="text" id="contact-form-service" class="form-control" placeholder="e.g. 24/7 Locksmith, Roofer, Heating Tech" required autofocus />
        </div>
        <div class="form-group">
          <label class="form-label">Contact Name</label>
          <input type="text" id="contact-form-name" class="form-control" placeholder="e.g. City Wide Lock & Key" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="contact-form-phone" class="form-control" placeholder="(555) 000-0000" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email (Optional)</label>
            <input type="email" id="contact-form-email" class="form-control" placeholder="service@provider.com" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Important Notes</label>
          <input type="text" id="contact-form-note" class="form-control" placeholder="e.g. Available weekends, knows breaker box" />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Save Contact</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleContactSubmit = function(e) {
  e.preventDefault();
  const service = document.getElementById('contact-form-service').value.trim();
  const name = document.getElementById('contact-form-name').value.trim();
  const phone = document.getElementById('contact-form-phone').value.trim();
  const email = document.getElementById('contact-form-email').value.trim();
  const note = document.getElementById('contact-form-note').value.trim();

  if (!name || !phone) return;

  window.havenStorage.addContact({
    service,
    name,
    phone,
    email,
    note
  });

  window.closeModal();
  window.showToast("Emergency contact saved!", "success");
  renderHousehold();
};

window.openAddNoteModal = function() {
  const store = window.havenStorage;
  const members = store.getMembers();
  const memberOptions = members.map(m => `<option value="${escapeHtml(m.name.split(' ')[0])}">${escapeHtml(m.name)}</option>`).join('');

  const modalHtml = `
    <div class="modal-header">
      <h3 class="modal-title">📌 Pin Note to Noticeboard</h3>
      <button class="icon-btn" onclick="window.closeModal()">✕</button>
    </div>
    <form id="add-note-form" onsubmit="window.handleNoteSubmit(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Note Message</label>
          <textarea id="note-form-content" class="form-control" placeholder="Write your reminder, announcement, or greeting..." required autofocus></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pinned By</label>
            <select id="note-form-author" class="form-control">
              ${memberOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sticky Note Color</label>
            <select id="note-form-color" class="form-control">
              <option value="yellow">Yellow Classic</option>
              <option value="pink">Pastel Pink</option>
              <option value="blue">Sky Blue</option>
              <option value="green">Soft Mint</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">+ Pin Note</button>
      </div>
    </form>
  `;

  window.openModal(modalHtml);
};

window.handleNoteSubmit = function(e) {
  e.preventDefault();
  const content = document.getElementById('note-form-content').value.trim();
  const author = document.getElementById('note-form-author').value;
  const color = document.getElementById('note-form-color').value;

  if (!content) return;

  window.havenStorage.addNote({
    content,
    author,
    color
  });

  window.closeModal();
  window.showToast("Note pinned to board! 📌", "success");
  renderHousehold();
};
