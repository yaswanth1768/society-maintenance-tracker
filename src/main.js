// ===== Main Entry Point =====
import './styles/global.css';
import { initializeAPI } from './api.js';
import { addRoute, initRouter } from './router.js';

// Auth Pages
import { renderLoginPage } from './pages/LoginPage.js';
import { renderRegisterPage } from './pages/RegisterPage.js';

// Resident Pages
import { renderResidentDashboard } from './pages/resident/ResidentDashboard.js';
import { renderMyComplaints } from './pages/resident/MyComplaints.js';
import { renderNewComplaint } from './pages/resident/NewComplaint.js';
import { renderComplaintDetail } from './pages/resident/ComplaintDetail.js';
import { renderNoticeBoard } from './pages/resident/NoticeBoard.js';

// Admin Pages
import { renderAdminDashboard } from './pages/admin/AdminDashboard.js';
import { renderAdminComplaints } from './pages/admin/AdminComplaints.js';
import { renderAdminComplaintDetail } from './pages/admin/AdminComplaintDetail.js';
import { renderAdminOverdue } from './pages/admin/AdminOverdue.js';
import { renderAdminNotices } from './pages/admin/AdminNotices.js';
import { renderAdminReports } from './pages/admin/AdminReports.js';
import { renderWorkersDirectory } from './pages/common/WorkersDirectory.js';

// 1. Initialize local seed database
initializeAPI();

// 2. Register Routes

// Public / Guest Routes
addRoute('/login', renderLoginPage, { guest: true });
addRoute('/register', renderRegisterPage, { guest: true });

// Resident Routes
addRoute('/dashboard', renderResidentDashboard, { requireAuth: true, role: 'resident' });
addRoute('/complaints', renderMyComplaints, { requireAuth: true, role: 'resident' });
addRoute('/complaints/new', renderNewComplaint, { requireAuth: true, role: 'resident' });
addRoute('/complaints/:id', renderComplaintDetail, { requireAuth: true, role: 'resident' });
addRoute('/notices', renderNoticeBoard, { requireAuth: true, role: 'resident' });
addRoute('/workers', renderWorkersDirectory, { requireAuth: true, role: 'resident' });

// Admin Routes
addRoute('/admin/dashboard', renderAdminDashboard, { requireAuth: true, role: 'admin' });
addRoute('/admin/complaints', renderAdminComplaints, { requireAuth: true, role: 'admin' });
addRoute('/admin/complaints/:id', renderAdminComplaintDetail, { requireAuth: true, role: 'admin' });
addRoute('/admin/overdue', renderAdminOverdue, { requireAuth: true, role: 'admin' });
addRoute('/admin/notices', renderAdminNotices, { requireAuth: true, role: 'admin' });
addRoute('/admin/workers', renderWorkersDirectory, { requireAuth: true, role: 'admin' });
addRoute('/admin/reports', renderAdminReports, { requireAuth: true, role: 'admin' });

// 3. Start Router
initRouter();
