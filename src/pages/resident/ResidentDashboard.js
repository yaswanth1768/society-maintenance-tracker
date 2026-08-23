// ===== Resident Dashboard =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiGetDashboardStats, apiGetComplaints, apiGetNotices } from '../../api.js';
import { getGreeting, formatDate, truncate, statusClass, priorityClass } from '../../utils.js';
import { navigate } from '../../router.js';
import { showModal } from '../../components/ui/Modal.js';
import { showToast } from '../../components/ui/Toast.js';

function renderSkeletons() {
  return `
    <div class="stat-grid">
      ${Array(4).fill('<div class="skeleton skeleton--card"></div>').join('')}
    </div>
    <div class="section">
      <div class="skeleton skeleton--title mb-4"></div>
      ${Array(3).fill('<div class="skeleton skeleton--row"></div>').join('')}
    </div>
  `;
}

export async function renderResidentDashboard() {
  const content = mountAppShell('Dashboard');
  const user = getCurrentUser();
  
  content.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">${getGreeting()}, ${user.name.split(' ')[0]}</h2>
      <p class="page-header__subtitle">Track your maintenance requests and stay updated with society announcements.</p>
    </div>
    ${renderSkeletons()}
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
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
        <div>
          <h2 class="page-header__title">${getGreeting()}, ${user.name.split(' ')[0]}</h2>
          <p class="page-header__subtitle">Track your maintenance requests and stay updated with society announcements.</p>
        </div>
        <button class="btn btn--secondary" id="view-society-rules-btn" style="display: flex; align-items: center; gap: var(--space-2);">
          ${icon('bookOpen', 16)}
          <span>Society Rules & Regulations</span>
        </button>
      </div>

      <!-- Society Rules Acknowledgment Notice Banner -->
      <div id="rules-banner-container" style="margin-bottom: var(--space-6);"></div>

      
      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.total}</div>
            <div class="stat-card__label">Total Complaints</div>
          </div>
          <div class="stat-card__icon stat-card__icon--gray">${icon('clipboardList', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.open}</div>
            <div class="stat-card__label">Open</div>
          </div>
          <div class="stat-card__icon stat-card__icon--blue">${icon('inbox', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.inProgress}</div>
            <div class="stat-card__label">In Progress</div>
          </div>
          <div class="stat-card__icon stat-card__icon--amber">${icon('clock', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.resolved}</div>
            <div class="stat-card__label">Resolved</div>
          </div>
          <div class="stat-card__icon stat-card__icon--green">${icon('checkCircle', 20)}</div>
        </div>
      </div>
      
      <!-- Recent Complaints -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">Recent Complaints</h3>
          <a href="#/complaints" class="link-btn">View all</a>
        </div>
        ${recentComplaints.length > 0 ? `
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentComplaints.map(c => `
                  <tr>
                    <td><span class="complaint-id" data-id="${c.id}">#${c.id}</span></td>
                    <td>${c.category}</td>
                    <td class="description-cell">${truncate(c.description, 50)}</td>
                    <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
                    <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
                    <td style="white-space:nowrap;">${formatDate(c.created_at)}</td>
                    <td><button class="btn btn--ghost btn--sm" data-view-id="${c.id}">${icon('eye', 14)} View</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Mobile complaint cards -->
          <div class="complaint-cards-mobile" style="display:none;">
            ${recentComplaints.map(c => `
              <div class="complaint-card">
                <div class="complaint-card__header">
                  <span class="complaint-card__id" data-id="${c.id}">#${c.id}</span>
                  <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
                </div>
                <div class="complaint-card__category">${c.category}</div>
                <div class="complaint-card__description">${truncate(c.description, 80)}</div>
                <div class="complaint-card__meta">
                  <span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span>
                  <span class="complaint-card__date">${formatDate(c.created_at)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('inbox', 48)}</div>
              <div class="empty-state__title">No complaints yet</div>
              <div class="empty-state__text">You haven't submitted any maintenance complaints.</div>
              <a href="#/complaints/new" class="btn btn--primary">${icon('plusCircle', 16)} Raise a Complaint</a>
            </div>
          </div>
        `}
      </div>
      
      <!-- Recent Notices -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">Recent Notices</h3>
          <a href="#/notices" class="link-btn">View all</a>
        </div>
        ${recentNotices.length > 0 ? recentNotices.map(n => `
          <div class="notice-card ${n.is_important ? 'notice-card--important' : ''}">
            <div class="notice-card__header">
              <h4 class="notice-card__title">${n.title}</h4>
              ${n.is_important ? '<span class="badge badge--important">Important</span>' : ''}
            </div>
            <p class="notice-card__body">${truncate(n.description, 150)}</p>
            <div class="notice-card__footer">
              <span>Posted by ${n.author_name}</span>
              <span>${formatDate(n.created_at)}</span>
            </div>
          </div>
        `).join('') : `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('megaphone', 48)}</div>
              <div class="empty-state__title">No notices</div>
              <div class="empty-state__text">There are no society notices at this time.</div>
            </div>
          </div>
        `}
      </div>
    `;
    
    // Society Rules Modal & Banner
    function renderRulesBanner() {
      const bannerEl = document.getElementById('rules-banner-container');
      if (!bannerEl) return;
      const isAccepted = localStorage.getItem('smt_rules_accepted');
      if (!isAccepted) {
        bannerEl.innerHTML = `
          <div style="background: var(--color-blue-light); border: 1px solid var(--color-blue-bg); border-left: 4px solid var(--color-blue); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="color: var(--color-blue);">${icon('shieldCheck', 24)}</div>
              <div>
                <strong style="color: var(--color-navy); font-size: var(--font-size-sm); display: block;">Society Living Rules & Guidelines</strong>
                <span style="font-size: var(--font-size-xs); color: var(--color-gray-600);">Please review and acknowledge the community bylaws for a harmonious society.</span>
              </div>
            </div>
            <button class="btn btn--primary btn--sm" id="banner-read-rules-btn">${icon('bookOpen', 14)} Review & Accept Rules</button>
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
          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">1. Quiet Hours & Noise Control</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Quiet hours are observed between <strong>10:00 PM and 6:00 AM</strong>. Heavy drilling, construction, or loud music is strictly prohibited during these hours.</p>
          </div>
          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">2. Waste Segregation & Collection</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">All households must segregate wet and dry waste into separate color-coded bins. Doorstep collection is daily from <strong>7:30 AM to 9:00 AM</strong>.</p>
          </div>
          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">3. Parking Regulations</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Park strictly in designated allocated parking bays. Guest parking requires security gate clearance and sticker authorization.</p>
          </div>
          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">4. Common Amenities & Gym Timings</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Clubhouse, Gym, and Swimming pool are open from <strong>6:00 AM to 10:00 PM</strong>. Community hall bookings must be submitted 48 hours in advance.</p>
          </div>
          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">5. Monthly Maintenance Payments</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Society dues must be paid by the <strong>5th of every month</strong>. Late charges of ₹500/month will be levied on overdue accounts.</p>
          </div>
          <div>
            <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-gray-900); margin-bottom: 2px;">6. Complaint Resolution SLAs</h4>
            <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5;">Emergency maintenance is responded within 4 hours; general complaints are inspected within 24-48 hours and resolved within 5 days.</p>
          </div>
        </div>
      `;

      const { close, overlay } = showModal({
        title: 'Society Rules & Community Code of Conduct',
        body: modalBody,
        footer: `
          <button class="btn btn--secondary" id="rules-close-btn">Close</button>
          <button class="btn btn--primary" id="rules-accept-btn">${icon('check', 14)} I Acknowledge & Agree</button>
        `
      });

      overlay.querySelector('#rules-close-btn')?.addEventListener('click', close);
      overlay.querySelector('#rules-accept-btn')?.addEventListener('click', () => {
        localStorage.setItem('smt_rules_accepted', 'true');
        showToast('Society Rules acknowledged successfully.', 'success');
        close();
        renderRulesBanner();
      });
    }

    renderRulesBanner();
    document.getElementById('view-society-rules-btn')?.addEventListener('click', openSocietyRulesModal);

    // Handle responsive table/cards
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
    
    // Click handlers
    content.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/complaints/${el.dataset.id}`));
    });
    content.querySelectorAll('[data-view-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/complaints/${el.dataset.viewId}`));
    });
    
    return () => {
      window.removeEventListener('resize', handleResponsive);
    };
    
  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Unable to load dashboard data. Please try again.</div>`;
  }
}

function handleResponsive() {
  const table = document.querySelector('.data-table-wrapper');
  const cards = document.querySelector('.complaint-cards-mobile');
  if (!table || !cards) return;
  
  if (window.innerWidth <= 768) {
    table.style.display = 'none';
    cards.style.display = 'block';
  } else {
    table.style.display = '';
    cards.style.display = 'none';
  }
}
