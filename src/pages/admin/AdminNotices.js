// ===== Admin Notice Management Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { 
  apiGetNotices, 
  apiCreateNotice, 
  apiUpdateNotice, 
  apiDeleteNotice 
} from '../../api.js';
import { formatDate, truncate } from '../../utils.js';
import { showModal, showConfirmModal } from '../../components/ui/Modal.js';
import { showToast } from '../../components/ui/Toast.js';

import { navigate } from '../../router.js';

export async function renderAdminNotices() {
  const content = mountAppShell('Notices');
  const user = getCurrentUser();

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-notices-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
      <div>
        <h2 class="page-header__title">Manage Society Notices</h2>
        <p class="page-header__subtitle">Publish notices, broadcast announcements, and mark critical updates as important.</p>
      </div>
      <button class="btn btn--primary" id="create-notice-btn">
        ${icon('plus', 16)} New Notice
      </button>
    </div>

    <div id="admin-notices-container">
      <div class="card card--padded">
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--row mt-2"></div>
      </div>
    </div>
  `;

  async function loadNotices() {
    const container = document.getElementById('admin-notices-container');
    if (!container) return;

    try {
      const notices = await apiGetNotices();

      if (notices.length === 0) {
        container.innerHTML = `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('megaphone', 48)}</div>
              <div class="empty-state__title">No Notices Published</div>
              <div class="empty-state__text">Keep residents informed by publishing society circulars and maintenance alerts.</div>
              <button class="btn btn--primary mt-4" id="empty-create-notice-btn">
                ${icon('plus', 16)} Create First Notice
              </button>
            </div>
          </div>
        `;
        document.getElementById('empty-create-notice-btn')?.addEventListener('click', openCreateModal);
        return;
      }

      container.innerHTML = `
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Author</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${notices.map(n => `
                <tr>
                  <td style="font-weight: var(--font-weight-medium); color: var(--color-gray-900);">
                    ${n.title}
                  </td>
                  <td>
                    ${n.is_important 
                      ? '<span class="badge badge--important">Important</span>' 
                      : '<span class="badge badge--low">Standard</span>'}
                  </td>
                  <td class="description-cell" style="max-width: 320px;">
                    ${truncate(n.description, 60)}
                  </td>
                  <td style="white-space: nowrap;">
                    ${formatDate(n.created_at)}
                  </td>
                  <td>${n.author_name || 'Admin'}</td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn--ghost btn--sm" data-edit-notice="${n.id}" title="Edit notice">
                      ${icon('edit', 14)} Edit
                    </button>
                    <button class="btn btn--ghost btn--sm" data-delete-notice="${n.id}" style="color: var(--color-red);" title="Delete notice">
                      ${icon('trash', 14)} Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Bind action events
      container.querySelectorAll('[data-edit-notice]').forEach(btn => {
        btn.addEventListener('click', () => {
          const notice = notices.find(item => item.id === btn.dataset.editNotice);
          if (notice) openEditModal(notice);
        });
      });

      container.querySelectorAll('[data-delete-notice]').forEach(btn => {
        btn.addEventListener('click', () => {
          const notice = notices.find(item => item.id === btn.dataset.deleteNotice);
          if (notice) handleDeleteNotice(notice);
        });
      });

    } catch (err) {
      container.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Error loading notices: ${err.message}</div>`;
    }
  }

  // Open Create Notice Modal
  function openCreateModal() {
    const modalBody = `
      <form id="notice-create-form">
        <div class="form-group">
          <label class="form-label" for="notice-title">Notice Title</label>
          <input type="text" id="notice-title" class="form-input" placeholder="e.g. Scheduled Power Outage" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="notice-description">Notice Content</label>
          <textarea id="notice-description" class="form-input form-textarea" rows="5" placeholder="Enter notice details, instructions, schedules, etc..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-toggle">
            <input type="checkbox" id="notice-important" />
            <span class="form-toggle__switch"></span>
            <span class="form-toggle__label"><strong>Pin as Important Notice</strong> (Highlighted for residents)</span>
          </label>
        </div>
      </form>
    `;

    const { close, overlay } = showModal({
      title: 'Publish New Society Notice',
      body: modalBody,
      footer: `
        <button class="btn btn--secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn--primary" id="modal-publish-btn">${icon('check', 14)} Publish Notice</button>
      `
    });

    overlay.querySelector('#modal-cancel-btn').addEventListener('click', close);
    overlay.querySelector('#modal-publish-btn').addEventListener('click', async () => {
      const title = overlay.querySelector('#notice-title').value.trim();
      const description = overlay.querySelector('#notice-description').value.trim();
      const is_important = overlay.querySelector('#notice-important').checked;

      if (!title || !description) {
        showToast('Please fill in title and description.', 'error');
        return;
      }

      const publishBtn = overlay.querySelector('#modal-publish-btn');
      publishBtn.disabled = true;
      publishBtn.textContent = 'Publishing…';

      try {
        await apiCreateNotice({
          title,
          description,
          is_important,
          created_by: user?.id || 'USR-ADMIN',
          author_name: user?.name || 'Society Admin'
        });
        showToast('Notice published successfully.', 'success');
        close();
        loadNotices();
      } catch (err) {
        showToast('Failed to publish notice.', 'error');
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish Notice';
      }
    });
  }

  // Open Edit Notice Modal
  function openEditModal(notice) {
    const modalBody = `
      <form id="notice-edit-form">
        <div class="form-group">
          <label class="form-label" for="edit-notice-title">Notice Title</label>
          <input type="text" id="edit-notice-title" class="form-input" value="${notice.title}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-notice-description">Notice Content</label>
          <textarea id="edit-notice-description" class="form-input form-textarea" rows="5" required>${notice.description}</textarea>
        </div>
        <div class="form-group">
          <label class="form-toggle">
            <input type="checkbox" id="edit-notice-important" ${notice.is_important ? 'checked' : ''} />
            <span class="form-toggle__switch"></span>
            <span class="form-toggle__label"><strong>Pin as Important Notice</strong></span>
          </label>
        </div>
      </form>
    `;

    const { close, overlay } = showModal({
      title: 'Edit Society Notice',
      body: modalBody,
      footer: `
        <button class="btn btn--secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn--primary" id="modal-save-btn">${icon('check', 14)} Save Changes</button>
      `
    });

    overlay.querySelector('#modal-cancel-btn').addEventListener('click', close);
    overlay.querySelector('#modal-save-btn').addEventListener('click', async () => {
      const title = overlay.querySelector('#edit-notice-title').value.trim();
      const description = overlay.querySelector('#edit-notice-description').value.trim();
      const is_important = overlay.querySelector('#edit-notice-important').checked;

      if (!title || !description) {
        showToast('Please fill in title and description.', 'error');
        return;
      }

      const saveBtn = overlay.querySelector('#modal-save-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';

      try {
        await apiUpdateNotice(notice.id, { title, description, is_important });
        showToast('Notice updated successfully.', 'success');
        close();
        loadNotices();
      } catch (err) {
        showToast('Failed to update notice.', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    });
  }

  // Delete Notice with Confirmation
  function handleDeleteNotice(notice) {
    showConfirmModal({
      title: 'Delete Notice',
      message: `Are you sure you want to permanently delete the notice "${notice.title}"? This action cannot be undone.`,
      confirmText: 'Delete Notice',
      confirmClass: 'btn--danger',
      onConfirm: async () => {
        try {
          await apiDeleteNotice(notice.id);
          showToast('Notice deleted.', 'success');
          loadNotices();
        } catch (err) {
          showToast('Failed to delete notice.', 'error');
        }
      }
    });
  }

  document.getElementById('admin-notices-back-btn')?.addEventListener('click', () => navigate('/admin/dashboard'));
  document.getElementById('create-notice-btn')?.addEventListener('click', openCreateModal);
  await loadNotices();
}
