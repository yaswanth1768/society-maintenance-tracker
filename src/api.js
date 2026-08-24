// ===== Centralized REST API & Storage Service Layer =====
// Handles asynchronous data operations, role authentication, status lifecycles,
// overdue calculations, audit trail recording, and email/notification dispatch.

import { generateId, daysBetween } from './utils.js';

const STORAGE_KEYS = {
  users: 'smt_users',
  complaints: 'smt_complaints',
  history: 'smt_history',
  notices: 'smt_notices',
  settings: 'smt_settings',
  notifications: 'smt_notifications',
  emails: 'smt_emails',
  workers: 'smt_workers'
};

// Helper to generate dynamic past ISO dates
function getRelativeDate(daysAgo, hours = 10, minutes = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// ===== Initial Seed Data =====
const SEED_USERS = [
  { id: 'USR-001', name: 'Yaswanth Kumar', email: 'yaswanth@example.com', password: 'password123', role: 'resident', flat: 'A-404', phone: '9876543210', created_at: getRelativeDate(60) },
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
  { id: 'H-001', complaint_id: 'CMP-1042', status: 'Open', actor_id: 'USR-001', actor_name: 'Yaswanth Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(1, 10, 30) },
  { id: 'H-002', complaint_id: 'CMP-1042', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Maintenance team assigned. Plumber scheduled for inspection.', created_at: getRelativeDate(0, 14, 15) },
  // CMP-1041
  { id: 'H-003', complaint_id: 'CMP-1041', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(2, 9, 0) },
  // CMP-1040
  { id: 'H-004', complaint_id: 'CMP-1040', status: 'Open', actor_id: 'USR-001', actor_name: 'Yaswanth Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(3, 8, 45) },
  { id: 'H-005', complaint_id: 'CMP-1040', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Lift vendor technician contacted. Replacement cable ordered.', created_at: getRelativeDate(2, 16, 30) },
  // CMP-1039
  { id: 'H-006', complaint_id: 'CMP-1039', status: 'Open', actor_id: 'USR-003', actor_name: 'Amit Patel', note: 'Complaint submitted by resident.', created_at: getRelativeDate(6, 11, 20) },
  // CMP-1038
  { id: 'H-007', complaint_id: 'CMP-1038', status: 'Open', actor_id: 'USR-005', actor_name: 'Deepa Nair', note: 'Complaint submitted by resident.', created_at: getRelativeDate(7, 7, 30) },
  // CMP-1037
  { id: 'H-008', complaint_id: 'CMP-1037', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(10, 6, 0) },
  { id: 'H-009', complaint_id: 'CMP-1037', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Plumbing team checking main pressure regulator valve.', created_at: getRelativeDate(9, 10, 0) },
  { id: 'H-010', complaint_id: 'CMP-1037', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Water pressure issue fixed. Motor booster valve adjusted.', created_at: getRelativeDate(7, 15, 0) },
  // CMP-1036
  { id: 'H-011', complaint_id: 'CMP-1036', status: 'Open', actor_id: 'USR-001', actor_name: 'Yaswanth Kumar', note: 'Complaint submitted by resident.', created_at: getRelativeDate(15, 14, 0) },
  { id: 'H-012', complaint_id: 'CMP-1036', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Tile replacement masonry team scheduled.', created_at: getRelativeDate(13, 9, 0) },
  { id: 'H-013', complaint_id: 'CMP-1036', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Tiles replaced and waterproof sealant applied.', created_at: getRelativeDate(10, 11, 0) },
  // CMP-1035
  { id: 'H-014', complaint_id: 'CMP-1035', status: 'Open', actor_id: 'USR-003', actor_name: 'Amit Patel', note: 'Complaint submitted by resident.', created_at: getRelativeDate(20, 9, 30) },
  { id: 'H-015', complaint_id: 'CMP-1035', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Plumber assigned for drainage clearing.', created_at: getRelativeDate(19, 11, 0) },
  { id: 'H-016', complaint_id: 'CMP-1035', status: 'Resolved', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'Drain cleared and flow tested successfully.', created_at: getRelativeDate(17, 16, 0) },
  // CMP-1034
  { id: 'H-017', complaint_id: 'CMP-1034', status: 'Open', actor_id: 'USR-005', actor_name: 'Deepa Nair', note: 'Complaint submitted by resident.', created_at: getRelativeDate(8, 20, 0) },
  // CMP-1033
  { id: 'H-018', complaint_id: 'CMP-1033', status: 'Open', actor_id: 'USR-002', actor_name: 'Priya Sharma', note: 'Complaint submitted by resident.', created_at: getRelativeDate(12, 10, 0) },
  { id: 'H-019', complaint_id: 'CMP-1033', status: 'In Progress', actor_id: 'USR-004', actor_name: 'Society Admin', note: 'New swing chains and safety hooks ordered.', created_at: getRelativeDate(9, 14, 0) },
];

const SEED_NOTICES = [
  {
    id: 'NTC-001', title: 'Water Tank Cleaning & Maintenance', 
    description: 'The overhead and underground water storage tanks across all blocks will be cleaned on Sunday between 9:00 AM and 1:00 PM. Please store adequate water beforehand. Water supply will resume normally by 2:00 PM.',
    is_important: true, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(0, 9, 0)
  },
  {
    id: 'NTC-002', title: 'Monthly Maintenance Charges Due',
    description: 'Maintenance charges for the current billing cycle are due by the 5th of this month. Please complete payments via UPI/Bank transfer or at the management office. A late penalty of ₹500 applies after the 15th.',
    is_important: true, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(3, 10, 0)
  },
  {
    id: 'NTC-003', title: 'Annual Society Cultural Fest Planning',
    description: 'A general body meeting to plan society cultural celebrations will be held this Saturday at 6:00 PM in the Clubhouse. All residents are warmly invited to attend and volunteer.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(2, 15, 0)
  },
  {
    id: 'NTC-004', title: 'New Fitness Center Equipment Installed',
    description: 'Modern cardiovascular and strength training equipment has been added to the society gym. Operational hours are 6:00 AM – 10:00 PM daily. Please follow the posted gym hygiene guidelines.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(5, 12, 0)
  },
  {
    id: 'NTC-005', title: 'Parking Bay Restriping & Repainting',
    description: 'Line painting in the basement and open visitor parking will take place next Tuesday. Vehicle owners are requested to cooperate with security staff during the marking schedule.',
    is_important: false, created_by: 'USR-004', author_name: 'Society Admin',
    created_at: getRelativeDate(1, 11, 0)
  },
];

const SEED_SETTINGS = {
  overdue_threshold_days: 5
};

const SEED_NOTIFICATIONS = [
  {
    id: 'NTF-101',
    user_id: 'USR-001',
    recipient_email: 'yaswanth@example.com',
    type: 'complaint_status_update',
    title: 'Complaint #CMP-1042 Status Updated',
    message: 'Your plumbing complaint has been marked "In Progress". Note: Maintenance team assigned. Plumber scheduled for inspection.',
    is_read: false,
    email_subject: 'Update on Maintenance Request #CMP-1042 [In Progress]',
    created_at: getRelativeDate(0, 14, 15),
    metadata: { complaint_id: 'CMP-1042', status: 'In Progress' }
  },
  {
    id: 'NTF-102',
    user_id: 'USR-001',
    recipient_email: 'yaswanth@example.com',
    type: 'important_notice',
    title: 'Important Society Notice: Water Tank Cleaning & Maintenance',
    message: 'The overhead and underground water storage tanks across all blocks will be cleaned on Sunday between 9:00 AM and 1:00 PM.',
    is_read: true,
    email_subject: 'IMPORTANT NOTICE: Water Tank Cleaning & Maintenance',
    created_at: getRelativeDate(0, 9, 0),
    metadata: { notice_id: 'NTC-001' }
  },
  {
    id: 'NTF-103',
    user_id: 'USR-002',
    recipient_email: 'priya@example.com',
    type: 'complaint_status_update',
    title: 'Complaint #CMP-1037 Resolved',
    message: 'Your water pressure issue has been resolved. Note: Water pressure issue fixed. Motor booster valve adjusted.',
    is_read: false,
    email_subject: 'Maintenance Request #CMP-1037 has been Resolved',
    created_at: getRelativeDate(7, 15, 0),
    metadata: { complaint_id: 'CMP-1037', status: 'Resolved' }
  }
];

const SEED_WORKERS = [
  {
    id: 'WRK-001',
    name: 'Ramesh Kumar',
    category: 'Plumber',
    phone: '+91 98450 12345',
    address: 'Shop #4, Main Market, Sector 1',
    timing: '8:00 AM – 8:00 PM',
    rating: '4.9',
    is_verified: true,
    speciality: 'Pipe leakage, bathroom fittings, tank motor repair, blockage clearing',
    added_by: 'Society Office',
    created_at: getRelativeDate(40)
  },
  {
    id: 'WRK-002',
    name: 'Suresh Sharma',
    category: 'Electrician',
    phone: '+91 98450 67890',
    address: '2nd Cross, Near Society Bus Stop',
    timing: '8:30 AM – 9:00 PM',
    rating: '4.8',
    is_verified: true,
    speciality: 'Wiring, MCB tripping, fan installation, geyser & inverter repair',
    added_by: 'Yaswanth (A-404)',
    created_at: getRelativeDate(35)
  },
  {
    id: 'WRK-003',
    name: 'Manjunath V',
    category: 'Carpenter',
    phone: '+91 98451 11223',
    address: 'Timber Yard Lane, Behind Metro Station',
    timing: '9:00 AM – 7:30 PM',
    rating: '4.7',
    is_verified: true,
    speciality: 'Door locks, modular kitchen cabinets, hinge fix, furniture assembly',
    added_by: 'Priya (B-302)',
    created_at: getRelativeDate(30)
  },
  {
    id: 'WRK-004',
    name: 'Rajesh Verma',
    category: 'Painter',
    phone: '+91 98452 33445',
    address: 'Color World, Commercial Complex, Sector 3',
    timing: '8:30 AM – 6:30 PM',
    rating: '4.9',
    is_verified: true,
    speciality: 'Waterproofing, interior emulsion, stencil texture, exterior touchup',
    added_by: 'Amit (C-105)',
    created_at: getRelativeDate(25)
  },
  {
    id: 'WRK-005',
    name: 'Anitha Devi',
    category: 'House Cleaning',
    phone: '+91 98453 55667',
    address: 'Block A Service Quarters, Society Campus',
    timing: '7:00 AM – 6:00 PM',
    rating: '4.9',
    is_verified: true,
    speciality: 'Deep kitchen cleaning, floor scrubbing, post-renovation cleanup',
    added_by: 'Society Office',
    created_at: getRelativeDate(20)
  },
  {
    id: 'WRK-006',
    name: 'Gopal Rao',
    category: 'Appliance Repair',
    phone: '+91 98454 77889',
    address: 'Tech Care Hub, 1st Floor, Sector 2',
    timing: '9:00 AM – 8:00 PM',
    rating: '4.8',
    is_verified: true,
    speciality: 'AC gas refill, washing machine, refrigerator & microwave repair',
    added_by: 'Deepa (A-201)',
    created_at: getRelativeDate(18)
  },
  {
    id: 'WRK-007',
    name: 'Shiva Shankar',
    category: 'Gardener',
    phone: '+91 98455 99001',
    address: 'Green Nursery Road, Outer Gate',
    timing: '7:00 AM – 5:00 PM',
    rating: '4.6',
    is_verified: true,
    speciality: 'Balcony plants care, grass trimming, fertilizer & pot pruning',
    added_by: 'Society Office',
    created_at: getRelativeDate(15)
  },
  {
    id: 'WRK-008',
    name: 'Usman Ali',
    category: 'Masonry & Tiles',
    phone: '+91 98456 22334',
    address: 'Brick Works Depot, Ring Road',
    timing: '8:00 AM – 6:00 PM',
    rating: '4.7',
    is_verified: true,
    speciality: 'Floor tile replacement, wall crack grouting, balcony dampness repair',
    added_by: 'Society Office',
    created_at: getRelativeDate(12)
  }
];

// ===== Database Initializer =====
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
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.emails)) {
    localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.workers)) {
    localStorage.setItem(STORAGE_KEYS.workers, JSON.stringify(SEED_WORKERS));
  }
}

// ===== Data Helpers =====
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch { return []; }
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function delay(ms = 180) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 100));
}

// ===== Authentication APIs =====
export async function apiLogin(email, password) {
  await delay(300);
  const users = getData(STORAGE_KEYS.users);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    throw new Error('Invalid email address or password');
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function apiRegister({ name, email, password, flat, phone }) {
  await delay(350);
  const users = getData(STORAGE_KEYS.users);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email address already exists');
  }
  const newUser = {
    id: generateId('USR'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    flat: flat.trim(),
    phone: phone.trim(),
    role: 'resident',
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  setData(STORAGE_KEYS.users, users);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

export async function apiGoogleAuth(googleAccount) {
  await delay(300);
  const users = getData(STORAGE_KEYS.users);
  let user = users.find(u => u.email.toLowerCase() === googleAccount.email.toLowerCase());
  
  if (!user) {
    user = {
      id: generateId('USR'),
      name: googleAccount.name || 'Google Resident',
      email: googleAccount.email.toLowerCase(),
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

// ===== Complaints APIs =====
export async function apiGetComplaints(filters = {}) {
  await delay(200);
  let complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
  const threshold = settings.overdue_threshold_days || 5;
  const now = new Date();

  // Enrich with resident metadata and computed overdue state
  complaints = complaints.map(c => {
    const resident = users.find(u => u.id === c.resident_id) || {};
    const daysOpen = daysBetween(c.created_at, now);
    const isOverdue = c.status !== 'Resolved' && daysOpen > threshold;
    return {
      ...c,
      resident_name: resident.name || 'Unknown Resident',
      resident_flat: resident.flat || '—',
      resident_email: resident.email || '',
      days_open: daysOpen,
      is_overdue: isOverdue
    };
  });

  // Filter: Resident ID
  if (filters.resident_id) {
    complaints = complaints.filter(c => c.resident_id === filters.resident_id);
  }

  // Filter: Status
  if (filters.status && filters.status !== 'All') {
    complaints = complaints.filter(c => c.status === filters.status);
  }

  // Filter: Category
  if (filters.category && filters.category !== 'All') {
    complaints = complaints.filter(c => c.category === filters.category);
  }

  // Filter: Priority
  if (filters.priority && filters.priority !== 'All') {
    complaints = complaints.filter(c => c.priority === filters.priority);
  }

  // Filter: Overdue flag
  if (filters.overdue) {
    complaints = complaints.filter(c => c.is_overdue);
  }

  // Filter: Date Range ('all', 'today', '7days', '30days')
  if (filters.date_range && filters.date_range !== 'All' && filters.date_range !== 'all') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.date_range === 'today' || filters.date_range === 'Today') {
      complaints = complaints.filter(c => new Date(c.created_at) >= today);
    } else if (filters.date_range === '7days' || filters.date_range === 'Last 7 Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      complaints = complaints.filter(c => new Date(c.created_at) >= sevenDaysAgo);
    } else if (filters.date_range === '30days' || filters.date_range === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      complaints = complaints.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
    }
  }

  // Search filter (ID, category, description, resident name, flat)
  if (filters.search) {
    const s = filters.search.toLowerCase().trim();
    complaints = complaints.filter(c => 
      c.id.toLowerCase().includes(s) ||
      c.category.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s) ||
      (c.resident_name && c.resident_name.toLowerCase().includes(s)) ||
      (c.resident_flat && c.resident_flat.toLowerCase().includes(s))
    );
  }

  // Sort: Overdue items surfaced first at top, then newest created_at descending
  complaints.sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return complaints;
}

export async function apiGetComplaint(id) {
  await delay(150);
  const complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
  const threshold = settings.overdue_threshold_days || 5;

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error(`Complaint with ID #${id} was not found.`);

  const resident = users.find(u => u.id === complaint.resident_id) || {};
  const daysOpen = daysBetween(complaint.created_at, new Date());
  const isOverdue = complaint.status !== 'Resolved' && daysOpen > threshold;

  return {
    ...complaint,
    resident_name: resident.name || 'Unknown Resident',
    resident_flat: resident.flat || '—',
    resident_email: resident.email || '',
    resident_phone: resident.phone || '—',
    days_open: daysOpen,
    is_overdue: isOverdue
  };
}

export async function apiCreateComplaint({ resident_id, category, description, photo_url }) {
  await delay(300);
  const complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const user = users.find(u => u.id === resident_id);
  const now = new Date().toISOString();

  // Generate sequence-based ID
  const maxNum = complaints.reduce((max, c) => {
    const num = parseInt(c.id.replace('CMP-', ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 1000);

  const newComplaint = {
    id: `CMP-${maxNum + 1}`,
    resident_id,
    category,
    description: description.trim(),
    photo_url: photo_url || null,
    priority: 'Low', // Admin sets/escalates priority
    status: 'Open',
    created_at: now,
    updated_at: now
  };

  complaints.unshift(newComplaint);
  setData(STORAGE_KEYS.complaints, complaints);

  // Append initial lifecycle history audit entry
  const history = getData(STORAGE_KEYS.history);
  history.push({
    id: generateId('H'),
    complaint_id: newComplaint.id,
    status: 'Open',
    actor_id: resident_id,
    actor_name: user?.name || 'Resident',
    note: 'Complaint registered by resident with initial Open status.',
    created_at: now
  });
  setData(STORAGE_KEYS.history, history);

  return newComplaint;
}

export async function apiUpdateComplaintStatus(id, { status, note, actor_id, actor_name }) {
  await delay(250);
  const complaints = getData(STORAGE_KEYS.complaints);
  const users = getData(STORAGE_KEYS.users);
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) throw new Error(`Complaint #${id} not found.`);

  const oldStatus = complaints[idx].status;
  const now = new Date().toISOString();
  complaints[idx].status = status;
  complaints[idx].updated_at = now;
  setData(STORAGE_KEYS.complaints, complaints);

  // Create immutable status change history entry
  const history = getData(STORAGE_KEYS.history);
  const auditNote = note || `Status updated from ${oldStatus} to ${status}.`;
  history.push({
    id: generateId('H'),
    complaint_id: id,
    status,
    actor_id,
    actor_name: actor_name || 'Society Admin',
    note: auditNote,
    created_at: now
  });
  setData(STORAGE_KEYS.history, history);

  // Trigger automated email & in-app notification to the resident
  const resident = users.find(u => u.id === complaints[idx].resident_id);
  if (resident && resident.email) {
    await dispatchStatusChangeNotification({
      complaint: complaints[idx],
      resident,
      oldStatus,
      newStatus: status,
      note: auditNote,
      actor_name
    });
  }

  return complaints[idx];
}

export async function apiUpdateComplaintPriority(id, priority) {
  await delay(150);
  const complaints = getData(STORAGE_KEYS.complaints);
  const idx = complaints.findIndex(c => c.id === id);
  if (idx === -1) throw new Error(`Complaint #${id} not found.`);

  complaints[idx].priority = priority;
  complaints[idx].updated_at = new Date().toISOString();
  setData(STORAGE_KEYS.complaints, complaints);

  return complaints[idx];
}

export async function apiGetComplaintHistory(complaintId) {
  await delay(120);
  const history = getData(STORAGE_KEYS.history);
  return history
    .filter(h => h.complaint_id === complaintId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// ===== Notice Board APIs =====
export async function apiGetNotices() {
  await delay(150);
  const notices = getData(STORAGE_KEYS.notices);
  // Pinned important notices surface at the top, followed by date descending
  return notices.sort((a, b) => {
    if (a.is_important && !b.is_important) return -1;
    if (!a.is_important && b.is_important) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

export async function apiCreateNotice({ title, description, is_important, created_by, author_name }) {
  await delay(250);
  const notices = getData(STORAGE_KEYS.notices);
  const newNotice = {
    id: generateId('NTC'),
    title: title.trim(),
    description: description.trim(),
    is_important: !!is_important,
    created_by,
    author_name: author_name || 'Society Admin',
    created_at: new Date().toISOString()
  };

  notices.unshift(newNotice);
  setData(STORAGE_KEYS.notices, notices);

  // If marked as Important, broadcast notification & email to all residents
  if (newNotice.is_important) {
    const users = getData(STORAGE_KEYS.users);
    const residents = users.filter(u => u.role === 'resident');
    await dispatchImportantNoticeBroadcast(newNotice, residents);
  }

  return newNotice;
}

export async function apiUpdateNotice(id, updates) {
  await delay(200);
  const notices = getData(STORAGE_KEYS.notices);
  const idx = notices.findIndex(n => n.id === id);
  if (idx === -1) throw new Error('Notice not found.');

  notices[idx] = { ...notices[idx], ...updates, updated_at: new Date().toISOString() };
  setData(STORAGE_KEYS.notices, notices);
  return notices[idx];
}

export async function apiDeleteNotice(id) {
  await delay(200);
  let notices = getData(STORAGE_KEYS.notices);
  notices = notices.filter(n => n.id !== id);
  setData(STORAGE_KEYS.notices, notices);
}

// ===== Notifications & Email Dispatch Helpers =====
async function dispatchStatusChangeNotification({ complaint, resident, newStatus, note, actor_name }) {
  const notifications = getData(STORAGE_KEYS.notifications);
  const emails = getData(STORAGE_KEYS.emails);
  const now = new Date().toISOString();

  const title = `Complaint #${complaint.id} Status: ${newStatus}`;
  const subject = `[Society Maintenance] Complaint #${complaint.id} marked as ${newStatus}`;
  const emailBody = `
Dear ${resident.name},

Your maintenance request for category "${complaint.category}" has received a status update:

• Complaint ID: #${complaint.id}
• New Status: ${newStatus}
• Updated By: ${actor_name || 'Society Admin'}
• Remarks / Note: ${note}

You can track real-time resolution history at any time on the resident portal.

Regards,
Society Management Office
  `.trim();

  const newNotification = {
    id: generateId('NTF'),
    user_id: resident.id,
    recipient_email: resident.email,
    type: 'complaint_status_update',
    title,
    message: note || `Your complaint status has changed to ${newStatus}.`,
    is_read: false,
    email_subject: subject,
    email_body: emailBody,
    created_at: now,
    metadata: {
      complaint_id: complaint.id,
      status: newStatus
    }
  };

  notifications.unshift(newNotification);
  setData(STORAGE_KEYS.notifications, notifications);

  // Record outbound email in mock email dispatcher
  emails.unshift({
    id: generateId('EML'),
    to: resident.email,
    from: 'admin@society.com',
    subject,
    body: emailBody,
    sent_at: now,
    status: 'delivered'
  });
  setData(STORAGE_KEYS.emails, emails);

  // Dispatch custom window event for real-time header counter updates
  window.dispatchEvent(new CustomEvent('smt_notification_received', { detail: newNotification }));
}

async function dispatchImportantNoticeBroadcast(notice, residents) {
  const notifications = getData(STORAGE_KEYS.notifications);
  const emails = getData(STORAGE_KEYS.emails);
  const now = new Date().toISOString();

  residents.forEach(resident => {
    const subject = `URGENT NOTICE: ${notice.title}`;
    const emailBody = `
Dear Resident (${resident.name}, Flat ${resident.flat}),

An IMPORTANT circular has been published by the Society Administration:

"${notice.title}"

${notice.description}

Please take note of the instructions and plan accordingly.

Posted by: ${notice.author_name}
Date: ${new Date().toLocaleDateString()}
    `.trim();

    notifications.unshift({
      id: generateId('NTF'),
      user_id: resident.id,
      recipient_email: resident.email,
      type: 'important_notice',
      title: `Important Notice: ${notice.title}`,
      message: notice.description,
      is_read: false,
      email_subject: subject,
      email_body: emailBody,
      created_at: now,
      metadata: { notice_id: notice.id }
    });

    emails.unshift({
      id: generateId('EML'),
      to: resident.email,
      from: 'admin@society.com',
      subject,
      body: emailBody,
      sent_at: now,
      status: 'delivered'
    });
  });

  setData(STORAGE_KEYS.notifications, notifications);
  setData(STORAGE_KEYS.emails, emails);
  window.dispatchEvent(new CustomEvent('smt_notification_received'));
}

export async function apiGetNotifications(userId = null) {
  await delay(100);
  let notifications = getData(STORAGE_KEYS.notifications);
  if (userId) {
    notifications = notifications.filter(n => n.user_id === userId);
  }
  return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function apiMarkNotificationRead(id) {
  const notifications = getData(STORAGE_KEYS.notifications);
  const idx = notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    notifications[idx].is_read = true;
    setData(STORAGE_KEYS.notifications, notifications);
    window.dispatchEvent(new CustomEvent('smt_notification_updated'));
  }
}

export async function apiMarkAllNotificationsRead(userId) {
  const notifications = getData(STORAGE_KEYS.notifications);
  notifications.forEach(n => {
    if (!userId || n.user_id === userId) {
      n.is_read = true;
    }
  });
  setData(STORAGE_KEYS.notifications, notifications);
  window.dispatchEvent(new CustomEvent('smt_notification_updated'));
}

export async function apiGetUnreadNotificationCount(userId) {
  const notifications = getData(STORAGE_KEYS.notifications);
  return notifications.filter(n => (!userId || n.user_id === userId) && !n.is_read).length;
}

// ===== Dashboard & Analytics APIs =====
export async function apiGetDashboardStats(residentId = null) {
  await delay(150);
  let complaints = getData(STORAGE_KEYS.complaints);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
  const threshold = settings.overdue_threshold_days || 5;
  const now = new Date();

  if (residentId) {
    complaints = complaints.filter(c => c.resident_id === residentId);
  }

  const total = complaints.length;
  const open = complaints.filter(c => c.status === 'Open').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const overdue = complaints.filter(c => {
    const daysOpen = daysBetween(c.created_at, now);
    return c.status !== 'Resolved' && daysOpen > threshold;
  }).length;

  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  return { total, open, inProgress, resolved, overdue, categories };
}

// ===== System Configuration Settings APIs =====
export async function apiGetSettings() {
  await delay(100);
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
}

export async function apiUpdateSettings(updates) {
  await delay(200);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || SEED_SETTINGS;
  const updated = { ...settings, ...updates };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
  return updated;
}

// ===== House Workers & Service Providers Directory APIs =====
export async function apiGetWorkers(filters = {}) {
  await delay(120);
  const raw = localStorage.getItem(STORAGE_KEYS.workers);
  let workers = raw ? JSON.parse(raw) : SEED_WORKERS;

  if (filters.category && filters.category !== 'All') {
    workers = workers.filter(w => w.category === filters.category);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    workers = workers.filter(w => 
      (w.name && w.name.toLowerCase().includes(q)) ||
      (w.category && w.category.toLowerCase().includes(q)) ||
      (w.phone && w.phone.toLowerCase().includes(q)) ||
      (w.address && w.address.toLowerCase().includes(q)) ||
      (w.speciality && w.speciality.toLowerCase().includes(q))
    );
  }

  return workers;
}

export async function apiGetWorker(id) {
  await delay(80);
  const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.workers)) || SEED_WORKERS;
  const worker = workers.find(w => w.id === id);
  if (!worker) throw new Error(`Service worker with ID ${id} not found.`);
  return worker;
}

export async function apiCreateWorker(data) {
  await delay(200);
  const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.workers)) || SEED_WORKERS;
  const newWorker = {
    id: `WRK-${generateId(4)}`,
    name: data.name,
    category: data.category || 'Other',
    phone: data.phone,
    address: data.address || 'Local Community Service',
    timing: data.timing || '8:00 AM – 7:00 PM',
    rating: data.rating || '4.8',
    is_verified: true,
    speciality: data.speciality || 'General household maintenance & repair',
    added_by: data.added_by || 'Resident Member',
    created_at: new Date().toISOString()
  };
  workers.unshift(newWorker);
  localStorage.setItem(STORAGE_KEYS.workers, JSON.stringify(workers));
  return newWorker;
}

export async function apiDeleteWorker(id) {
  await delay(150);
  let workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.workers)) || SEED_WORKERS;
  workers = workers.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.workers, JSON.stringify(workers));
  return { success: true };
}

// ===== Initialization & Reset =====
export function initializeAPI() {
  initDB();
}

export function resetData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initDB();
}
