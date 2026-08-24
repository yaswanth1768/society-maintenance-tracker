// ===== Distinctive Resident Notice Board Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetNotices } from '../../api.js';
import { formatDate } from '../../utils.js';
import { navigate } from '../../router.js';

export async function renderNoticeBoard() {
  const content = mountAppShell('Notice Board');
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="notices-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Society Notice Board</h2>
      <p class="page-header__subtitle">Official community circulars, maintenance schedules, and important announcements.</p>
    </div>
    <div id="notices-container">
      ${Array(3).fill('<div class="card card--padded mb-4"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-2"></div><div class="skeleton skeleton--text"></div></div>').join('')}
    </div>
  `;
  
  document.getElementById('notices-back-btn')?.addEventListener('click', () => navigate('/dashboard'));
  
  try {
    const notices = await apiGetNotices();
    const container = document.getElementById('notices-container');
    
    if (notices.length === 0) {
      container.innerHTML = `
        <div class="card card--padded">
          <div class="empty-state">
            <div class="empty-state__icon">${icon('megaphone', 48)}</div>
            <div class="empty-state__title">No Notices Published</div>
            <div class="empty-state__text">There are currently no circulars or announcements posted by the society management office.</div>
          </div>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-5);">
        ${notices.map(n => `
          <div class="notice-card ${n.is_important ? 'notice-card--important' : ''}" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="notice-card__header">
                <h3 class="notice-card__title" style="font-size: var(--font-size-base);">${n.title}</h3>
                ${n.is_important ? '<span class="badge badge--important" style="flex-shrink: 0;">Pinned Notice</span>' : ''}
              </div>
              <p class="notice-card__body" style="font-size: var(--font-size-sm); color: var(--color-gray-700); line-height: 1.6;">
                ${n.description}
              </p>
            </div>
            
            <div class="notice-card__footer" style="padding-top: var(--space-3); border-top: 1px solid ${n.is_important ? 'var(--color-red-border)' : 'var(--color-gray-100)'};">
              <span style="font-weight: 500; color: var(--color-gray-700);">✍️ ${n.author_name}</span>
              <span>${formatDate(n.created_at, 'full')}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
  } catch (err) {
    document.getElementById('notices-container').innerHTML = `
      <div class="inline-error">${icon('alertCircle', 16)} Unable to load notice board: ${err.message}</div>
    `;
  }
}
