// ===== Admin Complaint Detail & Lifecycle Management Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { 
  apiGetComplaint, 
  apiGetComplaintHistory, 
  apiUpdateComplaintStatus, 
  apiUpdateComplaintPriority 
} from '../../api.js';
import { formatDate, statusClass, priorityClass } from '../../utils.js';
import { showToast } from '../../components/ui/Toast.js';
import { navigate } from '../../router.js';

export async function renderAdminComplaintDetail(params) {
  const content = mountAppShell('Complaint Management');
  const complaintId = params.id;
  const adminUser = getCurrentUser();

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-back-btn">${icon('arrowLeft', 16)} Back to Complaints</button>
    </div>
    <div class="detail-layout">
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--card"></div></div>
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div></div>
    </div>
  `;

  document.getElementById('admin-back-btn')?.addEventListener('click', () => navigate('/admin/complaints'));

  try {
    const [complaint, history] = await Promise.all([
      apiGetComplaint(complaintId),
      apiGetComplaintHistory(complaintId)
    ]);

    function renderView() {
      content.innerHTML = `
        <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
          <button class="btn btn--ghost" id="admin-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Complaints</button>
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <span class="badge badge--${statusClass(complaint.status)}">${complaint.status}</span>
            ${complaint.is_overdue ? '<span class="badge badge--overdue">SLA Overdue</span>' : ''}
          </div>
        </div>

        <div class="detail-layout">
          <!-- Left Column: Complaint & Resident Info + Action Controls -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            
            <!-- Complaint Overview Card -->
            <div class="card card--padded">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3);">
                <div>
                  <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-gray-900);">
                    Complaint #${complaint.id}
                  </h2>
                  <p style="font-size: var(--font-size-sm); color: var(--color-gray-500); margin-top: 2px;">
                    Category: <strong style="color: var(--color-gray-800);">${complaint.category}</strong>
                  </p>
                </div>
                <div>
                  <span class="badge badge--${priorityClass(complaint.priority)}">Priority: ${complaint.priority}</span>
                </div>
              </div>

              <!-- Resident Information Box -->
              <div style="background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-6);">
                <h4 style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-gray-500); margin-bottom: var(--space-2);">Resident Contact Details</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3);">
                  <div>
                    <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); display: block;">Resident Name</span>
                    <strong style="font-size: var(--font-size-sm); color: var(--color-gray-800);">${complaint.resident_name || '—'}</strong>
                  </div>
                  <div>
                    <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); display: block;">Flat / Unit</span>
                    <strong style="font-size: var(--font-size-sm); color: var(--color-gray-800);">${complaint.resident_flat || '—'}</strong>
                  </div>
                  <div>
                    <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); display: block;">Registered Email</span>
                    <strong style="font-size: var(--font-size-sm); color: var(--color-gray-800);">${complaint.resident_email || '—'}</strong>
                  </div>
                </div>
              </div>

              <!-- Metadata Grid -->
              <div class="complaint-info">
                <div class="complaint-info__item">
                  <span class="complaint-info__label">Submission Date</span>
                  <span class="complaint-info__value">${formatDate(complaint.created_at, 'datetime')}</span>
                </div>
                <div class="complaint-info__item">
                  <span class="complaint-info__label">Last Status Update</span>
                  <span class="complaint-info__value">${formatDate(complaint.updated_at, 'datetime')}</span>
                </div>
                <div class="complaint-info__item">
                  <span class="complaint-info__label">Duration Open</span>
                  <span class="complaint-info__value" style="${complaint.is_overdue ? 'color: var(--color-red); font-weight: 700;' : ''}">
                    ${complaint.days_open} days ${complaint.is_overdue ? '(Breached SLA Threshold)' : ''}
                  </span>
                </div>
                <div class="complaint-info__item">
                  <span class="complaint-info__label">Current Lifecycle</span>
                  <span class="complaint-info__value">
                    <span class="badge badge--${statusClass(complaint.status)}">${complaint.status}</span>
                  </span>
                </div>
                <div class="complaint-info__item complaint-info__description">
                  <span class="complaint-info__label">Issue Description</span>
                  <span class="complaint-info__value" style="line-height: var(--line-height-relaxed); margin-top: var(--space-1);">${complaint.description}</span>
                </div>
              </div>

              ${complaint.photo_url ? `
                <div class="complaint-photo" style="margin-top: var(--space-5);">
                  <span class="complaint-info__label" style="display: block; margin-bottom: var(--space-2);">Attached Photo Evidence (Click to enlarge)</span>
                  <img src="${complaint.photo_url}" id="complaint-attached-photo" alt="Complaint attachment photo" style="cursor: zoom-in; max-height: 220px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);" />
                </div>
              ` : ''}
            </div>

            <!-- Admin Action Controls Form -->
            <div class="card card--padded admin-controls">
              <h3 class="admin-controls__title" style="display: flex; align-items: center; gap: var(--space-2);">
                ${icon('wrench', 18)} Update Priority & Status Lifecycle
              </h3>

              ${complaint.status === 'Resolved' ? `
                <div style="background: var(--color-green-light); border: 1px solid var(--color-green-border); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-3);">
                  <div style="color: var(--color-green);">${icon('checkCircle', 24)}</div>
                  <div>
                    <strong style="color: var(--color-green); font-size: var(--font-size-sm); display: block;">Issue Marked as Resolved (Closed)</strong>
                    <span style="font-size: var(--font-size-xs); color: var(--color-gray-600);">This complaint is officially resolved and closed. Status updates will record additional audit notes and notify the resident.</span>
                  </div>
                </div>
              ` : ''}

              <form id="admin-manage-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="update-priority">Assign Priority</label>
                    <select class="form-input form-select" id="update-priority">
                      <option value="Low" ${complaint.priority === 'Low' ? 'selected' : ''}>Low (Standard 5-day SLA)</option>
                      <option value="Medium" ${complaint.priority === 'Medium' ? 'selected' : ''}>Medium (3-day SLA)</option>
                      <option value="High" ${complaint.priority === 'High' ? 'selected' : ''}>High (Urgent 24h SLA)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="update-status">Update Status</label>
                    <select class="form-input form-select" id="update-status">
                      <option value="Open" ${complaint.status === 'Open' ? 'selected' : ''}>Open (Pending Assignment)</option>
                      <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress (Team Assigned)</option>
                      <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved (Closed)</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="update-note">Audit Remarks / Status Note</label>
                  <textarea class="form-input form-textarea" id="update-note" rows="3" placeholder="Describe actions taken, vendor assignment, technician notes, or resolution confirmation..."></textarea>
                  <p class="form-hint" style="color: var(--color-primary); font-weight: 500;">
                    💡 This remark will be added to the audit history timeline and emailed directly to ${complaint.resident_email || 'the resident'}.
                  </p>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4);">
                  <button type="submit" class="btn btn--primary" id="save-update-btn">
                    ${icon('check', 16)} Save & Notify Resident
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Right Column: Status History Audit Timeline -->
          <div>
            <div class="card card--padded" style="position: sticky; top: calc(var(--header-height) + var(--space-6));">
              <h3 style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-gray-800); margin-bottom: var(--space-5); display: flex; align-items: center; gap: var(--space-2);">
                ${icon('clock', 18)} Status History & Audit Trail
              </h3>

              ${history.length > 0 ? `
                <div class="timeline">
                  ${history.map(h => `
                    <div class="timeline__item">
                      <div class="timeline__dot timeline__dot--${statusClass(h.status)}"></div>
                      <div class="timeline__status">${h.status}</div>
                      <div class="timeline__meta">${formatDate(h.created_at, 'datetime')}</div>
                      <div class="timeline__actor" style="font-weight: 500; color: var(--color-gray-700);">Updated by: ${h.actor_name}</div>
                      ${h.note ? `<div class="timeline__note">"${h.note}"</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="text-muted text-sm">No history records logged yet.</p>
              `}
            </div>
          </div>
        </div>
      `;

      // Photo Lightbox modal binding
      document.getElementById('complaint-attached-photo')?.addEventListener('click', () => {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-modal';
        lightbox.innerHTML = `<img src="${complaint.photo_url}" alt="Zoomed Complaint Photo" />`;
        lightbox.addEventListener('click', () => lightbox.remove());
        document.body.appendChild(lightbox);
      });

      document.getElementById('admin-back-btn')?.addEventListener('click', () => navigate('/admin/complaints'));

      // Manage Form Submission
      const form = document.getElementById('admin-manage-form');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPriority = document.getElementById('update-priority').value;
        const newStatus = document.getElementById('update-status').value;
        const note = document.getElementById('update-note').value.trim();
        const submitBtn = document.getElementById('save-update-btn');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving & Notifying…';

        try {
          // If priority changed
          if (newPriority !== complaint.priority) {
            await apiUpdateComplaintPriority(complaint.id, newPriority);
            complaint.priority = newPriority;
          }

          // Update status and append audit note
          const updated = await apiUpdateComplaintStatus(complaint.id, {
            status: newStatus,
            note: note || (newStatus !== complaint.status ? `Status updated to ${newStatus}` : 'Complaint details updated by administrator'),
            actor_id: adminUser?.id || 'USR-ADMIN',
            actor_name: adminUser?.name || 'Society Admin'
          });

          complaint.status = updated.status;
          complaint.updated_at = updated.updated_at;

          // Reload history
          const updatedHistory = await apiGetComplaintHistory(complaint.id);
          history.length = 0;
          history.push(...updatedHistory);

          showToast(`Complaint #${complaint.id} updated to "${newStatus}". Email notification sent.`, 'success');
          renderView();
        } catch (err) {
          showToast(err.message || 'Failed to update complaint', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save & Notify Resident';
        }
      });
    }

    renderView();

  } catch (err) {
    content.innerHTML = `
      <div style="margin-bottom: var(--space-4);">
        <button class="btn btn--ghost" id="admin-back-btn">${icon('arrowLeft', 16)} Back to Complaints</button>
      </div>
      <div class="card card--padded">
        <div class="inline-error">${icon('alertCircle', 16)} Unable to load complaint details: ${err.message}</div>
        <a href="#/admin/complaints" class="btn btn--primary mt-4">Back to Complaints List</a>
      </div>
    `;
    document.getElementById('admin-back-btn')?.addEventListener('click', () => navigate('/admin/complaints'));
  }
}
