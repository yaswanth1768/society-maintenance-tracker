// ===== Mock REST API Layer =====
// Mirrors the spec's API endpoints, uses localStorage for persistence
// All functions return Promises to simulate async behavior

import { generateId, daysBetween } from './utils.js';

const STORAGE_KEYS = {
  users: 'smt_users',
  complaints: 'smt_complaints',
  history: 'smt_history',
  notices: 'smt_notices',
  settings: 'smt_settings',
  notifications: 'smt_notifications'
};

// ===== Seed Data =====
function getRelativeDate(daysAgo, hours = 10, minutes = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const SEED_USERS = [
  { id: 'USR-001', name: 'Rohith Kumar', email: 'rohith@example.com', password: 'password123', role: 'resident', flat: 'A-404', phone: '9876543210', created_at: getRelativeDate(60) },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'resident', flat: 'B-302', phone: '9876543211', created_at: getRelativeDate(55) },
  { id: 'USR-003', name: 'Amit Patel', email: 'amit@example.com', password: 'password123', role: 'resident', flat: 'C-105', phone: '9876543212', created_at: getRelativeDate(50) },
  { id: 'USR-004', name: 'Society Admin', email: 'admin@society.com', password: 'admin123', role: 'admin', flat: 'Office', phone: '9876543200', created_at: getRelativeDate(90) },
  { id: 'USR-005', name: 'Deepa Nair', email: 'deepa@example.com', password: 'password123', role: 'resident', flat: 'A-201', phone: '9876543213', created_at: getRelativeDate(45) },
];

const SEED_COMPLAINTS = [
  {
    id: 'CMP-1042', resident_id: 'USR-001', category: 'Plumbing', 
    description: 'Water leakage under kitchen sink. The pipe joint seems to be corroded and water is dripping continuously, causing damage to the cabinet below.',
    photo_url: null, priority: 'High', status: 'In Progress',
    created_at: getRelativeDate(1, 10, 30), updated_at: getRelativeDate(0, 14, 15)
  },
  {
    id: 'CMP-1041', resident_id: 'USR-002', category: 'Electrical',
    description: 'Hallway lights on 3rd floor B-block are not working. Multiple bulbs seem to have fused and the area is completely dark after sunset.',
    photo_url: null, priority: 'Medium', status: 'Open',
    created_at: getRelativeDate(2, 9, 0), updated_at: getRelativeDate(2, 9, 0)
  },
  {
    id: 'CMP-1040', resident_id: 'USR-001', category: 'Lift',
    description: 'Lift in A-block making unusual grinding noise. It seems unsafe and several residents have expressed concern.',
    photo_url: null, priority: 'High', status: 'In Progress',
    created_at: getRelativeDate(3, 8, 45), updated_at: getRelativeDate(2, 16, 30)
  },
  {
    id: 'CMP-1039', resident_id: 'USR-003', category: 'Security',
    description: 'CCTV camera near C-block parking is not functioning. The camera has been offline for 3 days now.',
    photo_url: null, priority: 'High', status: 'Open',
    created_at: getRelativeDate(6, 11, 20), updated_at: getRelativeDate(6, 11, 20)
  },
  {
    id: 'CMP-1038', resident_id: 'USR-005', category: 'Cleaning',
    description: 'Garbage not being collected from A-block ground floor regularly. Bins are overflowing and causing bad odor.',
    photo_url: null, priority: 'Medium', status: 'Open',
    created_at: getRelativeDate(7, 7, 30), updated_at: getRelativeDate(7, 7, 30)
  },
  {
    id: 'CMP-1037', resident_id: 'USR-002', category: 'Water Supply',
    description: 'Low water pressure in B-302 during morning hours. It takes a very long time to fill buckets.',
    photo_url: null, priority: 'Medium', status: 'Resolved',
    created_at: getRelativeDate(10, 6, 0), updated_at: getRelativeDate(7, 15, 0)
  },
  {
    id: 'CMP-1036', resident_id: 'USR-001', category: 'Common Area',
    description: 'Broken tiles near the swimming pool area. Several tiles are cracked and could be a safety hazard for children.',
    photo_url: null, priority: 'Low', status: 'Resolved',
    created_at: getRelativeDate(15, 14, 0), updated_at: getRelativeDate(10, 11, 0)
  },
  {
    id: 'CMP-1035', resident_id: 'USR-003', category: 'Plumbing',
    description: 'Bathroom drain clogged in C-105. Water is not draining properly and accumulates on the floor.',
    photo_url: null, priority: 'Medium', status: 'Resolved',
    created_at: getRelativeDate(20, 9, 30), updated_at: getRelativeDate(17, 16, 0)
  },
  {
    id: 'CMP-1034', resident_id: 'USR-005', category: 'Electrical',
    description: 'Power fluctuations in A-201 causing appliance damage. Voltage stabilizer also not handling the fluctuations.',
    photo_url: null, priority: 'High', status: 'Open',
    created_at: getRelativeDate(8, 20, 0), updated_at: getRelativeDate(8, 20, 0)
  },
  {
    id: 'CMP-1033', resident_id: 'USR-002', category: 'Common Area',
    description: 'Children\'s playground swing set is rusted and needs replacement. The chains are weak and could break.',
    photo_url: null, priority: 'Low', status: 'In Progress',
    created_at: getRelativeDate(12, 10, 0), updated_at: getRelativeDate(9, 14, 0)
  },
];

