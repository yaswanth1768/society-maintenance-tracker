// ===== Notice Board Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetNotices } from '../../api.js';
import { formatDate } from '../../utils.js';
import { navigate } from '../../router.js';

export async function renderNoticeBoard() {
  const content = mountAppShell('Notice Board');
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="notice-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Society Notices</h2>
      <p class="page-header__subtitle">Stay updated with important announcements from the society administration.</p>
    </div>
    <div id="notices-list">
      ${Array(3).fill(`<div class="skeleton skeleton--card mb-4" style="height: 120px;"></div>`).join('')}
    </div>
  `;
  
  try {
    document.getElementById('notice-back-btn')?.addEventListener('click', () => navigate('/dashboard'));
    const notices = await apiGetNotices();
    const listEl = document.getElementById('notices-list');
    
    if (notices.length === 0) {
      listEl.innerHTML = `
        <div class="card card--padded">
          <div class="empty-state">
            <div class="empty-state__icon">${icon('megaphone', 48)}</div>
            <div class="empty-state__title">No notices</div>
            <div class="empty-state__text">There are no society notices at this time. Check back later for updates.</div>
          </div>
        </div>
      `;
      return;
    }
    
    listEl.innerHTML = notices.map(n => `
      <div class="notice-card ${n.is_important ? 'notice-card--important' : ''}">
        <div class="notice-card__header">
          <h3 class="notice-card__title">${n.title}</h3>
          ${n.is_important ? '<span class="badge badge--important">Important</span>' : ''}
        </div>
        <p class="notice-card__body">${n.description}</p>
        <div class="notice-card__footer">
          <span>Posted by ${n.author_name}</span>
          <span>${formatDate(n.created_at, 'full')}</span>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    document.getElementById('notices-list').innerHTML = `
      <div class="inline-error">${icon('alertCircle', 16)} Unable to load notices. Please try again.</div>
    `;
  }
}
