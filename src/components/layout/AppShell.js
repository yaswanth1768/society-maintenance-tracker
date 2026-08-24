// ===== Distinctive App Shell Layout Component =====
import { icon } from '../../assets/icons.js';
import { getCurrentUser, logout } from '../../store.js';
import { navigate, getHashPath } from '../../router.js';
import { apiGetUnreadNotificationCount } from '../../api.js';
import { showNotificationModal } from '../ui/NotificationModal.js';

const RESIDENT_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', iconName: 'home' },
  { path: '/complaints', label: 'My Requests', iconName: 'clipboardList' },
  { path: '/complaints/new', label: 'New Request', iconName: 'plusCircle' },
  { path: '/workers', label: 'Service Directory', iconName: 'users' },
  { path: '/notices', label: 'Notice Board', iconName: 'megaphone' },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Command Center', iconName: 'grid' },
  { path: '/admin/complaints', label: 'Manage Requests', iconName: 'clipboardList' },
  { path: '/admin/overdue', label: 'SLA Overdue', iconName: 'alertTriangle' },
  { path: '/admin/workers', label: 'Workers Directory', iconName: 'users' },
  { path: '/admin/notices', label: 'Notices CRUD', iconName: 'megaphone' },
  { path: '/admin/reports', label: 'Analytics Reports', iconName: 'barChart' },
];

export function mountAppShell(pageTitle) {
  const app = document.getElementById('app');
  const user = getCurrentUser();
  const isAdmin = user && user.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : RESIDENT_NAV_ITEMS;
  const currentPath = getHashPath();

  app.className = '';
  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__logo">
          <div class="sidebar__logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <div class="sidebar__logo-text">
            Society Tracker
            <span>${isAdmin ? 'Admin Console' : 'Resident Portal'}</span>
          </div>
        </div>
        
        <nav class="sidebar__nav">
          <div class="sidebar__nav-label">Navigation Menu</div>
          ${navItems.map(item => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
            return `
              <a href="#${item.path}" class="sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}">
                ${icon(item.iconName, 18)}
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>
        
        <div class="sidebar__footer">
          <div class="sidebar__user">
            <div class="sidebar__user-avatar">${(user?.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div class="sidebar__user-name">${user?.name || 'User'}</div>
              <div class="sidebar__user-role">${isAdmin ? 'Manager' : `Flat ${user?.flat || 'A-404'}`}</div>
            </div>
          </div>
          <button class="sidebar__logout" id="logout-btn" title="Sign out">${icon('logOut', 18)}</button>
        </div>
      </aside>
      
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      
      <!-- Main Content Area -->
      <div class="app-main-wrapper">
        <!-- Top Navigation Header -->
        <header class="header">
          <div class="header__left">
            <button class="header__menu-btn" id="menu-btn" aria-label="Toggle navigation menu">
              ${icon('menu', 20)}
            </button>
            <h1 class="header__title">${pageTitle}</h1>
          </div>
          
          <div class="header__right">
            <!-- Operational Status Pill -->
            <div style="display: flex; align-items: center; gap: 6px; background: var(--color-green-light); border: 1px solid var(--color-green-border); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: var(--color-green);">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-green);"></span>
              Live Sync
            </div>

            <!-- Notifications & Email Hub Bell Icon -->
            <button class="header__icon-btn" id="notification-bell-btn" title="Notification Center & Transactional Emails" aria-label="Notifications">
              ${icon('bell', 20)}
              <span class="header__notification-badge" id="header-unread-badge" style="display: none;">0</span>
            </button>

            <!-- User Profile Pill -->
            <div class="header__user-btn">
              <div class="header__user-avatar">${(user?.name || 'U').charAt(0).toUpperCase()}</div>
              <span class="header__user-name">${user?.name || 'User'}</span>
            </div>
          </div>
        </header>
        
        <!-- Page Body Content Target -->
        <main class="app-content" id="main-content"></main>
      </div>
      
      <!-- Mobile Bottom Navigation Bar -->
      <nav class="mobile-nav">
        <div class="mobile-nav__items">
          ${navItems.slice(0, 4).map(item => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
            return `
              <a href="#${item.path}" class="mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}">
                ${icon(item.iconName, 20)}
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </div>
      </nav>
    </div>
  `;

  // Sidebar toggle for mobile
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--open');
    overlay.classList.toggle('sidebar-overlay--visible');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('sidebar-overlay--visible');
  });

  // Logout handler
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    navigate('/login');
  });

  // Notification Bell Click Handler
  const bellBtn = document.getElementById('notification-bell-btn');
  bellBtn?.addEventListener('click', () => {
    if (user) {
      showNotificationModal(user.id);
    }
  });

  // Load and update unread notification count badge
  async function refreshNotificationBadge() {
    if (!user) return;
    try {
      const count = await apiGetUnreadNotificationCount(user.id);
      const badge = document.getElementById('header-unread-badge');
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 9 ? '9+' : count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch {
      // ignore
    }
  }

  refreshNotificationBadge();

  // Listen for real-time notification events
  const handleNotifUpdate = () => refreshNotificationBadge();
  window.addEventListener('smt_notification_received', handleNotifUpdate);
  window.addEventListener('smt_notification_updated', handleNotifUpdate);

  return document.getElementById('main-content');
}
