// ===== Admin Reports & Analytics Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetDashboardStats, apiGetComplaints } from '../../api.js';
import { statusClass, priorityClass } from '../../utils.js';

import { navigate } from '../../router.js';

let reportStatusChart = null;
let reportCategoryChart = null;
let reportPriorityChart = null;

function destroyReportCharts() {
  if (reportStatusChart) { reportStatusChart.destroy(); reportStatusChart = null; }
  if (reportCategoryChart) { reportCategoryChart.destroy(); reportCategoryChart = null; }
  if (reportPriorityChart) { reportPriorityChart.destroy(); reportPriorityChart = null; }
}

export async function renderAdminReports() {
  destroyReportCharts();
  const content = mountAppShell('Reports & Analytics');

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-reports-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Maintenance Analytics & Reports</h2>
      <p class="page-header__subtitle">Operational statistics, category distribution, and maintenance resolution metrics.</p>
    </div>

    <div class="stat-grid">
      ${Array(4).fill('<div class="skeleton skeleton--card"></div>').join('')}
    </div>

    <div class="chart-grid">
      <div class="skeleton skeleton--card" style="height: 320px;"></div>
      <div class="skeleton skeleton--card" style="height: 320px;"></div>
    </div>
  `;

  try {
    const [stats, allComplaints] = await Promise.all([
      apiGetDashboardStats(),
      apiGetComplaints()
    ]);

    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const avgDaysOpen = stats.total > 0 
      ? (allComplaints.reduce((acc, c) => acc + (c.days_open || 0), 0) / stats.total).toFixed(1)
      : 0;

    // Priority Counts
    const priorityCounts = {
      Low: allComplaints.filter(c => c.priority === 'Low').length,
      Medium: allComplaints.filter(c => c.priority === 'Medium').length,
      High: allComplaints.filter(c => c.priority === 'High').length
    };

    // Category Metrics Breakdown
    const categoriesMap = {};
    allComplaints.forEach(c => {
      if (!categoriesMap[c.category]) {
        categoriesMap[c.category] = { total: 0, open: 0, inProgress: 0, resolved: 0, overdue: 0 };
      }
      categoriesMap[c.category].total++;
      if (c.status === 'Open') categoriesMap[c.category].open++;
      if (c.status === 'In Progress') categoriesMap[c.category].inProgress++;
      if (c.status === 'Resolved') categoriesMap[c.category].resolved++;
      if (c.is_overdue) categoriesMap[c.category].overdue++;
    });

    content.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">Maintenance Analytics & Reports</h2>
        <p class="page-header__subtitle">Operational statistics, category distribution, and maintenance resolution metrics.</p>
      </div>

      <!-- KPI Summary Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${stats.total}</div>
            <div class="stat-card__label">Total Recorded Issues</div>
          </div>
          <div class="stat-card__icon stat-card__icon--blue">${icon('clipboardList', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value" style="color: var(--color-green);">${resolutionRate}%</div>
            <div class="stat-card__label">Resolution Rate</div>
          </div>
          <div class="stat-card__icon stat-card__icon--green">${icon('checkCircle', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value">${avgDaysOpen}d</div>
            <div class="stat-card__label">Avg. Age of Requests</div>
          </div>
          <div class="stat-card__icon stat-card__icon--amber">${icon('clock', 20)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__value" style="${stats.overdue > 0 ? 'color: var(--color-red);' : ''}">${stats.overdue}</div>
            <div class="stat-card__label">Active Overdue SLA</div>
          </div>
          <div class="stat-card__icon stat-card__icon--red">${icon('alertTriangle', 20)}</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="chart-grid">
        <div class="chart-card">
          <h3 class="chart-card__title">Status Distribution</h3>
          <div class="chart-card__body">
            <canvas id="report-status-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-card__title">Complaints by Priority Level</h3>
          <div class="chart-card__body">
            <canvas id="report-priority-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="chart-card mb-6">
        <h3 class="chart-card__title">Complaints by Department / Category</h3>
        <div class="chart-card__body" style="height: 280px;">
          <canvas id="report-category-chart"></canvas>
        </div>
      </div>

      <!-- Category Summary Table -->
      <div class="section">
        <h3 class="section__title">Category Performance Breakdown</h3>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Issues</th>
                <th>Open</th>
                <th>In Progress</th>
                <th>Resolved</th>
                <th>Overdue</th>
                <th>Resolution %</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(categoriesMap).map(([category, data]) => {
                const catRate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;
                return `
                  <tr>
                    <td style="font-weight: var(--font-weight-medium);">${category}</td>
                    <td><strong>${data.total}</strong></td>
                    <td><span class="badge badge--open">${data.open}</span></td>
                    <td><span class="badge badge--in-progress">${data.inProgress}</span></td>
                    <td><span class="badge badge--resolved">${data.resolved}</span></td>
                    <td>${data.overdue > 0 ? `<span class="badge badge--overdue">${data.overdue}</span>` : '<span style="color: var(--color-gray-400);">0</span>'}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <div style="flex: 1; height: 6px; background: var(--color-gray-200); border-radius: 3px; overflow: hidden; min-width: 60px;">
                          <div style="width: ${catRate}%; height: 100%; background: var(--color-green);"></div>
                        </div>
                        <span style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);">${catRate}%</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render Charts
    document.getElementById('admin-reports-back-btn')?.addEventListener('click', () => navigate('/admin/dashboard'));
    await initAnalyticsCharts(stats, priorityCounts);

    return () => {
      destroyReportCharts();
    };

  } catch (err) {
    content.innerHTML += `<div class="inline-error">${icon('alertCircle', 16)} Error loading analytics: ${err.message}</div>`;
  }
}

async function initAnalyticsCharts(stats, priorityCounts) {
  const { Chart, DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } = await import('chart.js');
  Chart.register(DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

  // Status Doughnut Chart
  const statusCtx = document.getElementById('report-status-chart');
  if (statusCtx) {
    reportStatusChart = new Chart(statusCtx, {
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
            labels: { font: { family: 'Inter', size: 12 }, padding: 14 }
          }
        }
      }
    });
  }

  // Priority Chart
  const priorityCtx = document.getElementById('report-priority-chart');
  if (priorityCtx) {
    reportPriorityChart = new Chart(priorityCtx, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          data: [priorityCounts.Low, priorityCounts.Medium, priorityCounts.High],
          backgroundColor: ['#94a3b8', '#d97706', '#dc2626'],
          borderRadius: 4,
          barPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // Category Bar Chart
  const catCtx = document.getElementById('report-category-chart');
  if (catCtx) {
    const cats = stats.categories || {};
    reportCategoryChart = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          label: 'Total Complaints',
          data: Object.values(cats),
          backgroundColor: '#1e3a5f',
          borderRadius: 4,
          barPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}
