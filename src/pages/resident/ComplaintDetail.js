// ===== Resident Complaint Detail View Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetComplaint, apiGetComplaintHistory } from '../../api.js';
import { formatDate, statusClass, priorityClass } from '../../utils.js';
import { navigate } from '../../router.js';

export async function renderComplaintDetail(params) {
  const content = mountAppShell('Complaint Details');
  const complaintId = params.id;
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="back-btn">${icon('arrowLeft', 16)} Back to My Complaints</button>
    </div>
    <div class="detail-layout">
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--card"></div></div>
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--text mb-4"></div></div>
    </div>
  `;
  
  document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
  
  try {
    const [complaint, history] = await Promise.all([
      apiGetComplaint(complaintId),
      apiGetComplaintHistory(complaintId)
    ]);
    
    content.innerHTML = `
      <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
        <button class="btn btn--ghost" id="back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to My Complaints</button>
        <div style="display: flex; gap: var(--space-2); align-items: center;">
          <span class="badge badge--${statusClass(complaint.status)}">${complaint.status}</span>
          ${complaint.is_overdue ? '<span class="badge badge--overdue">SLA Overdue</span>' : ''}
        </div>
      </div>
      
      <div class="detail-layout">
        <!-- Left: Complaint Info & Attached Photo -->
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
          
          <div class="complaint-info">
            <div class="complaint-info__item">
              <span class="complaint-info__label">Category</span>
              <span class="complaint-info__value" style="font-weight: 500;">${complaint.category}</span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Assigned Priority</span>
              <span class="complaint-info__value"><span class="badge badge--${priorityClass(complaint.priority)}">${complaint.priority}</span></span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Date Submitted</span>
              <span class="complaint-info__value">${formatDate(complaint.created_at, 'datetime')}</span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Last Status Update</span>
              <span class="complaint-info__value">${formatDate(complaint.updated_at, 'datetime')}</span>
            </div>
            ${complaint.days_open !== undefined ? `
              <div class="complaint-info__item">
                <span class="complaint-info__label">Days Open</span>
                <span class="complaint-info__value" style="${complaint.is_overdue ? 'color: var(--color-red); font-weight: 600;' : ''}">
                  ${complaint.days_open} days ${complaint.is_overdue ? '(Overdue)' : ''}
                </span>
              </div>
            ` : ''}
            <div class="complaint-info__item complaint-info__description">
              <span class="complaint-info__label">Issue Description</span>
              <span class="complaint-info__value" style="line-height: var(--line-height-relaxed); margin-top: var(--space-1);">${complaint.description}</span>
            </div>
          </div>
          
          ${complaint.photo_url ? `
            <div class="complaint-photo" style="margin-top: var(--space-5);">
              <span class="complaint-info__label" style="display: block; margin-bottom: var(--space-2);">Uploaded Photo (Click to zoom)</span>
              <img src="${complaint.photo_url}" id="resident-photo-view" alt="Complaint photo" style="cursor: zoom-in; max-height: 220px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200);" />
            </div>
          ` : ''}
        </div>
        
        <!-- Right: Status History Timeline -->
        <div class="card card--padded">
          <h3 style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-gray-800); margin-bottom: var(--space-5); display: flex; align-items: center; gap: var(--space-2);">
            ${icon('clock', 18)} Status History & Timeline
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
            <p class="text-muted text-sm">No status history available.</p>
          `}
        </div>
      </div>
    `;
    
    // Lightbox image zoom
    document.getElementById('resident-photo-view')?.addEventListener('click', () => {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `<img src="${complaint.photo_url}" alt="Zoomed Complaint Attachment" />`;
      lightbox.addEventListener('click', () => lightbox.remove());
      document.body.appendChild(lightbox);
    });

    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
    
  } catch (err) {
    content.innerHTML = `
      <div style="margin-bottom: var(--space-4);">
        <button class="btn btn--ghost" id="back-btn">${icon('arrowLeft', 16)} Back to My Complaints</button>
      </div>
      <div class="card card--padded">
        <div class="inline-error">${icon('alertCircle', 16)} Unable to load complaint details: ${err.message}</div>
        <a href="#/complaints" class="btn btn--primary mt-4">Back to My Complaints</a>
      </div>
    `;
    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
  }
}
