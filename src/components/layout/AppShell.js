// ===== Application Shell =====
// Sidebar + Header + Mobile Nav + Content Area
import { icon } from '../../assets/icons.js';
import { getCurrentUser, isAdmin, setCurrentUser } from '../../store.js';
import { navigate, getHash } from '../../router.js';
import { getInitials } from '../../utils.js';

let sidebarOpen = false;

const RESIDENT_NAV = [
  { label: 'Dashboard', icon: 'home', path: '/dashboard' },
  { label: 'My Complaints', icon: 'clipboardList', path: '/complaints' },
  { label: 'New Complaint', icon: 'plusCircle', path: '/complaints/new' },
  { label: 'Notice Board', icon: 'megaphone', path: '/notices' },
];

const ADMIN_NAV = [
  { label: 'Dashboard', icon: 'home', path: '/admin/dashboard' },
  { label: 'Complaints', icon: 'clipboardList', path: '/admin/complaints' },
  { label: 'Overdue', icon: 'alertTriangle', path: '/admin/overdue' },
  { label: 'Notices', icon: 'megaphone', path: '/admin/notices' },
  { label: 'Reports', icon: 'barChart', path: '/admin/reports' },
];

function getNavItems() {
  return isAdmin() ? ADMIN_NAV : RESIDENT_NAV;
}

function isActive(path) {
  const hash = getHash();
  if (path === '/dashboard' && hash === '/dashboard') return true;
  if (path === '/admin/dashboard' && hash === '/admin/dashboard') return true;
  if (path !== '/dashboard' && path !== '/admin/dashboard' && hash.startsWith(path)) return true;
  return false;
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('sidebar--open', sidebarOpen);
  if (overlay) overlay.classList.toggle('sidebar-overlay--visible', sidebarOpen);
}

function closeSidebar() {
  sidebarOpen = false;
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('sidebar--open');
  if (overlay) overlay.classList.remove('sidebar-overlay--visible');
}

function handleLogout() {
  setCurrentUser(null);
  navigate('/login');
}

export function renderAppShell(pageTitle = '') {
  const user = getCurrentUser();
  if (!user) return '';
  
  const navItems = getNavItems();
  const initials = getInitials(user.name);
  const roleName = user.role === 'admin' ? 'Administrator' : `Resident • ${user.flat || ''}`;
  
  // Mobile nav uses first 4 items
  const mobileItems = navItems.slice(0, 4);

  return `
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </div>
        <div class="sidebar__logo-text">
          Society Maintenance
          <span>Tracker</span>
        </div>
      </div>
      
      <nav class="sidebar__nav">
        <div class="sidebar__nav-label">${user.role === 'admin' ? 'Administration' : 'Navigation'}</div>
        ${navItems.map(item => `
          <a class="sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}" 
             data-nav-path="${item.path}" href="#${item.path}">
            ${icon(item.icon, 18)}
            ${item.label}
          </a>
        `).join('')}
      </nav>
      
      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="sidebar__user-avatar">${initials}</div>
          <div class="sidebar__user-info">
            <div class="sidebar__user-name">${user.name}</div>
            <div class="sidebar__user-role">${roleName}</div>
          </div>
        </div>
        <button class="sidebar__logout" id="sidebar-logout-btn">
          ${icon('logOut', 18)}
          Log out
        </button>
      </div>
    </aside>
    
    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    
    <!-- Main Wrapper -->
    <div class="app-main-wrapper">
      <!-- Header -->
      <header class="header" id="app-header">
        <div class="header__left">
          <button class="header__menu-btn" id="menu-toggle-btn">
            ${icon('menu', 20)}
          </button>
          <h1 class="header__title" id="header-page-title">${pageTitle}</h1>
        </div>
        <div class="header__right">
          <button class="header__icon-btn" id="header-notification-btn" title="Notifications">
            ${icon('bell', 20)}
          </button>
          <button class="header__user-btn" id="header-user-btn">
            <div class="header__user-avatar">${initials}</div>
            <span class="header__user-name">${user.name}</span>
          </button>
        </div>
      </header>
      
      <!-- Content -->
      <main class="app-content" id="page-content">
      </main>
    </div>
    
    <!-- Mobile Bottom Nav -->
    <nav class="mobile-nav" id="mobile-nav">
      <div class="mobile-nav__items">
        ${mobileItems.map(item => `
          <a class="mobile-nav__item ${isActive(item.path) ? 'mobile-nav__item--active' : ''}" 
             href="#${item.path}" data-nav-path="${item.path}">
            ${icon(item.icon, 22)}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}

export function mountAppShell(pageTitle) {
  const app = document.getElementById('app');
  app.className = 'app-layout';
  app.innerHTML = renderAppShell(pageTitle);
  
  // Event listeners
  const menuBtn = document.getElementById('menu-toggle-btn');
  const overlay = document.getElementById('sidebar-overlay');
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  
  if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  // Close sidebar on nav click (mobile)
  document.querySelectorAll('[data-nav-path]').forEach(el => {
    el.addEventListener('click', () => {
      closeSidebar();
    });
  });
  
  return document.getElementById('page-content');
}

export function updateHeaderTitle(title) {
  const el = document.getElementById('header-page-title');
  if (el) el.textContent = title;
}
