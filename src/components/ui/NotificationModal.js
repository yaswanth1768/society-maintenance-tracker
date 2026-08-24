// ===== Notification Center & Email Hub Modal Component =====
import { icon } from '../../assets/icons.js';
import { 
  apiGetNotifications, 
  apiMarkNotificationRead, 
  apiMarkAllNotificationsRead 
} from '../../api.js';
import { formatDate, timeAgo } from '../../utils.js';
import { showModal } from './Modal.js';
import { navigate } from '../../router.js';

export async function openNotificationCenterModal(currentUser) {
  const notifications = await apiGetNotifications(currentUser?.role === 'resident' ? currentUser.id : null);

  function renderList(items) {
    if (items.length === 0) {
      return `
        <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
          <div class="empty-state__icon" style="color: var(--color-gray-300);">${icon('bell', 40)}</div>
          <div class="empty-state__title">No Notifications</div>
          <div class="empty-state__text">You're all caught up! You will receive email alerts here when complaint statuses change or important society notices are published.</div>
        </div>
      `;
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); padding: 0 var(--space-1);">
        <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); font-weight: 600; text-transform: uppercase;">
          ${items.filter(n => !n.is_read).length} Unread Updates
        </span>
        <button class="link-btn" id="mark-all-read-btn" style="font-size: var(--font-size-xs);">Mark all as read</button>
      </div>
      <div class="notification-list">
        ${items.map(n => `
          <div class="notification-card ${!n.is_read ? 'notification-card--unread' : ''}" data-notif-id="${n.id}">
            <div class="notification-card__header">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span class="badge ${n.type === 'important_notice' ? 'badge--important' : 'badge--open'}">
                  ${n.type === 'important_notice' ? 'Notice' : 'Complaint'}
                </span>
                <span class="notification-card__title">${n.title}</span>
              </div>
              <span class="notification-card__time">${timeAgo(n.created_at)}</span>
            </div>
            <p class="notification-card__body">${n.message}</p>
            <div class="notification-card__footer">
              <span>${n.recipient_email ? `To: ${n.recipient_email}` : ''}</span>
              <span style="color: var(--color-primary); font-weight: 500; display: flex; align-items: center; gap: 4px;">
                ${icon('eye', 12)} View Email
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const { close, overlay } = showModal({
    title: 'Notification Center & Email Updates',
    body: `<div id="notif-modal-content">${renderList(notifications)}</div>`,
    footer: `<button class="btn btn--secondary" id="notif-close-btn">Close</button>`
  });

  overlay.querySelector('#notif-close-btn')?.addEventListener('click', close);

  function attachListEvents() {
    overlay.querySelector('#mark-all-read-btn')?.addEventListener('click', async () => {
      await apiMarkAllNotificationsRead(currentUser?.role === 'resident' ? currentUser.id : null);
      const updated = await apiGetNotifications(currentUser?.role === 'resident' ? currentUser.id : null);
      const contentEl = overlay.querySelector('#notif-modal-content');
      if (contentEl) {
        contentEl.innerHTML = renderList(updated);
        attachListEvents();
      }
    });

    overlay.querySelectorAll('[data-notif-id]').forEach(card => {
      card.addEventListener('click', async () => {
        const notifId = card.dataset.notifId;
        const targetNotif = notifications.find(n => n.id === notifId);
        if (!targetNotif) return;

        // Mark read
        await apiMarkNotificationRead(notifId);
        card.classList.remove('notification-card--unread');

        // Open detailed email preview modal
        openEmailDetailModal(targetNotif, close);
      });
    });
  }

  attachListEvents();
}

function openEmailDetailModal(notif, parentClose) {
  const emailContent = `
    <div class="email-preview-card">
      <div class="email-banner">
        ${icon('bell', 24)}
        <div>
          <strong style="display: block; font-size: var(--font-size-sm);">Society Maintenance Automated Notification</strong>
          <span style="font-size: var(--font-size-xs); opacity: 0.85;">Transactional Email Dispatch Service</span>
        </div>
      </div>
      <div class="email-preview-header">
        <div class="email-meta-row">
          <span class="email-meta-label">From:</span>
          <span>Society Management &lt;admin@society.com&gt;</span>
        </div>
        <div class="email-meta-row">
          <span class="email-meta-label">To:</span>
          <span>${notif.recipient_email || 'Resident'}</span>
        </div>
        <div class="email-meta-row">
          <span class="email-meta-label">Date:</span>
          <span>${formatDate(notif.created_at, 'datetime')}</span>
        </div>
        <div class="email-meta-row">
          <span class="email-meta-label">Subject:</span>
          <strong style="color: var(--color-gray-900);">${notif.email_subject || notif.title}</strong>
        </div>
      </div>
      <div class="email-preview-body">
        <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: var(--color-gray-800);">${notif.email_body || notif.message}</pre>
      </div>
    </div>
  `;

  const { close: closeDetail, overlay: detailOverlay } = showModal({
    title: 'Email Notification Details',
    body: emailContent,
    footer: `
      ${notif.metadata?.complaint_id ? `<button class="btn btn--primary" id="view-complaint-direct-btn">${icon('arrowLeft', 14)} Go to Complaint #${notif.metadata.complaint_id}</button>` : ''}
      <button class="btn btn--secondary" id="detail-close-btn">Back</button>
    `
  });

  detailOverlay.querySelector('#detail-close-btn')?.addEventListener('click', closeDetail);
  detailOverlay.querySelector('#view-complaint-direct-btn')?.addEventListener('click', () => {
    closeDetail();
    if (parentClose) parentClose();
    navigate(`/complaints/${notif.metadata.complaint_id}`);
  });
}
