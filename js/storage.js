/**
 * HavenHub LocalStorage & State Management Engine
 */

const STORAGE_KEY = 'havenhub_household_data_v1';
const THEME_KEY = 'havenhub_theme_preference';

const DEFAULT_DATA = {
  household: {
    name: "Oakwood Haven",
    currency: "$",
    address: "742 Evergreen Terrace",
    createdAt: new Date().toISOString()
  },
  members: [
    { id: "m-1", name: "Alex Rivera", role: "Primary / Admin", color: "#6366f1", initials: "AR", choresCompleted: 28 },
    { id: "m-2", name: "Maya Chen", role: "Roommate", color: "#ec4899", initials: "MC", choresCompleted: 24 },
    { id: "m-3", name: "Jordan Taylor", role: "Roommate", color: "#06b6d4", initials: "JT", choresCompleted: 19 }
  ],
  chores: [
    {
      id: "c-1",
      title: "Clean kitchen counters & stovetop",
      assigneeId: "m-1",
      frequency: "daily",
      priority: "urgent",
      dueDate: getRelativeDate(0), // Today
      completed: false,
      streak: 6
    },
    {
      id: "c-2",
      title: "Take out trash & curbside recycling",
      assigneeId: "m-3",
      frequency: "weekly",
      priority: "urgent",
      dueDate: getRelativeDate(0), // Today
      completed: false,
      streak: 4
    },
    {
      id: "c-3",
      title: "Vacuum living room & sanitize door handles",
      assigneeId: "m-2",
      frequency: "weekly",
      priority: "medium",
      dueDate: getRelativeDate(1), // Tomorrow
      completed: false,
      streak: 3
    },
    {
      id: "c-4",
      title: "Water fiddle-leaf fig & balcony plants",
      assigneeId: "m-1",
      frequency: "weekly",
      priority: "low",
      dueDate: getRelativeDate(-1),
      completed: true,
      streak: 12
    },
    {
      id: "c-5",
      title: "Deep scrub bathroom tiles & shower glass",
      assigneeId: "m-3",
      frequency: "biweekly",
      priority: "medium",
      dueDate: getRelativeDate(3),
      completed: false,
      streak: 2
    }
  ],
  expenses: [
    {
      id: "e-1",
      title: "Fiber Gigabit Internet (1000Mbps)",
      category: "utilities",
      amount: 75.00,
      paidById: "m-1",
      dueDate: getRelativeDate(7),
      status: "pending",
      splitType: "equal"
    },
    {
      id: "e-2",
      title: "Electric & Natural Gas Grid Utility",
      category: "utilities",
      amount: 154.20,
      paidById: "m-2",
      dueDate: getRelativeDate(11),
      status: "pending",
      splitType: "equal"
    },
    {
      id: "e-3",
      title: "Costco Bulk Household & Cleaning Supplies",
      category: "groceries",
      amount: 128.45,
      paidById: "m-3",
      dueDate: getRelativeDate(-3),
      status: "paid",
      splitType: "equal"
    },
    {
      id: "e-4",
      title: "Monthly Rent & Lease Payment",
      category: "housing",
      amount: 2400.00,
      paidById: "m-1",
      dueDate: getRelativeDate(12),
      status: "pending",
      splitType: "equal"
    },
    {
      id: "e-5",
      title: "City Water & Waste Management",
      category: "utilities",
      amount: 62.10,
      paidById: "m-1",
      dueDate: getRelativeDate(-5),
      status: "paid",
      splitType: "equal"
    }
  ],
  pantry: [
    { id: "p-1", name: "Oat Milk (Barista Blend)", location: "pantry", quantity: 1, minQuantity: 2, unit: "cartons" },
    { id: "p-2", name: "Dark Roast Coffee Beans", location: "pantry", quantity: 2, minQuantity: 1, unit: "bags" },
    { id: "p-3", name: "Organic Free-Range Eggs", location: "fridge", quantity: 0, minQuantity: 1, unit: "carton (12pk)" },
    { id: "p-4", name: "Dishwasher Pods (Cascade Platinum)", location: "cleaning", quantity: 5, minQuantity: 10, unit: "pods" },
    { id: "p-5", name: "Extra Virgin Olive Oil", location: "pantry", quantity: 2, minQuantity: 1, unit: "bottles" },
    { id: "p-6", name: "Paper Towels (Ultra Absorbent)", location: "cleaning", quantity: 4, minQuantity: 2, unit: "rolls" },
    { id: "p-7", name: "Avocados (Hass)", location: "fridge", quantity: 3, minQuantity: 2, unit: "pcs" },
    { id: "p-8", name: "Sparkling Mineral Water", location: "fridge", quantity: 8, minQuantity: 4, unit: "cans" }
  ],
  groceryList: [
    { id: "g-1", text: "Oat Milk (Barista Blend)", bought: false, source: "auto" },
    { id: "g-2", text: "Organic Free-Range Eggs", bought: false, source: "auto" },
    { id: "g-3", text: "Dishwasher Pods (Cascade)", bought: false, source: "auto" },
    { id: "g-4", text: "Artisan Sourdough Loaf", bought: true, source: "manual" },
    { id: "g-5", text: "Organic Baby Spinach", bought: true, source: "manual" }
  ],
  maintenance: [
    {
      id: "maint-1",
      title: "HVAC Central Air Filters (MERV 11)",
      category: "HVAC",
      model: "Filtrete 20x25x1",
      lastService: getRelativeDate(-80),
      nextDue: getRelativeDate(10),
      frequencyMonths: 3,
      notes: "Installed in ceiling return intake upstairs."
    },
    {
      id: "maint-2",
      title: "Refrigerator Water Filter Replacement",
      category: "Kitchen",
      model: "Samsung Pure Cycle HAF-CIN",
      lastService: getRelativeDate(-190),
      nextDue: getRelativeDate(-5), // Overdue
      frequencyMonths: 6,
      notes: "Filter light turned orange on dispenser door."
    },
    {
      id: "maint-3",
      title: "Smoke & CO Detectors Test & Battery Check",
      category: "Safety",
      model: "First Alert Dual-Sensor",
      lastService: getRelativeDate(-150),
      nextDue: getRelativeDate(30),
      frequencyMonths: 6,
      notes: "Test test buttons on all 3 bedrooms and hallway."
    },
    {
      id: "maint-4",
      title: "Washing Machine Tub Clean Cycle",
      category: "Laundry",
      model: "LG TurboWash DirectDrive",
      lastService: getRelativeDate(-20),
      nextDue: getRelativeDate(10),
      frequencyMonths: 1,
      notes: "Run hot sanitizing cycle with affresh tablet."
    }
  ],
  contacts: [
    { id: "cnt-1", name: "Dave Miller", service: "Emergency Plumber", phone: "(555) 234-5678", email: "dave@quickdrainplumbing.com", note: "Available 24/7, knows basement valve location" },
    { id: "cnt-2", name: "VoltMasters 24/7", service: "Certified Electrician", phone: "(555) 876-5432", email: "dispatch@voltmasters.com", note: "Handled breaker box upgrade" },
    { id: "cnt-3", name: "Elena Vance (Skyline Realty)", service: "Landlord / Property Manager", phone: "(555) 901-2345", email: "elena@skylinerealty.com", note: "Contact for structural/lease matters" },
    { id: "cnt-4", name: "National Poison Control", service: "Emergency Hotline", phone: "1-800-222-1222", email: "", note: "Toll-free 24/7 poison emergency" }
  ],
  notes: [
    {
      id: "n-1",
      content: "Trash collection moved to Thursday morning this week due to the bank holiday! Put out blue bin Wed night.",
      author: "Alex",
      color: "yellow",
      date: getRelativeDate(0)
    },
    {
      id: "n-2",
      content: "Hosting friends for tabletop game night this Saturday at 7pm. Everyone is welcome to join!",
      author: "Maya",
      color: "pink",
      date: getRelativeDate(-1)
    },
    {
      id: "n-3",
      content: "Plumbing technician is coming Tuesday between 10am-12pm to test basement pressure regulator.",
      author: "Jordan",
      color: "blue",
      date: getRelativeDate(-2)
    },
    {
      id: "n-4",
      content: "WiFi Router restarted and updated. New guest network: Oakwood-Guest (PW: welcomehome).",
      author: "Alex",
      color: "green",
      date: getRelativeDate(-3)
    }
  ],
  activities: [
    { id: "act-1", text: "Alex Rivera completed 'Water fiddle-leaf fig & balcony plants'", time: "2 hours ago", memberId: "m-1" },
    { id: "act-2", text: "Jordan Taylor marked 'Costco Bulk Household' expense as Paid", time: "5 hours ago", memberId: "m-3" },
    { id: "act-3", text: "Pantry alert: 'Organic Free-Range Eggs' reached 0 stock", time: "Yesterday", memberId: "m-2" },
    { id: "act-4", text: "Maya Chen posted a new note on the Household Board", time: "Yesterday", memberId: "m-2" }
  ]
};

