// ===== Distinctive Admin Command Center Dashboard Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetDashboardStats, apiGetComplaints } from '../../api.js';
import { formatDate, statusClass, priorityClass } from '../../utils.js';
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
  const content = mountAppShell('Admin Dashboard');
  
  content.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">Operations Command Center</h2>
      <p class="page-header__subtitle">Real-time society maintenance metrics, SLA compliance, and facility health.</p>
    </div>
    <div class="stat-grid stat-grid--5">
      ${Array(5).fill('<div class="skeleton skeleton--card"></div>').join('')}
    </div>
  `;
  
  try {
    const [stats, overdueComplaints] = await Promise.all([
      apiGetDashboardStats(),
      apiGetComplaints({ overdue: true })
    ]);
    
    const recentOverdue = overdueComplaints.slice(0, 5);
    
    content.innerHTML = `
      <!-- Admin Header Bar -->
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--color-green-light); border: 1px solid var(--color-green-border); color: var(--color-green); padding: 3px 10px; border-radius: 9999px; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: var(--space-2);">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-green);"></span>
            Facility Operations Active
          </div>
          <h2 class="page-header__title">Operations Command Center</h2>
          <p class="page-header__subtitle">Monitor maintenance requests, audit resolution rates, and handle overdue SLAs.</p>
        </div>
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <a href="#/admin/notices" class="btn btn--secondary">
            ${icon('megaphone', 16)} Broadcast Notice
          </a>
          <a href="#/admin/complaints" class="btn btn--primary">
            ${icon('clipboardList', 16)} Manage Tickets
          </a>
        </div>
      </div>
      
      <!-- KPI Metric Cards Grid -->
      <div class="stat-grid stat-grid--5">
        <div class="stat-card stat-card--purple">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.total}</div>
            <div class="stat-card__label">Total Recorded</div>
          </div>
          <div class="stat-card__icon stat-card__icon--gray">${icon('clipboardList', 22)}</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-blue);">${stats.open}</div>
            <div class="stat-card__label">Open (Pending)</div>
          </div>
          <div class="stat-card__icon stat-card__icon--blue">${icon('inbox', 22)}</div>
        </div>
        <div class="stat-card stat-card--amber">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-amber);">${stats.inProgress}</div>
            <div class="stat-card__label">In Progress</div>
          </div>
          <div class="stat-card__icon stat-card__icon--amber">${icon('clock', 22)}</div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-green);">${stats.resolved}</div>
            <div class="stat-card__label">Resolved (Closed)</div>
          </div>
          <div class="stat-card__icon stat-card__icon--green">${icon('checkCircle', 22)}</div>
        </div>
        <div class="stat-card stat-card--red" ${stats.overdue > 0 ? 'style="border-color: var(--color-red-border); background: var(--color-red-light);"' : ''}>
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-red);">${stats.overdue}</div>
            <div class="stat-card__label">SLA Overdue</div>
          </div>
          <div class="stat-card__icon stat-card__icon--red">${icon('alertTriangle', 22)}</div>
        </div>
      </div>
      
      <!-- Analytics Charts Section -->
      <div class="chart-grid">
        <div class="chart-card">
          <h3 class="chart-card__title" style="display: flex; align-items: center; justify-content: space-between;">
            <span>Tickets by Status</span>
            <span style="font-size: var(--font-size-xs); font-weight: 500; color: var(--color-gray-400);">Current Cycle</span>
          </h3>
          <div class="chart-card__body">
            <canvas id="status-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-card__title" style="display: flex; align-items: center; justify-content: space-between;">
            <span>Tickets by Category</span>
            <span style="font-size: var(--font-size-xs); font-weight: 500; color: var(--color-gray-400);">Department Breakdown</span>
          </h3>
          <div class="chart-card__body">
            <canvas id="category-chart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Priority Overdue SLA Queue -->
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 class="section__title" style="margin-bottom: 0;">
            ${icon('alertTriangle', 20)} Urgent & Overdue Tickets (${overdueComplaints.length})
          </h3>
          <a href="#/admin/overdue" class="link-btn" style="font-weight: 600;">Manage SLA Configuration →</a>
        </div>
        ${recentOverdue.length > 0 ? `
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Resident & Unit</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Submitted</th>
                  <th>SLA Breach Duration</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentOverdue.map(c => `
                  <tr style="background: var(--color-red-light);">
                    <td><span class="complaint-id" data-id="${c.id}">#${c.id}</span></td>
                    <td>
                      <strong style="color: var(--color-gray-900);">${c.resident_name || '—'}</strong>
                      <span style="font-size: var(--font-size-xs); color: var(--color-gray-500); display: block;">Flat ${c.resident_flat || ''}</span>
                    </td>
                    <td>${c.category}</td>
                    <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
                    <td style="white-space:nowrap; font-size: var(--font-size-xs); color: var(--color-gray-500);">${formatDate(c.created_at)}</td>
                    <td>
                      <span class="badge badge--overdue" style="font-weight: 700;">${c.days_open} days open</span>
                    </td>
                    <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn--primary btn--sm" data-admin-view="${c.id}">
                        ${icon('wrench', 14)} Resolve Now
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card card--padded">
            <div class="empty-state" style="padding: var(--space-8);">
              <div class="empty-state__icon" style="color: var(--color-green);">${icon('checkCircle', 48)}</div>
              <div class="empty-state__title">Zero SLA Breaches</div>
              <div class="empty-state__text">All open maintenance tickets are currently operating within the configured SLA threshold period.</div>
            </div>
          </div>
        `}
      </div>
    `;
    
    // Render Chart.js charts
    await renderCharts(stats);
    
    // Click handlers
    content.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.id}`));
    });
    content.querySelectorAll('[data-admin-view]').forEach(el => {
      el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminView}`));
    });

    return () => {
      destroyCharts();
    };
    
  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Unable to load admin overview: ${err.message}</div>`;
  }
}

async function renderCharts(stats) {
  const { Chart, DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } = await import('chart.js');
  Chart.register(DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
  
  // Doughnut Status Distribution Chart
  const statusCtx = document.getElementById('status-chart');
  if (statusCtx) {
    statusChart = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [stats.open, stats.inProgress, stats.resolved],
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
          borderWidth: 0,
          spacing: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Outfit, sans-serif', size: 12 }
            }
          }
        }
      }
    });
  }
  
  // Bar Category Breakdown Chart
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
          backgroundColor: '#6366f1',
          borderRadius: 6,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Outfit, sans-serif', size: 11 } }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'Outfit, sans-serif', size: 11 } },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }
}
