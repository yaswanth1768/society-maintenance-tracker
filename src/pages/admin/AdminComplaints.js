// ===== Admin Complaints Management Page =====
// Filter by Category, Status, Date, Priority, Overdue, and Search

import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetComplaints } from '../../api.js';
import { formatDate, truncate, statusClass, priorityClass, debounce } from '../../utils.js';
import { navigate } from '../../router.js';

const PAGE_SIZE = 10;
const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Water Supply', 'Common Area', 'Other'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];
const DATE_RANGES = [
  { label: 'All Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' }
];

let currentPage = 1;
let currentFilters = { status: 'All', category: 'All', priority: 'All', date_range: 'all', search: '', overdue: false };
let allComplaints = [];

function renderFilters() {
  return `
    <div class="filter-bar">
      <div class="filter-bar__search">
        ${icon('search', 16)}
        <input class="form-input" type="text" id="filter-search" placeholder="Search ID, category, resident, flat…" value="${currentFilters.search}" />
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-category" title="Filter by Category">
          ${CATEGORIES.map(c => `<option value="${c}" ${currentFilters.category === c ? 'selected' : ''}>${c === 'All' ? 'All Categories' : c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-status" title="Filter by Status">
          ${STATUSES.map(s => `<option value="${s}" ${currentFilters.status === s ? 'selected' : ''}>${s === 'All' ? 'All Statuses' : s}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-date" title="Filter by Date">
          ${DATE_RANGES.map(d => `<option value="${d.value}" ${currentFilters.date_range === d.value ? 'selected' : ''}>${d.label}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-priority" title="Filter by Priority">
          ${PRIORITIES.map(p => `<option value="${p}" ${currentFilters.priority === p ? 'selected' : ''}>${p === 'All' ? 'All Priorities' : p}</option>`).join('')}
        </select>
      </div>
      <label class="form-checkbox" style="white-space: nowrap; margin-left: var(--space-2);">
        <input type="checkbox" id="filter-overdue" ${currentFilters.overdue ? 'checked' : ''} />
        <span style="font-weight: 500;">Overdue SLA only</span>
      </label>
    </div>
  `;
}

function renderTable(complaints) {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageComplaints = complaints.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  
  if (complaints.length === 0) {
    return `
      <div class="card card--padded">
        <div class="empty-state">
          <div class="empty-state__icon">${icon('inbox', 48)}</div>
          <div class="empty-state__title">No Complaints Found</div>
          <div class="empty-state__text">No complaints match your active filter criteria. Try resetting filters or changing your search terms.</div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="data-table-wrapper" id="admin-table-wrapper">
      <table class="data-table" id="admin-complaints-table">
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Resident & Unit</th>
            <th>Category</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Days Open / SLA</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${pageComplaints.map(c => `
            <tr ${c.is_overdue ? 'style="background: var(--color-red-light);"' : ''}>
              <td><span class="complaint-id" data-admin-id="${c.id}">#${c.id}</span></td>
              <td style="white-space: nowrap;">
                <div style="font-weight: 500; color: var(--color-gray-900);">${c.resident_name || '—'}</div>
                <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">Flat ${c.resident_flat || ''}</div>
              </td>
              <td><span style="font-weight: 500;">${c.category}</span></td>
              <td class="description-cell">${truncate(c.description, 45)}</td>
              <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
              <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
              <td style="white-space:nowrap; font-size: var(--font-size-xs); color: var(--color-gray-500);">${formatDate(c.created_at)}</td>
              <td>
                ${c.is_overdue 
                  ? `<span class="badge badge--overdue" style="font-weight: 600;">${c.days_open}d (Overdue)</span>` 
                  : `<span style="font-size: var(--font-size-xs); color: var(--color-gray-600);">${c.days_open} days</span>`}
              </td>
              <td style="text-align: right;">
                <button class="btn btn--primary btn--sm" data-admin-manage="${c.id}">
                  ${icon('wrench', 14)} Manage
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- Mobile Responsive Cards -->
      <div class="complaint-cards-mobile" id="admin-cards-mobile">
        ${pageComplaints.map(c => `
          <div class="complaint-card" data-admin-card="${c.id}" ${c.is_overdue ? 'style="border-left: 4px solid var(--color-red);"' : ''}>
            <div class="complaint-card__header">
              <span class="complaint-card__id">#${c.id}</span>
              <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--color-gray-600); margin-bottom: var(--space-1); font-weight: 500;">
              ${c.resident_name || '—'} • Flat ${c.resident_flat || ''}
            </div>
            <div class="complaint-card__category" style="font-weight: 600; color: var(--color-gray-800);">${c.category}</div>
            <div class="complaint-card__description">${truncate(c.description, 80)}</div>
            <div class="complaint-card__meta">
              <span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span>
              ${c.is_overdue ? `<span class="badge badge--overdue">${c.days_open}d overdue</span>` : `<span style="font-size: var(--font-size-xs); color: var(--color-gray-500);">${c.days_open}d open</span>`}
              <span class="complaint-card__date">${formatDate(c.created_at)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${totalPages > 1 ? renderPagination(complaints.length, totalPages) : ''}
    </div>
  `;
}

function renderPagination(total, totalPages) {
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);
  
  let pages = [];
  const maxPages = 7;
  if (totalPages <= maxPages) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = [1];
    let startP = Math.max(2, currentPage - 1);
    let endP = Math.min(totalPages - 1, currentPage + 1);
    if (startP > 2) pages.push('...');
    for (let i = startP; i <= endP; i++) pages.push(i);
    if (endP < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }
  
  return `
    <div class="pagination">
      <span class="pagination__info">Showing ${start}–${end} of ${total} complaints</span>
      <div class="pagination__controls">
        <button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
          ${icon('chevronLeft', 16)}
        </button>
        ${pages.map(p => p === '...' 
          ? '<span style="padding: 0 4px; color: var(--color-gray-400);">…</span>' 
          : `<button class="pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
          ${icon('chevronRight', 16)}
        </button>
      </div>
    </div>
  `;
}

async function loadComplaints(content) {
  const listEl = document.getElementById('admin-complaints-list');
  if (!listEl) return;
  listEl.innerHTML = `<div class="card card--padded" style="text-align: center;"><div class="skeleton skeleton--card"></div><div class="skeleton skeleton--row mt-2"></div><div class="skeleton skeleton--row mt-1"></div></div>`;
  
  try {
    allComplaints = await apiGetComplaints(currentFilters);
    listEl.innerHTML = renderTable(allComplaints);
    bindTableEvents(content);
    handleResponsive();
  } catch (err) {
    listEl.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Unable to load complaints: ${err.message}</div>`;
  }
}

function bindTableEvents(content) {
  content.querySelectorAll('[data-admin-id]').forEach(el => {
    el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminId}`));
  });
  content.querySelectorAll('[data-admin-manage]').forEach(el => {
    el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminManage}`));
  });
  content.querySelectorAll('[data-admin-card]').forEach(el => {
    el.addEventListener('click', () => navigate(`/admin/complaints/${el.dataset.adminCard}`));
  });
  content.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      const page = parseInt(el.dataset.page, 10);
      if (!isNaN(page) && page >= 1 && page !== currentPage) {
        currentPage = page;
        const listEl = document.getElementById('admin-complaints-list');
        if (listEl) {
          listEl.innerHTML = renderTable(allComplaints);
          bindTableEvents(content);
          handleResponsive();
        }
      }
    });
  });
}

function handleResponsive() {
  const table = document.getElementById('admin-complaints-table');
  const cards = document.getElementById('admin-cards-mobile');
  if (!table || !cards) return;
  if (window.innerWidth <= 768) {
    table.style.display = 'none';
    cards.style.display = 'block';
  } else {
    table.style.display = '';
    cards.style.display = 'none';
  }
}

export async function renderAdminComplaints() {
  currentPage = 1;
  currentFilters = { status: 'All', category: 'All', priority: 'All', date_range: 'all', search: '', overdue: false };
  
  const content = mountAppShell('Manage Complaints');
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-complaints-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Manage Society Complaints</h2>
      <p class="page-header__subtitle">Audit maintenance requests, assign priority levels, and record resolution milestones.</p>
    </div>
    ${renderFilters()}
    <div id="admin-complaints-list"></div>
  `;
  
  document.getElementById('admin-complaints-back-btn')?.addEventListener('click', () => navigate('/admin/dashboard'));
  await loadComplaints(content);
  
  // Filter handlers
  const debouncedSearch = debounce(() => {
    currentFilters.search = document.getElementById('filter-search')?.value || '';
    currentPage = 1;
    loadComplaints(content);
  }, 300);
  
  document.getElementById('filter-search')?.addEventListener('input', debouncedSearch);
  document.getElementById('filter-category')?.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    currentPage = 1;
    loadComplaints(content);
  });
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    currentPage = 1;
    loadComplaints(content);
  });
  document.getElementById('filter-date')?.addEventListener('change', (e) => {
    currentFilters.date_range = e.target.value;
    currentPage = 1;
    loadComplaints(content);
  });
  document.getElementById('filter-priority')?.addEventListener('change', (e) => {
    currentFilters.priority = e.target.value;
    currentPage = 1;
    loadComplaints(content);
  });
  document.getElementById('filter-overdue')?.addEventListener('change', (e) => {
    currentFilters.overdue = e.target.checked;
    currentPage = 1;
    loadComplaints(content);
  });
  
  window.addEventListener('resize', handleResponsive);
  
  return () => {
    window.removeEventListener('resize', handleResponsive);
  };
}
