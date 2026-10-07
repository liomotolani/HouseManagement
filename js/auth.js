/**
 * HavenHub Authentication & User Management Engine
 * Provides multi-user account creation, authentication, session management,
 * and user data scoping.
 */

const AUTH_USERS_KEY = 'havenhub_users_v2';
const AUTH_SESSION_KEY = 'havenhub_active_user_id';

const DEFAULT_USERS = [
  {
    id: "user-alex",
    name: "Alex Rivera",
    email: "alex@havenhub.com",
    password: "password123",
    householdName: "Oakwood Haven",
    role: "Primary / Admin",
    color: "#6366f1",
    initials: "AR",
    createdAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "user-maya",
    name: "Maya Chen",
    email: "maya@havenhub.com",
    password: "password123",
    householdName: "Skyline Loft",
    role: "Primary / Admin",
    color: "#ec4899",
    initials: "MC",
    createdAt: "2026-02-10T10:30:00.000Z"
  },
  {
    id: "user-jordan",
    name: "Jordan Taylor",
    email: "jordan@havenhub.com",
    password: "password123",
    householdName: "Pinecrest Studio",
    role: "Primary / Admin",
    color: "#06b6d4",
    initials: "JT",
    createdAt: "2026-03-01T14:15:00.000Z"
  }
];

class AuthManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = this.loadSession();
  }

  loadUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      if (raw === null) {
        this.saveUsers(DEFAULT_USERS);
        return JSON.parse(JSON.stringify(DEFAULT_USERS));
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to load users from localStorage, resetting to default:", err);
      this.saveUsers(DEFAULT_USERS);
      return JSON.parse(JSON.stringify(DEFAULT_USERS));
    }
  }

  saveUsers(users = this.users) {
    try {
      this.users = users;
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      return true;
    } catch (err) {
      console.error("Failed to save users:", err);
      return false;
    }
  }

  loadSession() {
    return localStorage.getItem(AUTH_SESSION_KEY) || null;
  }

  saveSession(userId) {
    if (userId) {
      this.currentUserId = userId;
      localStorage.setItem(AUTH_SESSION_KEY, userId);
    } else {
      this.currentUserId = null;
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  getUsers() {
    return this.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      householdName: u.householdName,
      color: u.color,
      initials: u.initials,
      role: u.role
    }));
  }

  getUserById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  generateInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  signup({ name, email, password, householdName, color }) {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();
    const trimmedHousehold = (householdName || '').trim() || `${trimmedName}'s Haven`;
    const userColor = color || '#6366f1';

    if (!trimmedName) {
      return { success: false, message: "Please provide your full name." };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, message: "Please enter a valid email address." };
    }
    if (!trimmedPassword || trimmedPassword.length < 4) {
      return { success: false, message: "Password must be at least 4 characters long." };
    }

    // Check if email already in use
    const exists = this.users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, message: "An account with this email already exists. Please sign in." };
    }

    const newUser = {
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      householdName: trimmedHousehold,
      role: "Primary / Admin",
      color: userColor,
      initials: this.generateInitials(trimmedName),
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    this.saveSession(newUser.id);

    return { success: true, user: newUser };
  }

  login(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, message: "Please enter both email and password." };
    }

    const user = this.users.find(u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword);
    if (!user) {
      return { success: false, message: "Invalid email or password. Please try again." };
    }

    this.saveSession(user.id);
    return { success: true, user };
  }

  logout() {
    this.saveSession(null);
  }

  switchUser(userId) {
    const user = this.getUserById(userId);
    if (user) {
      this.saveSession(user.id);
      return { success: true, user };
    }
    return { success: false, message: "User not found" };
  }

  deleteAccount(userId, verificationInput = null) {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, message: "User account not found." };
    }

    if (verificationInput !== null && verificationInput !== undefined) {
      const cleanInput = verificationInput.trim();
      const isPasswordMatch = cleanInput === user.password;
      const isKeywordMatch = cleanInput.toUpperCase() === 'DELETE';
      if (!isPasswordMatch && !isKeywordMatch) {
        return {
          success: false,
          message: "Confirmation failed. Please enter your account password or type DELETE."
        };
      }
    }

    const wasActive = this.currentUserId === userId;

    // 1. Remove user from users array
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();

    // 2. Erase user-scoped household data from storage
    if (window.havenStorage && typeof window.havenStorage.deleteUserData === 'function') {
      window.havenStorage.deleteUserData(userId);
    }

    // 3. Clear active session if this was the logged-in user
    if (wasActive) {
      this.saveSession(null);
    }

    return {
      success: true,
      deletedUser: user,
      wasActive,
      remainingUsersCount: this.users.length
    };
  }

  restoreDemoAccounts() {
    let addedCount = 0;
    DEFAULT_USERS.forEach(defUser => {
      const exists = this.users.some(u => u.id === defUser.id || u.email.toLowerCase() === defUser.email.toLowerCase());
      if (!exists) {
        this.users.push(JSON.parse(JSON.stringify(defUser)));
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.saveUsers();
    }
    return { success: true, count: addedCount };
  }
}

// Global Auth Instance
window.havenAuth = new AuthManager();
