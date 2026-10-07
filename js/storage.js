/**
 * HavenHub LocalStorage & State Management Engine
 * Provides scoped multi-user data isolation. Each user has their own
 * dedicated household database, isolated chores, expenses, pantry,
 * maintenance, contacts, and notes.
 */

// Helper to get relative ISO date string (e.g. offsetDays: 0 = today, 1 = tomorrow, -1 = yesterday)
function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Default dataset for Alex Rivera (Oakwood Haven)
function getAlexSeedData() {
  return {
    household: {
      name: "Oakwood Haven",
      currency: "$",
      address: "742 Evergreen Terrace",
      createdAt: new Date().toISOString()
    },
    members: [
      { id: "m-alex", name: "Alex Rivera", role: "Primary / Admin", color: "#6366f1", initials: "AR", choresCompleted: 28 },
      { id: "m-alex-roommate1", name: "Maya Chen", role: "Roommate", color: "#ec4899", initials: "MC", choresCompleted: 24 },
      { id: "m-alex-roommate2", name: "Jordan Taylor", role: "Roommate", color: "#06b6d4", initials: "JT", choresCompleted: 19 }
    ],
    chores: [
      {
        id: "c-1",
        title: "Clean kitchen counters & stovetop",
        assigneeId: "m-alex",
        frequency: "daily",
        priority: "urgent",
        dueDate: getRelativeDate(0),
        completed: false,
        streak: 6
      },
      {
        id: "c-2",
        title: "Take out trash & curbside recycling",
        assigneeId: "m-alex-roommate2",
        frequency: "weekly",
        priority: "urgent",
        dueDate: getRelativeDate(0),
        completed: false,
        streak: 4
      },
      {
        id: "c-3",
        title: "Vacuum living room & sanitize door handles",
        assigneeId: "m-alex-roommate1",
        frequency: "weekly",
        priority: "medium",
        dueDate: getRelativeDate(1),
        completed: false,
        streak: 3
      },
      {
        id: "c-4",
        title: "Water fiddle-leaf fig & balcony plants",
        assigneeId: "m-alex",
        frequency: "weekly",
        priority: "low",
        dueDate: getRelativeDate(-1),
        completed: true,
        streak: 12
      },
      {
        id: "c-5",
        title: "Deep scrub bathroom tiles & shower glass",
        assigneeId: "m-alex-roommate2",
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
        paidById: "m-alex",
        dueDate: getRelativeDate(7),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "e-2",
        title: "Electric & Natural Gas Grid Utility",
        category: "utilities",
        amount: 154.20,
        paidById: "m-alex-roommate1",
        dueDate: getRelativeDate(11),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "e-3",
        title: "Costco Bulk Household & Cleaning Supplies",
        category: "groceries",
        amount: 128.45,
        paidById: "m-alex-roommate2",
        dueDate: getRelativeDate(-3),
        status: "paid",
        splitType: "equal"
      },
      {
        id: "e-4",
        title: "Monthly Rent & Lease Payment",
        category: "housing",
        amount: 2400.00,
        paidById: "m-alex",
        dueDate: getRelativeDate(12),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "e-5",
        title: "City Water & Waste Management",
        category: "utilities",
        amount: 62.10,
        paidById: "m-alex",
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
      { id: "g-3", text: "Dishwasher Pods (Cascade Platinum)", bought: false, source: "auto" },
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
        nextDue: getRelativeDate(-5),
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
      { id: "act-1", text: "Alex Rivera completed 'Water fiddle-leaf fig & balcony plants'", time: "2 hours ago", memberId: "m-alex" },
      { id: "act-2", text: "Jordan Taylor marked 'Costco Bulk Household' expense as Paid", time: "5 hours ago", memberId: "m-alex-roommate2" },
      { id: "act-3", text: "Pantry alert: 'Organic Free-Range Eggs' reached 0 stock", time: "Yesterday", memberId: "m-alex-roommate1" },
      { id: "act-4", text: "Maya Chen posted a new note on the Household Board", time: "Yesterday", memberId: "m-alex-roommate1" }
    ]
  };
}

// Default dataset for Maya Chen (Skyline Loft)
function getMayaSeedData() {
  return {
    household: {
      name: "Skyline Loft",
      currency: "$",
      address: "Penthouse 4B, 108 Mercer Street",
      createdAt: new Date().toISOString()
    },
    members: [
      { id: "m-maya", name: "Maya Chen", role: "Primary / Admin", color: "#ec4899", initials: "MC", choresCompleted: 18 },
      { id: "m-maya-mate", name: "Leo Tanaka", role: "Design Partner", color: "#06b6d4", initials: "LT", choresCompleted: 12 }
    ],
    chores: [
      {
        id: "cm-1",
        title: "Water rooftop terrace plants & herbs",
        assigneeId: "m-maya",
        frequency: "daily",
        priority: "urgent",
        dueDate: getRelativeDate(0),
        completed: false,
        streak: 5
      },
      {
        id: "cm-2",
        title: "Descale espresso machine & wipe steam wand",
        assigneeId: "m-maya",
        frequency: "weekly",
        priority: "medium",
        dueDate: getRelativeDate(1),
        completed: false,
        streak: 3
      },
      {
        id: "cm-3",
        title: "Wipe down drafting desk & dual monitors",
        assigneeId: "m-maya-mate",
        frequency: "weekly",
        priority: "low",
        dueDate: getRelativeDate(-1),
        completed: true,
        streak: 8
      },
      {
        id: "cm-4",
        title: "Sanitize kitchen counter & organize spice racks",
        assigneeId: "m-maya",
        frequency: "biweekly",
        priority: "medium",
        dueDate: getRelativeDate(2),
        completed: false,
        streak: 2
      }
    ],
    expenses: [
      {
        id: "em-1",
        title: "Loft Fiber Optic Mesh Internet",
        category: "utilities",
        amount: 89.00,
        paidById: "m-maya",
        dueDate: getRelativeDate(5),
        status: "paid",
        splitType: "equal"
      },
      {
        id: "em-2",
        title: "Green Solar Electric Utility",
        category: "utilities",
        amount: 118.50,
        paidById: "m-maya-mate",
        dueDate: getRelativeDate(9),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "em-3",
        title: "Whole Foods Organic Market Restock",
        category: "groceries",
        amount: 165.80,
        paidById: "m-maya",
        dueDate: getRelativeDate(3),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "em-4",
        title: "Monthly Loft Lease & Parking Space",
        category: "housing",
        amount: 2100.00,
        paidById: "m-maya",
        dueDate: getRelativeDate(14),
        status: "pending",
        splitType: "equal"
      }
    ],
    pantry: [
      { id: "pm-1", name: "Nitro Cold Brew Cans", location: "fridge", quantity: 2, minQuantity: 4, unit: "cans" },
      { id: "pm-2", name: "Artisanal Almond Butter", location: "pantry", quantity: 1, minQuantity: 1, unit: "jars" },
      { id: "pm-3", name: "Gluten-Free Rolled Oats", location: "pantry", quantity: 2, minQuantity: 1, unit: "bags" },
      { id: "pm-4", name: "Eco Lavender Surface Spray", location: "cleaning", quantity: 1, minQuantity: 2, unit: "bottles" }
    ],
    groceryList: [
      { id: "gm-1", text: "Nitro Cold Brew Cans", bought: false, source: "auto" },
      { id: "gm-2", text: "Eco Lavender Surface Spray", bought: false, source: "auto" },
      { id: "gm-3", text: "Organic Blueberries", bought: false, source: "manual" }
    ],
    maintenance: [
      {
        id: "mm-1",
        title: "De'Longhi Espresso Group Head Clean",
        category: "Kitchen",
        model: "Specialista Prestigio",
        lastService: getRelativeDate(-25),
        nextDue: getRelativeDate(5),
        frequencyMonths: 1,
        notes: "Run backflush tablet cycle and clean portafilter basket."
      },
      {
        id: "mm-2",
        title: "Dyson Pure Cool HEPA Filter",
        category: "HVAC",
        model: "TP04 Purifier",
        lastService: getRelativeDate(-160),
        nextDue: getRelativeDate(20),
        frequencyMonths: 6,
        notes: "Check filter health percentage via Dyson app."
      }
    ],
    contacts: [
      { id: "cm-1", name: "Marco Rossi (Superintendent)", service: "Building Access & Plumbing", phone: "(555) 345-9876", email: "marco@skylineproperties.com", note: "On-site Mon-Fri 8am-4pm, master key for terrace" },
      { id: "cm-2", name: "Metro Artisan Appliance", service: "Espresso & Oven Repairs", phone: "(555) 789-0123", email: "support@metroartisan.com", note: "Certified technician for Italian espresso machines" }
    ],
    notes: [
      {
        id: "nm-1",
        content: "Architectural client design presentation this Friday at 2pm. Keeping music low please!",
        author: "Maya",
        color: "pink",
        date: getRelativeDate(0)
      },
      {
        id: "nm-2",
        content: "Fresh sourdough loaf from bakery downstairs is on the kitchen island.",
        author: "Leo",
        color: "yellow",
        date: getRelativeDate(-1)
      }
    ],
    activities: [
      { id: "actm-1", text: "Maya Chen completed 'Water rooftop terrace plants'", time: "3 hours ago", memberId: "m-maya" },
      { id: "actm-2", text: "Pantry alert: 'Nitro Cold Brew Cans' reached low stock", time: "Yesterday", memberId: "m-maya" }
    ]
  };
}

// Default dataset for Jordan Taylor (Pinecrest Studio)
function getJordanSeedData() {
  return {
    household: {
      name: "Pinecrest Studio",
      currency: "$",
      address: "142 Pinecrest Blvd, Suite 2",
      createdAt: new Date().toISOString()
    },
    members: [
      { id: "m-jordan", name: "Jordan Taylor", role: "Primary / Admin", color: "#06b6d4", initials: "JT", choresCompleted: 15 }
    ],
    chores: [
      {
        id: "cj-1",
        title: "Dust synthesizer keyboards & mixing console",
        assigneeId: "m-jordan",
        frequency: "weekly",
        priority: "medium",
        dueDate: getRelativeDate(0),
        completed: false,
        streak: 7
      },
      {
        id: "cj-2",
        title: "Vacuum acoustic soundproofing rugs",
        assigneeId: "m-jordan",
        frequency: "weekly",
        priority: "low",
        dueDate: getRelativeDate(1),
        completed: false,
        streak: 4
      },
      {
        id: "cj-3",
        title: "Sanitize studio microphone grilles & pop filters",
        assigneeId: "m-jordan",
        frequency: "monthly",
        priority: "urgent",
        dueDate: getRelativeDate(4),
        completed: false,
        streak: 2
      }
    ],
    expenses: [
      {
        id: "ej-1",
        title: "Dedicated Audio Streaming Gigabit Internet",
        category: "utilities",
        amount: 95.00,
        paidById: "m-jordan",
        dueDate: getRelativeDate(4),
        status: "paid",
        splitType: "equal"
      },
      {
        id: "ej-2",
        title: "Monthly Studio Space Lease",
        category: "housing",
        amount: 1450.00,
        paidById: "m-jordan",
        dueDate: getRelativeDate(15),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "ej-3",
        title: "Studio Equipment Insurance Policy",
        category: "other",
        amount: 65.00,
        paidById: "m-jordan",
        dueDate: getRelativeDate(-2),
        status: "paid",
        splitType: "equal"
      }
    ],
    pantry: [
      { id: "pj-1", name: "Ceremonial Matcha Powder", location: "pantry", quantity: 3, minQuantity: 1, unit: "tins" },
      { id: "pj-2", name: "Natural Spring Alkaline Water", location: "pantry", quantity: 12, minQuantity: 6, unit: "bottles" },
      { id: "pj-3", name: "Raw Honeycomb", location: "pantry", quantity: 1, minQuantity: 1, unit: "jars" }
    ],
    groceryList: [
      { id: "gj-1", text: "Organic Herbal Throat Lozenges", bought: false, source: "manual" }
    ],
    maintenance: [
      {
        id: "mj-1",
        title: "Studio Humidifier De-calcification",
        category: "HVAC",
        model: "Venta LW45 Comfort Plus",
        lastService: getRelativeDate(-45),
        nextDue: getRelativeDate(15),
        frequencyMonths: 2,
        notes: "Crucial for wooden acoustic instruments. Maintain 45% relative humidity."
      }
    ],
    contacts: [
      { id: "cntj-1", name: "Trent Rezner (Acoustic Tech)", service: "Audio & Electrical Isolation", phone: "(555) 432-1098", email: "trent@soundisolationpro.com", note: "Tuned room treatment, understands ground loops" }
    ],
    notes: [
      {
        id: "nj-1",
        content: "Live recording session Wednesday 1pm-4pm. Please maintain quiet in hallway.",
        author: "Jordan",
        color: "blue",
        date: getRelativeDate(0)
      }
    ],
    activities: [
      { id: "actj-1", text: "Jordan Taylor logged 'Audio Streaming Gigabit Internet' as Paid", time: "4 hours ago", memberId: "m-jordan" }
    ]
  };
}

// Default dataset for any newly registered user
function getNewUserSeedData(user) {
  const memberId = `m-${user.id || 'owner'}`;
  return {
    household: {
      name: user.householdName || `${user.name}'s Haven`,
      currency: "$",
      address: "Personal Residence",
      createdAt: new Date().toISOString()
    },
    members: [
      {
        id: memberId,
        name: user.name,
        role: "Primary / Admin",
        color: user.color || "#6366f1",
        initials: user.initials || "ME",
        choresCompleted: 0
      }
    ],
    chores: [
      {
        id: "cn-1",
        title: "Complete initial household walkthrough & chore checklist",
        assigneeId: memberId,
        frequency: "daily",
        priority: "urgent",
        dueDate: getRelativeDate(0),
        completed: false,
        streak: 0
      },
      {
        id: "cn-2",
        title: "Wipe down kitchen countertops & sink",
        assigneeId: memberId,
        frequency: "weekly",
        priority: "medium",
        dueDate: getRelativeDate(1),
        completed: false,
        streak: 0
      },
      {
        id: "cn-3",
        title: "Take out trash & recycling bins",
        assigneeId: memberId,
        frequency: "weekly",
        priority: "low",
        dueDate: getRelativeDate(2),
        completed: false,
        streak: 0
      }
    ],
    expenses: [
      {
        id: "en-1",
        title: "Monthly Rent / Mortgage",
        category: "housing",
        amount: 1850.00,
        paidById: memberId,
        dueDate: getRelativeDate(10),
        status: "pending",
        splitType: "equal"
      },
      {
        id: "en-2",
        title: "High-Speed Internet Service",
        category: "utilities",
        amount: 65.00,
        paidById: memberId,
        dueDate: getRelativeDate(6),
        status: "pending",
        splitType: "equal"
      }
    ],
    pantry: [
      { id: "pn-1", name: "Ground Coffee Beans", location: "pantry", quantity: 2, minQuantity: 1, unit: "bags" },
      { id: "pn-2", name: "Fresh Milk / Oat Milk", location: "fridge", quantity: 1, minQuantity: 2, unit: "cartons" },
      { id: "pn-3", name: "Dish Soap Liquid", location: "cleaning", quantity: 1, minQuantity: 1, unit: "bottles" },
      { id: "pn-4", name: "Paper Towels", location: "cleaning", quantity: 3, minQuantity: 2, unit: "rolls" }
    ],
    groceryList: [
      { id: "gn-1", text: "Fresh Milk / Oat Milk", bought: false, source: "auto" }
    ],
    maintenance: [
      {
        id: "mn-1",
        title: "Smoke & CO Detectors Test",
        category: "Safety",
        model: "Standard Dual Detector",
        lastService: getRelativeDate(-60),
        nextDue: getRelativeDate(30),
        frequencyMonths: 6,
        notes: "Test alarm buttons on all floors and check battery status."
      },
      {
        id: "mn-2",
        title: "HVAC / Air Filter Check",
        category: "HVAC",
        model: "Standard 20x20x1",
        lastService: getRelativeDate(-75),
        nextDue: getRelativeDate(15),
        frequencyMonths: 3,
        notes: "Replace if visibly dusty or airflow is restricted."
      }
    ],
    contacts: [
      { id: "cntn-1", name: "Emergency Dispatch / First Responders", service: "Police / Fire / EMT", phone: "911", email: "", note: "24/7 Life Emergency" },
      { id: "cntn-2", name: "Emergency Plumbing Service", service: "24/7 Plumber", phone: "(555) 234-5678", email: "", note: "Main shutoff valve location in utility room" }
    ],
    notes: [
      {
        id: "nn-1",
        content: "Welcome to your new HavenHub household dashboard! Pin your reminders, house rules, or Wi-Fi passwords here.",
        author: user.name.split(' ')[0],
        color: "yellow",
        date: getRelativeDate(0)
      }
    ],
    activities: [
      { id: "actn-1", text: `${user.name} created the '${user.householdName || 'Household'}' dashboard`, time: "Just now", memberId }
    ]
  };
}

class HouseholdStorage {
  constructor(userId = null, userProfile = null) {
    this.userId = userId;
    this.userProfile = userProfile;
    this.storageKey = this.computeStorageKey(userId);
    this.data = this.load();
  }

  computeStorageKey(userId) {
    if (!userId) return 'havenhub_household_data_v1';
    return `havenhub_user_data_${userId}`;
  }

  setUser(userId, userProfile = null) {
    this.userId = userId;
    this.userProfile = userProfile;
    this.storageKey = this.computeStorageKey(userId);
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return JSON.parse(raw);
      }

      // Legacy migration check: if loading user-alex and legacy key exists
      if (this.userId === 'user-alex') {
        const legacyRaw = localStorage.getItem('havenhub_household_data_v1');
        if (legacyRaw) {
          try {
            const legacyData = JSON.parse(legacyRaw);
            this.save(legacyData);
            return legacyData;
          } catch (e) {
            console.warn("Legacy migration skipped:", e);
          }
        }
      }

      // Generate seed data matching user identity
      let seed;
      if (this.userId === 'user-alex') {
        seed = getAlexSeedData();
      } else if (this.userId === 'user-maya') {
        seed = getMayaSeedData();
      } else if (this.userId === 'user-jordan') {
        seed = getJordanSeedData();
      } else if (this.userProfile) {
        seed = getNewUserSeedData(this.userProfile);
      } else {
        seed = getAlexSeedData();
      }

      this.save(seed);
      return JSON.parse(JSON.stringify(seed));
    } catch (err) {
      console.error("Failed to load user household data from localStorage:", err);
      const fallback = this.userProfile ? getNewUserSeedData(this.userProfile) : getAlexSeedData();
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  save(data = this.data) {
    try {
      this.data = data;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Failed to save household data to key", this.storageKey, err);
      return false;
    }
  }

  resetToDefault() {
    let seed;
    if (this.userId === 'user-alex') seed = getAlexSeedData();
    else if (this.userId === 'user-maya') seed = getMayaSeedData();
    else if (this.userId === 'user-jordan') seed = getJordanSeedData();
    else if (this.userProfile) seed = getNewUserSeedData(this.userProfile);
    else seed = getAlexSeedData();

    this.save(seed);
    return JSON.parse(JSON.stringify(seed));
  }

  deleteUserData(userId) {
    if (!userId) return false;
    try {
      const key = this.computeStorageKey(userId);
      localStorage.removeItem(key);
      if (userId === 'user-alex') {
        localStorage.removeItem('havenhub_household_data_v1');
      }
      if (this.userId === userId) {
        this.data = null;
        this.userId = null;
        this.userProfile = null;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete user data for", userId, err);
      return false;
    }
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const houseName = (this.data.household?.name || 'HavenHub').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadAnchor.setAttribute("download", `${houseName}_Backup_${new Date().toISOString().slice(0, 10)}.json`);
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

  logActivity(text, memberId = null) {
    const defaultMemberId = this.data.members?.[0]?.id || 'm-owner';
    const newAct = {
      id: this.generateId('act'),
      text,
      time: 'Just now',
      memberId: memberId || defaultMemberId
    };
    this.data.activities = [newAct, ...(this.data.activities || []).slice(0, 15)];
    this.save();
  }

  // Member helpers
  getMembers() { return this.data.members || []; }
  getMember(id) {
    return this.getMembers().find(m => m.id === id) || { name: "Unassigned", color: "#64748b", initials: "?" };
  }
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
      this.logActivity(`${member ? member.name : 'Resident'} completed chore '${chore.title}' (Streak: ${chore.streak}🔥)`);
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

// Global Store Instance (initialized by auth on startup)
window.havenStorage = new HouseholdStorage();
