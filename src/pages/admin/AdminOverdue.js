// ===== Admin Overdue Complaints & Configuration Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetComplaints, apiGetSettings, apiUpdateSettings } from '../../api.js';
import { formatDate, truncate, statusClass, priorityClass } from '../../utils.js';
import { showToast } from '../../components/ui/Toast.js';
import { navigate } from '../../router.js';

export async function renderAdminOverdue() {
  const content = mountAppShell('Overdue Complaints');

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-overdue-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Overdue Complaints Management</h2>
      <p class="page-header__subtitle">Review unresolved complaints exceeding the configured resolution threshold.</p>
    </div>

    <!-- Threshold Configuration Bar -->
    <div class="card card--padded overdue-config" id="overdue-config-card">
      <div class="skeleton skeleton--row" style="height: 36px;"></div>
    </div>

    <!-- Overdue Complaints Table -->
    <div id="overdue-list-container">
      <div class="card card--padded">
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--row mt-2"></div>
      </div>
    </div>
  `;

  try {
    document.getElementById('admin-overdue-back-btn')?.addEventListener('click', () => navigate('/admin/dashboard'));
    const [settings, overdueComplaints] = await Promise.all([
      apiGetSettings(),
      apiGetComplaints({ overdue: true })
    ]);

    // Render Overdue threshold form
    const configCard = document.getElementById('overdue-config-card');
    if (configCard) {
      configCard.innerHTML = `
        <form id="overdue-threshold-form" style="display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; width: 100%;">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="color: var(--color-red);">${icon('alertTriangle', 20)}</div>
            <label class="overdue-config__label" for="threshold-days">Overdue Threshold:</label>
            <input type="number" id="threshold-days" class="form-input overdue-config__input" min="1" max="90" value="${settings.overdue_threshold_days || 5}" required />
            <span class="overdue-config__unit">days</span>
          </div>
          <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); flex: 1;">
            Complaints open longer than this duration without resolution will automatically be flagged as overdue.
          </span>
          <button type="submit" class="btn btn--secondary btn--sm" id="save-threshold-btn">
            ${icon('check', 14)} Save Configuration
          </button>
        </form>
      `;

      document.getElementById('overdue-threshold-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const days = parseInt(document.getElementById('threshold-days').value, 10);
        if (isNaN(days) || days < 1) {
          showToast('Please enter a valid threshold in days.', 'error');
          return;
        }

        const btn = document.getElementById('save-threshold-btn');
        btn.disabled = true;
        btn.textContent = 'Saving…';

        try {
          await apiUpdateSettings({ overdue_threshold_days: days });
          showToast(`Overdue threshold updated to ${days} days.`, 'success');
          // Reload page to re-calculate overdue flags
          renderAdminOverdue();
        } catch (err) {
          showToast('Failed to update settings.', 'error');
          btn.disabled = false;
          btn.textContent = 'Save Configuration';
        }
      });
    }

    // Render Overdue List
    const listContainer = document.getElementById('overdue-list-container');
    if (listContainer) {
      if (overdueComplaints.length === 0) {
        listContainer.innerHTML = `
          <div class="card card--padded">
            <div class="empty-state">
              <div class="empty-state__icon" style="color: var(--color-green);">${icon('checkCircle', 48)}</div>
              <div class="empty-state__title">No Overdue Complaints</div>
              <div class="empty-state__text">
                Great job! All unresolved complaints are currently within the ${settings.overdue_threshold_days || 5}-day resolution threshold.
              </div>
              <a href="#/admin/complaints" class="btn btn--secondary mt-2">View All Complaints</a>
            </div>
          </div>
        `;
      } else {
        listContainer.innerHTML = `
          <div class="data-table-wrapper" id="overdue-table-wrapper">
            <table class="data-table" id="overdue-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Resident</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Days Open</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${overdueComplaints.map(c => `
                  <tr style="background: var(--color-red-light);">
                    <td><span class="complaint-id" data-admin-id="${c.id}">#${c.id}</span></td>
                    <td style="white-space: nowrap;">
                      <div>${c.resident_name || '—'}</div>
                      <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">${c.resident_flat || ''}</div>
                    </td>
                    <td>${c.category}</td>
                    <td class="description-cell">${truncate(c.description, 45)}</td>
                    <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
                    <td style="white-space: nowrap;">${formatDate(c.created_at)}</td>
                    <td>
                      <span class="badge badge--overdue" style="font-weight: var(--font-weight-bold);">
                        ${c.days_open} days (${c.days_open - (settings.overdue_threshold_days || 5)}d past SLA)
                      </span>
                    </td>
                    <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
                    <td>
                      <button class="btn btn--primary btn--sm" data-admin-manage="${c.id}">
                        ${icon('wrench', 14)} Manage
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Mobile Cards -->
            <div class="complaint-cards-mobile" id="overdue-cards-mobile">
              ${overdueComplaints.map(c => `
                <div class="complaint-card" data-admin-card="${c.id}" style="border-left: 3px solid var(--color-red);">
                  <div class="complaint-card__header">
                    <span class="complaint-card__id">#${c.id}</span>
                    <span class="badge badge--overdue">${c.days_open} days open</span>
                  </div>
                  <div style="font-size: var(--font-size-xs); color: var(--color-gray-500); margin-bottom: var(--space-1);">${c.resident_name || '—'} • ${c.resident_flat || ''}</div>
                  <div class="complaint-card__category">${c.category}</div>
                  <div class="complaint-card__description">${truncate(c.description, 80)}</div>
                  <div class="complaint-card__meta">
                    <span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span>
                    <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
                    <span class="complaint-card__date">${formatDate(c.created_at)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        // Bind clicks
        listContainer.querySelectorAll('[data-admin-id]').forEach(el => {
          el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminId}`));
        });
        listContainer.querySelectorAll('[data-admin-manage]').forEach(el => {
          el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminManage}`));
        });
        listContainer.querySelectorAll('[data-admin-card]').forEach(el => {
          el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminCard}`));
        });

        // Responsive handling
        function handleOverdueResponsive() {
          const table = document.getElementById('overdue-table');
          const cards = document.getElementById('overdue-cards-mobile');
          if (!table || !cards) return;
          if (window.innerWidth <= 768) {
            table.style.display = 'none';
            cards.style.display = 'block';
          } else {
            table.style.display = '';
            cards.style.display = 'none';
          }
        }

        handleOverdueResponsive();
        window.addEventListener('resize', handleOverdueResponsive);
      }
    }
  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Error loading overdue complaints: ${err.message}</div>`;
  }
}
