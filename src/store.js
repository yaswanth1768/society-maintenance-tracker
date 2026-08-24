// ===== Centralized State Store =====
// Simple event-driven state management

class Store {
  constructor() {
    this._state = {};
    this._listeners = {};
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._emit(key, value);
  }

  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => {
      this._listeners[key] = this._listeners[key].filter(f => f !== fn);
    };
  }

  _emit(key, value) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(fn => fn(value));
    }
    // Also emit wildcard
    if (this._listeners['*']) {
      this._listeners['*'].forEach(fn => fn(key, value));
    }
  }
}

export const store = new Store();

// Auth helpers
export function getCurrentUser() {
  const userData = localStorage.getItem('smt_user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch { return null; }
  }
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('smt_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('smt_user');
  }
  store.set('user', user);
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

export function logout() {
  setCurrentUser(null);
}
