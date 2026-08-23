// ===== Admin Complaints Management Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { apiGetComplaints } from '../../api.js';
import { formatDate, truncate, statusClass, priorityClass, debounce } from '../../utils.js';
import { navigate } from '../../router.js';

const PAGE_SIZE = 10;
const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Water Supply', 'Common Area', 'Other'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

let currentPage = 1;
let currentFilters = { status: 'All', category: 'All', priority: 'All', search: '', overdue: false };
let allComplaints = [];

function renderFilters() {
  return `
    <div class="filter-bar">
      <div class="filter-bar__search">
        ${icon('search', 16)}
        <input class="form-input" type="text" id="filter-search" placeholder="Search complaints, residents…" value="${currentFilters.search}" />
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-category">
          ${CATEGORIES.map(c => `<option value="${c}" ${currentFilters.category === c ? 'selected' : ''}>${c === 'All' ? 'All Categories' : c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-status">
          ${STATUSES.map(s => `<option value="${s}" ${currentFilters.status === s ? 'selected' : ''}>${s === 'All' ? 'All Status' : s}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-priority">
          ${PRIORITIES.map(p => `<option value="${p}" ${currentFilters.priority === p ? 'selected' : ''}>${p === 'All' ? 'All Priority' : p}</option>`).join('')}
        </select>
      </div>
      <label class="form-checkbox" style="white-space: nowrap;">
        <input type="checkbox" id="filter-overdue" ${currentFilters.overdue ? 'checked' : ''} />
        <span>Overdue only</span>
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
          <div class="empty-state__title">No complaints found</div>
          <div class="empty-state__text">No complaints match your current filters. Try adjusting your search criteria.</div>
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
            <th>Resident</th>
            <th>Category</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Overdue</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${pageComplaints.map(c => `
            <tr ${c.is_overdue ? 'style="background: var(--color-red-light);"' : ''}>
              <td><span class="complaint-id" data-admin-id="${c.id}">#${c.id}</span></td>
              <td style="white-space: nowrap;">
                <div>${c.resident_name || '—'}</div>
                <div style="font-size: var(--font-size-xs); color: var(--color-gray-400);">${c.resident_flat || ''}</div>
              </td>
              <td>${c.category}</td>
              <td class="description-cell">${truncate(c.description, 40)}</td>
              <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
              <td><span class="badge badge--${statusClass(c.status)}">${c.status}</span></td>
              <td style="white-space:nowrap;">${formatDate(c.created_at)}</td>
              <td style="white-space:nowrap;">${formatDate(c.updated_at)}</td>
              <td>
                ${c.is_overdue 
                  ? `<span class="overdue-cell">${c.days_open}d</span>` 
                  : '<span style="color: var(--color-gray-400);">—</span>'}
              </td>
              <td><button class="btn btn--ghost btn--sm" data-admin-manage="${c.id}">${icon('eye', 14)} Manage</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- Mobile Cards -->
      <div class="complaint-cards-mobile" id="admin-cards-mobile">
        ${pageComplaints.map(c => `
          <div class="complaint-card" data-admin-card="${c.id}" ${c.is_overdue ? 'style="border-left: 3px solid var(--color-red);"' : ''}>
            <div class="complaint-card__header">
              <span class="complaint-card__id">#${c.id}</span>
              <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--color-gray-500); margin-bottom: var(--space-1);">${c.resident_name || '—'} • ${c.resident_flat || ''}</div>
            <div class="complaint-card__category">${c.category}</div>
            <div class="complaint-card__description">${truncate(c.description, 80)}</div>
            <div class="complaint-card__meta">
              <span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span>
              ${c.is_overdue ? `<span class="badge badge--overdue">${c.days_open}d overdue</span>` : ''}
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
  
  // Show limited page numbers
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
        <button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
          ${icon('chevronLeft', 16)}
        </button>
        ${pages.map(p => p === '...' 
          ? '<span style="padding: 0 4px; color: var(--color-gray-400);">…</span>' 
          : `<button class="pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
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
    listEl.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Unable to load complaints. Please try again.</div>`;
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
      const page = parseInt(el.dataset.page);
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
  currentFilters = { status: 'All', category: 'All', priority: 'All', search: '', overdue: false };
  
  const content = mountAppShell('Complaints');
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="admin-complaints-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Manage Complaints</h2>
      <p class="page-header__subtitle">Review, prioritize, and update maintenance complaints.</p>
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