const SEED_HISTORY = [
  // CMP-1042
  { id: 'H-001', complaint_id: 'CMP-1042', status: 'Open', actor_id: 'USR-001', actor_name: 'Rohith Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(1, 10, 30) },
  { id: 'H-002', complaint_id: 'CMP-1042', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Maintenance team assigned. Plumber scheduled for tomorrow morning.', created_at: getRelativeDate(0, 14, 15) },
  // CMP-1041
  { id: 'H-003', complaint_id: 'CMP-1041', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(2, 9, 0) },
  // CMP-1040
  { id: 'H-004', complaint_id: 'CMP-1040', status: 'Open', actor_id: 'USR-001', actor_name: 'Rohith Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(3, 8, 45) },
  { id: 'H-005', complaint_id: 'CMP-1040', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Lift maintenance company contacted. Inspection scheduled.', created_at: getRelativeDate(2, 16, 30) },
  // CMP-1039
  { id: 'H-006', complaint_id: 'CMP-1039', status: 'Open', actor_id: 'USR-003', actor_name: 'Amit Patel', note: 'Complaint submitted by resident.', created_at: getRelativeDate(6, 11, 20) },
  // CMP-1038
  { id: 'H-007', complaint_id: 'CMP-1038', status: 'Open', actor_id: 'USR-005', actor_name: 'Deepa Nair', note: 'Complaint submitted by resident.', created_at: getRelativeDate(7, 7, 30) },
  // CMP-1037
  { id: 'H-008', complaint_id: 'CMP-1037', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(10, 6, 0) },
  { id: 'H-009', complaint_id: 'CMP-1037', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Plumbing team checking water pressure issue.', created_at: getRelativeDate(9, 10, 0) },
  { id: 'H-010', complaint_id: 'CMP-1037', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Water pressure issue fixed. Motor valve was adjusted.', created_at: getRelativeDate(7, 15, 0) },
  // CMP-1036
  { id: 'H-011', complaint_id: 'CMP-1036', status: 'Open', actor_id: 'USR-001', actor_name: 'Rohith Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(15, 14, 0) },
  { id: 'H-012', complaint_id: 'CMP-1036', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Tile replacement work ordered.', created_at: getRelativeDate(13, 9, 0) },
  { id: 'H-013', complaint_id: 'CMP-1036', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Tiles replaced and area cleaned. Verified by maintenance supervisor.', created_at: getRelativeDate(10, 11, 0) },
  // CMP-1035
  { id: 'H-014', complaint_id: 'CMP-1035', status: 'Open', actor_id: 'USR-003', actor_name: 'Amit Patel', note: 'Complaint submitted by resident.', created_at: getRelativeDate(20, 9, 30) },
  { id: 'H-015', complaint_id: 'CMP-1035', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Plumber assigned for drain cleaning.', created_at: getRelativeDate(19, 11, 0) },
  { id: 'H-016', complaint_id: 'CMP-1035', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Drain cleaned and water flow restored.', created_at: getRelativeDate(17, 16, 0) },
  // CMP-1034
  { id: 'H-017', complaint_id: 'CMP-1034', status: 'Open', actor_id: 'USR-005', actor_name: 'Deepa Nair', note: 'Complaint submitted by resident.', created_at: getRelativeDate(8, 20, 0) },
  // CMP-1033
  { id: 'H-018', complaint_id: 'CMP-1033', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(12, 10, 0) },
  { id: 'H-019', complaint_id: 'CMP-1033', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'New swing set ordered. Expected delivery in 5 days.', created_at: getRelativeDate(9, 14, 0) },
];

const SEED_NOTICES = [
  {
    id: 'NTC-001', title: 'Water Tank Cleaning', 
    description: 'The overhead water tanks in all blocks will be cleaned on Sunday, August 24th between 9:00 AM and 1:00 PM. Please store sufficient water for the duration. Water supply will be temporarily interrupted during the cleaning process.',
    is_important: true, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(0, 9, 0)
  },
  {
    id: 'NTC-002', title: 'Monthly Maintenance Charges Due',
    description: 'This is a reminder that maintenance charges for August 2026 are due by the 5th of the month. Please make the payment via bank transfer or at the society office. Late payments will incur a penalty of ₹500.',
    is_important: true, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(3, 10, 0)
  },
  {
    id: 'NTC-003', title: 'Diwali Celebration Planning Meeting',
    description: 'A meeting to plan the society Diwali celebrations will be held on Saturday, August 30th at 5:00 PM in the community hall. All residents are welcome to join and share their ideas for the festivities.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(2, 15, 0)
  },
  {
    id: 'NTC-004', title: 'New Gym Equipment Installed',
    description: 'We are pleased to announce that new gym equipment has been installed in the society fitness center. The gym is now equipped with a treadmill, elliptical trainer, and weight machines. Gym timings remain 6:00 AM to 10:00 PM.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(5, 12, 0)
  },
  {
    id: 'NTC-005', title: 'Parking Area Repainting',
    description: 'The parking area in all blocks will be repainted next week starting Monday. Please ensure your vehicles are moved from the designated areas as per the schedule that will be shared via WhatsApp.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(1, 11, 0)
  },
];

const SEED_SETTINGS = {
  overdue_threshold_days: 5
};

// ===== Database Init =====
function initDB() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.complaints)) {
    localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(SEED_COMPLAINTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.history)) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(SEED_HISTORY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.notices)) {
    localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(SEED_NOTICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(SEED_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify([]));
  }
}

// ===== Data Access Helpers =====
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch { return []; }
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 200));
}

// ===== Auth API =====
export async function apiLogin(email, password) {
  await delay(400);
  const users = getData(STORAGE_KEYS.users);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function apiRegister({ name, email, password, flat, phone }) {
  await delay(400);
  const users = getData(STORAGE_KEYS.users);
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists');
  }
  const newUser = {
    id: generateId('USR'),
    name, email, password, flat, phone,
    role: 'resident',
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  setData(STORAGE_KEYS.users, users);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

export async function apiGoogleAuth(googleAccount) {
  await delay(400);
  const users = getData(STORAGE_KEYS.users);
  let user = users.find(u => u.email.toLowerCase() === googleAccount.email.toLowerCase());
  
  if (!user) {
    // Create new resident user from Google profile
    user = {
      id: generateId('USR'),
      name: googleAccount.name || 'Google User',
      email: googleAccount.email,
      password: 'oauth_user',
      flat: googleAccount.flat || 'A-101',
      phone: googleAccount.phone || '9876543299',
      role: googleAccount.role || 'resident',
      created_at: new Date().toISOString()
    };
    users.push(user);
    setData(STORAGE_KEYS.users, users);
  }
  
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function apiGetComplaints(filters = {}) {
  await delay();
  let complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
  const threshold = settings?.overdue_threshold_days || 5;
  
  // Enrich with resident info and overdue flag
  complaints = complaints.map(c => {
    const resident = users.find(u => u.id === c.resident_id) || {};
    const daysOpen = daysBetween(c.created_at, new Date());
    const isOverdue = c.status !== 'Resolved' && daysOpen > threshold;
    return { ...c, resident_name: resident.name, resident_flat: resident.flat, days_open: daysOpen, is_overdue: isOverdue };
  });
  
  // Filter by resident
  if (filters.resident_id) {
    complaints = complaints.filter(c => c.resident_id === filters.resident_id);
  }
  
  // Filter by status
  if (filters.status && filters.status !== 'All') {
    complaints = complaints.filter(c => c.status === filters.status);
  }
  
  // Filter by category
  if (filters.category && filters.category !== 'All') {
    complaints = complaints.filter(c => c.category === filters.category);
  }
  
  // Filter by priority
  if (filters.priority && filters.priority !== 'All') {
    complaints = complaints.filter(c => c.priority === filters.priority);
  }
  
  // Filter by overdue
  if (filters.overdue) {
    complaints = complaints.filter(c => c.is_overdue);
  }
  
  // Search
  if (filters.search) {
    const s = filters.search.toLowerCase();
    complaints = complaints.filter(c => 
      c.id.toLowerCase().includes(s) ||
      c.category.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s) ||
      (c.resident_name && c.resident_name.toLowerCase().includes(s))
    );
  }
  
  // Sort: overdue first, then by created_at desc
  complaints.sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  return complaints;
}

export async function apiGetComplaint(id) {
  await delay();
  const complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
  const threshold = settings?.overdue_threshold_days || 5;
  
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('Complaint not found');
  
  const resident = users.find(u => u.id === complaint.resident_id) || {};
  const daysOpen = daysBetween(complaint.created_at, new Date());
  const isOverdue = complaint.status !== 'Resolved' && daysOpen > threshold;
  
  return { ...complaint, resident_name: resident.name, resident_flat: resident.flat, resident_email: resident.email, days_open: daysOpen, is_overdue: isOverdue };
}

export async function apiCreateComplaint({ resident_id, category, description, photo_url }) {
  await delay(300);
  const complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const user = users.find(u => u.id === resident_id);
  const now = new Date().toISOString();
  
  // Generate sequential ID
  const maxNum = complaints.reduce((max, c) => {
    const num = parseInt(c.id.split('-')[1]);
    return num > max ? num : max;
  }, 1000);
  
  const newComplaint = {
    id: `CMP-${maxNum + 1}`,
    resident_id,
    category,
    description,
    photo_url: photo_url || null,
    priority: 'Low', // Admin assigns priority
    status: 'Open',
    created_at: now,
    updated_at: now
  };
  
  complaints.push(newComplaint);
  setData(STORAGE_KEYS.complaints, complaints);
  
  // Create history record
  const history = getData(STORAGE_KEYS.history);
  history.push({
    id: generateId('H'),
    complaint_id: newComplaint.id,
    status: 'Open',
    actor_id: resident_id,
    actor_name: user?.name || 'Resident',
    note: 'Complaint submitted by resident.',
    created_at: now
  });
  setData(STORAGE_KEYS.history, history);
  
  return newComplaint;
}

export async function apiUpdateComplaintStatus(id, { status, note, actor_id, actor_name }) {
  await delay(300);
  const complaints = getData(STORAGE_KEYS.complaints);
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Complaint not found');
  
  const now = new Date().toISOString();
  complaints[idx].status = status;
  complaints[idx].updated_at = now;
  setData(STORAGE_KEYS.complaints, complaints);
  
  // Create history record
  const history = getData(STORAGE_KEYS.history);
  history.push({
    id: generateId('H'),
    complaint_id: id,
    status,
    actor_id,
    actor_name,
    note: note || `Status changed to ${status}.`,
    created_at: now
  });
  setData(STORAGE_KEYS.history, history);
  
  return complaints[idx];
}

export async function apiUpdateComplaintPriority(id, priority) {
  await delay(200);
  const complaints = getData(STORAGE_KEYS.complaints);
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Complaint not found');
  
  complaints[idx].priority = priority;
  complaints[idx].updated_at = new Date().toISOString();
  setData(STORAGE_KEYS.complaints, complaints);
  
  return complaints[idx];
}

export async function apiGetComplaintHistory(complaintId) {
  await delay();
  const history = getData(STORAGE_KEYS.history);
  return history
    .filter(h => h.complaint_id === complaintId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// ===== Notices API =====
export async function apiGetNotices() {
  await delay();
  const notices = getData(STORAGE_KEYS.notices);
  // Sort: important first, then by date desc
  return notices.sort((a, b) => {
    if (a.is_important && !b.is_important) return -1;
    if (!a.is_important && b.is_important) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

export async function apiCreateNotice({ title, description, is_important, created_by, author_name }) {
  await delay(300);
  const notices = getData(STORAGE_KEYS.notices);
  const newNotice = {
    id: generateId('NTC'),
    title, description, is_important,
    created_by, author_name,
    created_at: new Date().toISOString()
  };
  notices.push(newNotice);
  setData(STORAGE_KEYS.notices, notices);
  return newNotice;
}

export async function apiUpdateNotice(id, updates) {
  await delay(200);
  const notices = getData(STORAGE_KEYS.notices);
  const idx = notices.findIndex(n => n.id === id);
  if (idx === -1) throw new Error('Notice not found');
  
  notices[idx] = { ...notices[idx], ...updates };
  setData(STORAGE_KEYS.notices, notices);
  return notices[idx];
}

export async function apiDeleteNotice(id) {
  await delay(200);
  let notices = getData(STORAGE_KEYS.notices);
  notices = notices.filter(n => n.id !== id);
  setData(STORAGE_KEYS.notices, notices);
}

// ===== Dashboard Stats API =====
export async function apiGetDashboardStats(residentId = null) {
  await delay();
  let complaints = getData(STORAGE_KEYS.complaints);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
  const threshold = settings?.overdue_threshold_days || 5;
  
  if (residentId) {
    complaints = complaints.filter(c => c.resident_id === residentId);
  }
  
  const total = complaints.length;
  const open = complaints.filter(c => c.status === 'Open').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const overdue = complaints.filter(c => {
    const daysOpen = daysBetween(c.created_at, new Date());
    return c.status !== 'Resolved' && daysOpen > threshold;
  }).length;
  
  // Category breakdown
  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  
  return { total, open, inProgress, resolved, overdue, categories };
}

// ===== Settings API =====
export async function apiGetSettings() {
  await delay(100);
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
}

export async function apiUpdateSettings(updates) {
  await delay(200);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || {};
  const updated = { ...settings, ...updates };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
  return updated;
}

// ===== Init =====
export function initializeAPI() {
  initDB();
}

// ===== Reset (for testing) =====
export function resetData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initDB();
}