// Helper to get relative ISO date string (e.g. offsetDays: 0 = today, 1 = tomorrow, -1 = yesterday)
function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

class HouseholdStorage {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to load HavenHub data from localStorage, falling back to seed:", err);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  save(data = this.data) {
    try {
      this.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Failed to save HavenHub data:", err);
      return false;
    }
  }

  resetToDefault() {
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HavenHub_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.household || !parsed.chores || !parsed.expenses) {
        throw new Error("Invalid HavenHub backup structure");
      }
      this.save(parsed);
      return true;
    } catch (err) {
      console.error("Failed to import JSON:", err);
      return false;
    }
  }

  generateId(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  }

  logActivity(text, memberId = 'm-1') {
    const newAct = {
      id: this.generateId('act'),
      text,
      time: 'Just now',
      memberId
    };
    this.data.activities = [newAct, ...(this.data.activities || []).slice(0, 15)];
    this.save();
  }

  // Member helpers
  getMembers() { return this.data.members || []; }
  getMember(id) { return this.getMembers().find(m => m.id === id) || { name: "Unassigned", color: "#64748b", initials: "?" }; }
  addMember(member) {
    const newMember = { ...member, id: this.generateId('m'), choresCompleted: 0 };
    this.data.members.push(newMember);
    this.logActivity(`New household resident '${newMember.name}' joined`);
    this.save();
    return newMember;
  }
  deleteMember(id) {
    this.data.members = this.data.members.filter(m => m.id !== id);
    this.save();
  }

  // Chore helpers
  getChores() { return this.data.chores || []; }
  addChore(chore) {
    const newChore = {
      id: this.generateId('c'),
      streak: 0,
      completed: false,
      ...chore
    };
    this.data.chores.unshift(newChore);
    const member = this.getMember(newChore.assigneeId);
    this.logActivity(`New chore added: '${newChore.title}' assigned to ${member.name}`);
    this.save();
    return newChore;
  }
  toggleChore(id) {
    const chore = this.data.chores.find(c => c.id === id);
    if (!chore) return null;
    chore.completed = !chore.completed;
    if (chore.completed) {
      chore.streak = (chore.streak || 0) + 1;
      const member = this.getMember(chore.assigneeId);
      if (member) member.choresCompleted = (member.choresCompleted || 0) + 1;
      this.logActivity(`${member.name} completed chore '${chore.title}' (Streak: ${chore.streak}🔥)`);
    }
    this.save();
    return chore;
  }
  deleteChore(id) {
    this.data.chores = this.data.chores.filter(c => c.id !== id);
    this.save();
  }

  // Expense helpers
  getExpenses() { return this.data.expenses || []; }
  addExpense(expense) {
    const newExpense = {
      id: this.generateId('e'),
      status: 'pending',
      splitType: 'equal',
      ...expense
    };
    this.data.expenses.unshift(newExpense);
    this.logActivity(`New expense registered: '${newExpense.title}' ($${Number(newExpense.amount).toFixed(2)})`);
    this.save();
    return newExpense;
  }
  toggleExpenseStatus(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return null;
    expense.status = expense.status === 'paid' ? 'pending' : 'paid';
    this.logActivity(`Expense '${expense.title}' marked as ${expense.status.toUpperCase()}`);
    this.save();
    return expense;
  }
  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  // Pantry helpers
  getPantry() { return this.data.pantry || []; }
  addPantryItem(item) {
    const newItem = {
      id: this.generateId('p'),
      ...item,
      quantity: Number(item.quantity) || 0,
      minQuantity: Number(item.minQuantity) || 1
    };
    this.data.pantry.unshift(newItem);
    this.checkAutoGroceryList(newItem);
    this.logActivity(`Added to inventory: '${newItem.name}' (${newItem.quantity} ${newItem.unit})`);
    this.save();
    return newItem;
  }
  updatePantryQty(id, delta) {
    const item = this.data.pantry.find(p => p.id === id);
    if (!item) return null;
    item.quantity = Math.max(0, (item.quantity || 0) + delta);
    this.checkAutoGroceryList(item);
    this.save();
    return item;
  }
  deletePantryItem(id) {
    this.data.pantry = this.data.pantry.filter(p => p.id !== id);
    this.save();
  }
  checkAutoGroceryList(pantryItem) {
    if (pantryItem.quantity <= pantryItem.minQuantity) {
      // Check if already in grocery list
      const exists = (this.data.groceryList || []).some(g => g.text.toLowerCase() === pantryItem.name.toLowerCase() && !g.bought);
      if (!exists) {
        this.data.groceryList.unshift({
          id: this.generateId('g'),
          text: pantryItem.name,
          bought: false,
          source: 'auto'
        });
      }
    }
  }

  // Grocery List helpers
  getGroceryList() { return this.data.groceryList || []; }
  addGroceryItem(text) {
    const item = {
      id: this.generateId('g'),
      text: text.trim(),
      bought: false,
      source: 'manual'
    };
    this.data.groceryList.unshift(item);
    this.save();
    return item;
  }
  toggleGroceryItem(id) {
    const item = this.data.groceryList.find(g => g.id === id);
    if (!item) return;
    item.bought = !item.bought;
    this.save();
    return item;
  }
  clearBoughtGroceries() {
    this.data.groceryList = (this.data.groceryList || []).filter(g => !g.bought);
    this.save();
  }
  deleteGroceryItem(id) {
    this.data.groceryList = (this.data.groceryList || []).filter(g => g.id !== id);
    this.save();
  }

  // Maintenance helpers
  getMaintenance() { return this.data.maintenance || []; }
  addMaintenance(maint) {
    const newMaint = {
      id: this.generateId('maint'),
      ...maint
    };
    this.data.maintenance.unshift(newMaint);
    this.logActivity(`Logged appliance maintenance: '${newMaint.title}'`);
    this.save();
    return newMaint;
  }
  logServiceDone(id) {
    const item = this.data.maintenance.find(m => m.id === id);
    if (!item) return null;
    item.lastService = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + (Number(item.frequencyMonths) || 3));
    item.nextDue = nextDate.toISOString().split('T')[0];
    this.logActivity(`Serviced & updated schedule for: '${item.title}'`);
    this.save();
    return item;
  }
  deleteMaintenance(id) {
    this.data.maintenance = this.data.maintenance.filter(m => m.id !== id);
    this.save();
  }

  // Contacts helpers
  getContacts() { return this.data.contacts || []; }
  addContact(contact) {
    const newContact = {
      id: this.generateId('cnt'),
      ...contact
    };
    this.data.contacts.unshift(newContact);
    this.save();
    return newContact;
  }
  deleteContact(id) {
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.save();
  }

  // Notes helpers
  getNotes() { return this.data.notes || []; }
  addNote(note) {
    const newNote = {
      id: this.generateId('n'),
      date: new Date().toISOString().split('T')[0],
      ...note
    };
    this.data.notes.unshift(newNote);
    this.logActivity(`${newNote.author} pinned a new note on the Noticeboard`);
    this.save();
    return newNote;
  }
  deleteNote(id) {
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    this.save();
  }
}

// Global Store Instance
window.havenStorage = new HouseholdStorage();
