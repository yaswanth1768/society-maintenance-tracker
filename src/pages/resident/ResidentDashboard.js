// ===== Distinctive Resident Dashboard Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiGetDashboardStats, apiGetComplaints, apiGetNotices } from '../../api.js';
import { getGreeting, formatDate, truncate, statusClass, priorityClass } from '../../utils.js';
import { navigate } from '../../router.js';
import { showModal } from '../../components/ui/Modal.js';
import { showToast } from '../../components/ui/Toast.js';

export async function renderResidentDashboard() {
  const content = mountAppShell('Dashboard');
  const user = getCurrentUser();
  const firstName = user.name ? user.name.split(' ')[0] : 'Resident';
  
  content.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${getGreeting()}, ${firstName} 👋</h2>
      <p class="page-header__subtitle">Track your apartment maintenance requests, view society circulars, and monitor resolution timelines.</p>
    </div>
    <div class="stat-grid">
      ${Array(4).fill('<div class="skeleton skeleton--card"></div>').join('')}
    </div>
  `;
  
  try {
    const [stats, complaints, notices] = await Promise.all([
      apiGetDashboardStats(user.id),
      apiGetComplaints({ resident_id: user.id }),
      apiGetNotices()
    ]);
    
    const recentComplaints = complaints.slice(0, 5);
    const recentNotices = notices.slice(0, 3);
    
    content.innerHTML = `
      <!-- Hero Welcome Card -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); border-radius: var(--radius-2xl); padding: var(--space-8); color: white; margin-bottom: var(--space-8); position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(49, 46, 129, 0.25);">
        <div style="position: absolute; right: -20px; top: -20px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%); pointer-events: none;"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); position: relative; z-index: 2;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 9999px; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: var(--space-2); backdrop-filter: blur(4px);">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span>
              Unit ${user.flat || 'A-404'} Resident Portal
            </div>
            <h2 style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); letter-spacing: -0.02em; margin-bottom: 6px;">
              ${getGreeting()}, ${firstName}!
            </h2>
            <p style="font-size: var(--font-size-sm); color: rgba(255,255,255,0.8); max-width: 540px;">
              Manage your apartment maintenance tickets, view official notices, and track SLA resolution progress.
            </p>
          </div>

          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <a href="#/workers" class="btn" style="background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(4px);">
              ${icon('users', 16)} House Workers
            </a>
            <button class="btn" id="view-society-rules-btn" style="background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(4px);">
              ${icon('bookOpen', 16)} Society Bylaws
            </button>
            <a href="#/complaints/new" class="btn btn--accent" style="box-shadow: 0 4px 14px rgba(6,182,212,0.35);">
              ${icon('plusCircle', 16)} Raise Complaint
            </a>
          </div>
        </div>
      </div>

      <!-- Society Bylaws Banner (if unacknowledged) -->
      <div id="rules-banner-container" style="margin-bottom: var(--space-6);"></div>

      <!-- Stat KPI Cards -->
      <div class="stat-grid">
        <div class="stat-card stat-card--purple">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.total}</div>
            <div class="stat-card__label">Total Requests</div>
          </div>
          <div class="stat-card__icon stat-card__icon--gray">${icon('clipboardList', 22)}</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-blue);">${stats.open}</div>
            <div class="stat-card__label">Open (Pending)</div>
          </div>
          <div class="stat-card__icon stat-card__icon--blue">${icon('inbox', 22)}</div>
        </div>
        <div class="stat-card stat-card--amber">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-amber);">${stats.inProgress}</div>
            <div class="stat-card__label">In Progress</div>
          </div>
          <div class="stat-card__icon stat-card__icon--amber">${icon('clock', 22)}</div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-green);">${stats.resolved}</div>
            <div class="stat-card__label">Resolved Tickets</div>
          </div>
          <div class="stat-card__icon stat-card__icon--green">${icon('checkCircle', 22)}</div>
        </div>
      </div>
      
      <!-- Recent Complaints Section -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">
            ${icon('clipboardList', 20)} Recent Maintenance Requests
          </h3>
          <a href="#/complaints" class="link-btn" style="font-weight: 600;">View All (${complaints.length})</a>
        </div>
        ${recentComplaints.length > 0 ? `
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentComplaints.map(c => `
                  <tr>
                    <td><span class="complaint-id" data-id="${c.id}">#${c.id}</span></td>
                    <td><strong style="color: var(--color-gray-900);">${c.category}</strong></td>
                    <td class="description-cell" style="max-width: 320px;">${truncate(c.description, 50)}</td>
                    <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
                    <td>
                      <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
                      ${c.is_overdue ? ' <span class="badge badge--overdue">Overdue</span>' : ''}
                    </td>
                    <td style="white-space:nowrap; font-size: var(--font-size-xs); color: var(--color-gray-500);">${formatDate(c.created_at)}</td>
                    <td style="text-align: right;">
                      <button class="btn btn--ghost btn--sm" data-view-id="${c.id}">${icon('eye', 14)} Details</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('inbox', 48)}</div>
              <div class="empty-state__title">No Maintenance Requests Yet</div>
              <div class="empty-state__text">You haven't logged any maintenance complaints. Click below to submit your first issue.</div>
              <a href="#/complaints/new" class="btn btn--primary">${icon('plusCircle', 16)} Raise a Request</a>
            </div>
          </div>
        `}
      </div>
      
      <!-- Recent Notices Section -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">
            ${icon('megaphone', 20)} Society Notices & Circulars
          </h3>
          <a href="#/notices" class="link-btn" style="font-weight: 600;">View Bulletin (${notices.length})</a>
        </div>
        ${recentNotices.length > 0 ? recentNotices.map(n => `
          <div class="notice-card ${n.is_important ? 'notice-card--important' : ''}">
            <div class="notice-card__header">
              <h4 class="notice-card__title">${n.title}</h4>
              ${n.is_important ? '<span class="badge badge--important">Important Circular</span>' : ''}
            </div>
            <p class="notice-card__body">${truncate(n.description, 160)}</p>
            <div class="notice-card__footer">
              <span>Posted by: <strong>${n.author_name}</strong></span>
              <span>${formatDate(n.created_at, 'full')}</span>
            </div>
          </div>
        `).join('') : `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('megaphone', 48)}</div>
              <div class="empty-state__title">No Active Circulars</div>
              <div class="empty-state__text">There are currently no society notices published. Check back later for updates.</div>
            </div>
          </div>
        `}
      </div>
    `;
    
    // Society Rules & Regulations Modal Handler
    function renderRulesBanner() {
      const bannerEl = document.getElementById('rules-banner-container');
      if (!bannerEl) return;
      const isAccepted = localStorage.getItem('smt_rules_accepted');
      if (!isAccepted) {
        bannerEl.innerHTML = `
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1px solid var(--color-blue-border); border-left: 4px solid var(--color-blue); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-6); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); box-shadow: var(--shadow-xs);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="color: var(--color-blue);">${icon('shieldCheck', 28)}</div>
              <div>
                <strong style="color: var(--color-gray-900); font-size: var(--font-size-sm); display: block;">Society Living Bylaws & Guidelines</strong>
                <span style="font-size: var(--font-size-xs); color: var(--color-gray-600);">Please review and acknowledge society code of conduct regulations.</span>
              </div>
            </div>
            <button class="btn btn--primary btn--sm" id="banner-read-rules-btn">${icon('bookOpen', 14)} Review & Accept</button>
          </div>
        `;
        document.getElementById('banner-read-rules-btn')?.addEventListener('click', openSocietyRulesModal);
      } else {
        bannerEl.innerHTML = '';
      }
    }

    function openSocietyRulesModal() {
      const modalBody = `
        <div style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">
          <div style="margin-bottom: var(--space-4); background: var(--color-gray-50); padding: var(--space-3); border-radius: var(--radius-md);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-gray-900); margin-bottom: 2px;">1. Quiet Hours & Noise Control</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Quiet hours are enforced between <strong>10:00 PM and 6:00 AM</strong> daily. No loud music or heavy drilling is permitted.</p>
          </div>
          <div style="margin-bottom: var(--space-4); background: var(--color-gray-50); padding: var(--space-3); border-radius: var(--radius-md);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-gray-900); margin-bottom: 2px;">2. Waste Segregation Policy</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Wet and dry waste must be segregated into color-coded bins. Doorstep pickup occurs daily between <strong>7:30 AM – 9:00 AM</strong>.</p>
          </div>
          <div style="margin-bottom: var(--space-4); background: var(--color-gray-50); padding: var(--space-3); border-radius: var(--radius-md);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-gray-900); margin-bottom: 2px;">3. Parking Bay Regulations</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Park strictly in your allocated numbered slot. Visitor parking requires digital pass verification at the main gate.</p>
          </div>
          <div style="margin-bottom: var(--space-4); background: var(--color-gray-50); padding: var(--space-3); border-radius: var(--radius-md);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-gray-900); margin-bottom: 2px;">4. Maintenance Dues & SLAs</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Monthly dues are payable by the <strong>5th</strong>. Standard maintenance tickets are resolved within the 5-day SLA target.</p>
          </div>
        </div>
      `;

      const { close, overlay } = showModal({
        title: 'Society Code of Conduct & Bylaws',
        body: modalBody,
        footer: `
          <button class="btn btn--secondary" id="rules-close-btn">Close</button>
          <button class="btn btn--primary" id="rules-accept-btn">${icon('check', 14)} I Acknowledge & Agree</button>
        `
      });

      overlay.querySelector('#rules-close-btn')?.addEventListener('click', close);
      overlay.querySelector('#rules-accept-btn')?.addEventListener('click', () => {
        localStorage.setItem('smt_rules_accepted', 'true');
        showToast('Society Bylaws acknowledged.', 'success');
        close();
        renderRulesBanner();
      });
    }

    renderRulesBanner();
    document.getElementById('view-society-rules-btn')?.addEventListener('click', openSocietyRulesModal);
    
    // Click bindings
    content.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/complaints/${el.dataset.id}`));
    });
    content.querySelectorAll('[data-view-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/complaints/${el.dataset.viewId}`));
    });
    
  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Unable to load dashboard data: ${err.message}</div>`;
  }
}
