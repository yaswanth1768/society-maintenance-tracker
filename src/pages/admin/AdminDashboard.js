// ===== Admin Dashboard =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetDashboardStats, apiGetComplaints } from '../../api.js';
import { formatDate, truncate, statusClass, priorityClass } from '../../utils.js';
import { navigate } from '../../router.js';
import { showModal } from '../../components/ui/Modal.js';

let statusChart = null;
let categoryChart = null;

function destroyCharts() {
  if (statusChart) { statusChart.destroy(); statusChart = null; }
  if (categoryChart) { categoryChart.destroy(); categoryChart = null; }
}

export async function renderAdminDashboard() {
  destroyCharts();
  const content = mountAppShell('Dashboard');
  
  content.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">Maintenance Overview</h2>
      <p class="page-header__subtitle">Monitor complaints, response progress, and overdue issues.</p>
    </div>
    <div class="stat-grid stat-grid--5">
      ${Array(5).fill('<div class="skeleton skeleton--card"></div>').join('')}
    </div>
    <div class="chart-grid">
      <div class="skeleton skeleton--card" style="height: 320px;"></div>
      <div class="skeleton skeleton--card" style="height: 320px;"></div>
    </div>
  `;
  
  try {
    const [stats, overdueComplaints] = await Promise.all([
      apiGetDashboardStats(),
      apiGetComplaints({ overdue: true })
    ]);
    
    const recentOverdue = overdueComplaints.slice(0, 5);
    
    content.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
        <div>
          <h2 class="page-header__title">Maintenance Overview</h2>
          <p class="page-header__subtitle">Monitor complaints, response progress, and overdue issues.</p>
        </div>
        <button class="btn btn--secondary" id="admin-view-rules-btn" style="display: flex; align-items: center; gap: var(--space-2);">
          ${icon('bookOpen', 16)}
          <span>Society Bylaws & Guidelines</span>
        </button>
      </div>
      
      <!-- Stat Cards -->
      <div class="stat-grid stat-grid--5">
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
        <div class="stat-card" ${stats.overdue > 0 ? 'style="border-color: var(--color-red); border-width: 1px;"' : ''}>
          <div class="stat-card__content">
            <div class="stat-card__value" ${stats.overdue > 0 ? 'style="color: var(--color-red);"' : ''}>${stats.overdue}</div>
            <div class="stat-card__label">Overdue</div>
          </div>
          <div class="stat-card__icon stat-card__icon--red">${icon('alertTriangle', 20)}</div>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="chart-grid">
        <div class="chart-card">
          <h3 class="chart-card__title">Complaints by Status</h3>
          <div class="chart-card__body">
            <canvas id="status-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-card__title">Complaints by Category</h3>
          <div class="chart-card__body">
            <canvas id="category-chart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Overdue Complaints -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">Overdue Complaints</h3>
          ${recentOverdue.length > 0 ? '<a href="#/admin/overdue" class="link-btn">View all</a>' : ''}
        </div>
        ${recentOverdue.length > 0 ? `
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Resident</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Days Open</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentOverdue.map(c => `
                  <tr>
                    <td><span class="complaint-id" data-id="${c.id}">#${c.id}</span></td>
                    <td>${c.resident_name || '—'}</td>
                    <td>${c.category}</td>
                    <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
                    <td style="white-space:nowrap;">${formatDate(c.created_at)}</td>
                    <td class="overdue-cell">${c.days_open} days</td>
                    <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
                    <td><button class="btn btn--ghost btn--sm" data-admin-view="${c.id}">${icon('eye', 14)} Manage</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card card--padded">
            <div class="empty-state" style="padding: var(--space-6);">
              <div class="empty-state__icon" style="color: var(--color-green);">${icon('checkCircle', 48)}</div>
              <div class="empty-state__title">No overdue complaints</div>
              <div class="empty-state__text">All complaints are being addressed within the threshold period.</div>
            </div>
          </div>
        `}
      </div>
    `;
    
    // Render charts
    renderCharts(stats);
    
    // Click handlers
    content.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.id}`));
    });
    content.querySelectorAll('[data-admin-view]').forEach(el => {
      el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminView}`));
    });
    
    document.getElementById('admin-view-rules-btn')?.addEventListener('click', () => {
      showModal({
        title: 'Society Bylaws & Operational Rules',
        body: `
          <div style="max-height: 60vh; overflow-y: auto;">
            <p style="font-size: var(--font-size-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
              Official society operational guidelines enforced across all towers and resident units:
            </p>
            <ul style="list-style: disc; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--color-gray-700); display: flex; flex-direction: column; gap: var(--space-2);">
              <li><strong>Quiet Hours:</strong> 10:00 PM – 6:00 AM daily across all blocks.</li>
              <li><strong>SLA Target:</strong> High priority issues within 24h, Medium within 3d, Low within 5d.</li>
              <li><strong>Maintenance Dues:</strong> Due on 5th; late penalty ₹500 auto-charged on 15th.</li>
              <li><strong>Vendor Gate Entry:</strong> Service personnel require OTP security pass verification.</li>
              <li><strong>Renovations:</strong> Requires 7-day prior approval from managing committee.</li>
            </ul>
          </div>
        `,
        footer: '<button class="btn btn--primary" id="admin-rules-ok-btn">Done</button>'
      });
      document.getElementById('admin-rules-ok-btn')?.addEventListener('click', () => {
        document.querySelector('.modal-overlay')?.remove();
      });
    });

    return () => {
      destroyCharts();
    };
    
  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Unable to load dashboard data. Please try again.</div>`;
  }
}

async function renderCharts(stats) {
  const { Chart, DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } = await import('chart.js');
  Chart.register(DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
  
  // Status Doughnut Chart
  const statusCtx = document.getElementById('status-chart');
  if (statusCtx) {
    statusChart = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [stats.open, stats.inProgress, stats.resolved],
          backgroundColor: ['#3b82f6', '#d97706', '#16a34a'],
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Inter', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 6
          }
        }
      }
    });
  }
  
  // Category Bar Chart
  const catCtx = document.getElementById('category-chart');
  if (catCtx) {
    const cats = stats.categories || {};
    const categoryLabels = Object.keys(cats);
    const categoryData = Object.values(cats);
    
    categoryChart = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: categoryLabels,
        datasets: [{
          label: 'Complaints',
          data: categoryData,
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 } }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { family: 'Inter', size: 11 }
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
  }
}
