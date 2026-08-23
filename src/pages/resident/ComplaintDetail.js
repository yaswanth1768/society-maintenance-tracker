// ===== Complaint Detail Page (Resident View) =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetComplaint, apiGetComplaintHistory } from '../../api.js';
import { formatDate, statusClass, priorityClass } from '../../utils.js';
import { navigate } from '../../router.js';

export async function renderComplaintDetail(params) {
  const content = mountAppShell('Complaint Details');
  const complaintId = params.id;
  
  // Loading skeleton
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="back-btn">${icon('arrowLeft', 16)} Back to complaints</button>
    </div>
    <div class="detail-layout">
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--card"></div></div>
      <div class="card card--padded"><div class="skeleton skeleton--title mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--text mb-4"></div><div class="skeleton skeleton--text"></div></div>
    </div>
  `;
  
  document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
  
  try {
    const [complaint, history] = await Promise.all([
      apiGetComplaint(complaintId),
      apiGetComplaintHistory(complaintId)
    ]);
    
    content.innerHTML = `
      <div style="margin-bottom: var(--space-4);">
        <button class="btn btn--ghost" id="back-btn">${icon('arrowLeft', 16)} Back to complaints</button>
      </div>
      
      <div class="detail-layout">
        <!-- Left: Complaint Info -->
        <div class="card card--padded">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-gray-900);">
                #${complaint.id}
              </h2>
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <span class="badge badge--${statusClass(complaint.status)}">${complaint.status}</span>
              ${complaint.is_overdue ? '<span class="badge badge--overdue">Overdue</span>' : ''}
            </div>
          </div>
          
          <div class="complaint-info">
            <div class="complaint-info__item">
              <span class="complaint-info__label">Category</span>
              <span class="complaint-info__value">${complaint.category}</span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Priority</span>
              <span class="complaint-info__value"><span class="badge badge--${priorityClass(complaint.priority)}">${complaint.priority}</span></span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Created</span>
              <span class="complaint-info__value">${formatDate(complaint.created_at, 'datetime')}</span>
            </div>
            <div class="complaint-info__item">
              <span class="complaint-info__label">Last Updated</span>
              <span class="complaint-info__value">${formatDate(complaint.updated_at, 'datetime')}</span>
            </div>
            ${complaint.days_open !== undefined ? `
              <div class="complaint-info__item">
                <span class="complaint-info__label">Days Open</span>
                <span class="complaint-info__value" style="${complaint.is_overdue ? 'color: var(--color-red); font-weight: var(--font-weight-semibold);' : ''}">${complaint.days_open} days</span>
              </div>
            ` : ''}
            <div class="complaint-info__item complaint-info__description">
              <span class="complaint-info__label">Description</span>
              <span class="complaint-info__value" style="line-height: var(--line-height-relaxed);">${complaint.description}</span>
            </div>
          </div>
          
          ${complaint.photo_url ? `
            <div class="complaint-photo">
              <span class="complaint-info__label" style="display: block; margin-bottom: var(--space-2);">Photo</span>
              <img src="${complaint.photo_url}" alt="Complaint photo" />
            </div>
          ` : ''}
        </div>
        
        <!-- Right: Timeline -->
        <div class="card card--padded">
          <h3 style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-gray-800); margin-bottom: var(--space-5);">
            Complaint Timeline
          </h3>
          
          ${history.length > 0 ? `
            <div class="timeline">
              ${history.map(h => `
                <div class="timeline__item">
                  <div class="timeline__dot timeline__dot--${statusClass(h.status)}"></div>
                  <div class="timeline__status">${h.status}</div>
                  <div class="timeline__meta">${formatDate(h.created_at, 'datetime')}</div>
                  <div class="timeline__actor">Updated by ${h.actor_name}</div>
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
    
    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
    
  } catch (err) {
    content.innerHTML = `
      <div style="margin-bottom: var(--space-4);">
        <button class="btn btn--ghost" id="back-btn">${icon('arrowLeft', 16)} Back to complaints</button>
      </div>
      <div class="card card--padded">
        <div class="inline-error">${icon('alertCircle', 16)} Unable to load complaint details. The complaint may not exist or you may not have access.</div>
        <a href="#/complaints" class="btn btn--primary mt-4">Back to My Complaints</a>
      </div>
    `;
    document.getElementById('back-btn')?.addEventListener('click', () => navigate('/complaints'));
  }
}
