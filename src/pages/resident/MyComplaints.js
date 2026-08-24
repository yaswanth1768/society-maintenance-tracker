// ===== Distinctive Resident Complaints Tracking Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiGetComplaints } from '../../api.js';
import { formatDate, truncate, statusClass, priorityClass, debounce } from '../../utils.js';
import { navigate } from '../../router.js';

const PAGE_SIZE = 8;
const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Water Supply', 'Common Area', 'Other'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];

let currentPage = 1;
let currentFilters = { status: 'All', category: 'All', search: '' };
let allComplaints = [];

function renderFilters() {
  return `
    <div class="filter-bar">
      <div class="filter-bar__search">
        ${icon('search', 16)}
        <input class="form-input" type="text" id="filter-search" placeholder="Search my tickets by ID, category, or description…" value="${currentFilters.search}" />
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-category" title="Filter Category">
          ${CATEGORIES.map(c => `<option value="${c}" ${currentFilters.category === c ? 'selected' : ''}>${c === 'All' ? 'All Categories' : c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="filter-status" title="Filter Status">
          ${STATUSES.map(s => `<option value="${s}" ${currentFilters.status === s ? 'selected' : ''}>${s === 'All' ? 'All Statuses' : s}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderTable(complaints, total) {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, complaints.length);
  const pageComplaints = complaints.slice(start, end);
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  
  if (complaints.length === 0) {
    return `
      <div class="card card--padded">
        <div class="empty-state">
          <div class="empty-state__icon">${icon('inbox', 48)}</div>
          <div class="empty-state__title">No Tickets Found</div>
          <div class="empty-state__text">
            ${currentFilters.search || currentFilters.status !== 'All' || currentFilters.category !== 'All' 
              ? 'No complaints match your active filter criteria. Try resetting the filters.' 
              : "You haven't submitted any maintenance requests yet."}
          </div>
          <a href="#/complaints/new" class="btn btn--primary">${icon('plusCircle', 16)} Raise a Request</a>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="data-table-wrapper" id="complaints-table-wrapper">
      <table class="data-table" id="complaints-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Category</th>
            <th>Issue Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Last Updated</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${pageComplaints.map(c => `
            <tr>
              <td><span class="complaint-id" data-id="${c.id}">#${c.id}</span></td>
              <td><strong style="color: var(--color-gray-900);">${c.category}</strong></td>
              <td class="description-cell">${truncate(c.description, 50)}</td>
              <td><span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span></td>
              <td>
                <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
                ${c.is_overdue ? ' <span class="badge badge--overdue">Overdue</span>' : ''}
              </td>
              <td style="white-space:nowrap; font-size: var(--font-size-xs); color: var(--color-gray-500);">${formatDate(c.created_at)}</td>
              <td style="white-space:nowrap; font-size: var(--font-size-xs); color: var(--color-gray-500);">${formatDate(c.updated_at)}</td>
              <td style="text-align: right;">
                <button class="btn btn--secondary btn--sm" data-view-id="${c.id}">${icon('eye', 14)} Track Timeline</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- Mobile Responsive Cards -->
      <div class="complaint-cards-mobile" id="complaints-cards-mobile">
        ${pageComplaints.map(c => `
          <div class="complaint-card" data-card-id="${c.id}">
            <div class="complaint-card__header">
              <span class="complaint-card__id" data-id="${c.id}">#${c.id}</span>
              <span class="badge badge--${statusClass(c.status)}">${c.status}</span>
            </div>
            <div class="complaint-card__category" style="font-weight: 600; color: var(--color-gray-900);">${c.category}</div>
            <div class="complaint-card__description">${truncate(c.description, 80)}</div>
            <div class="complaint-card__meta">
              <span class="badge badge--${priorityClass(c.priority)}">${c.priority}</span>
              ${c.is_overdue ? '<span class="badge badge--overdue">Overdue</span>' : ''}
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
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);
  
  return `
    <div class="pagination">
      <span class="pagination__info">Showing ${start}–${end} of ${total} complaints</span>
      <div class="pagination__controls">
        <button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
          ${icon('chevronLeft', 16)}
        </button>
        ${pages.map(p => `
          <button class="pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}" data-page="${p}">${p}</button>
        `).join('')}
        <button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
          ${icon('chevronRight', 16)}
        </button>
      </div>
    </div>
  `;
}

async function loadComplaints(content) {
  const user = getCurrentUser();
  const listContainer = document.getElementById('complaints-list');
  if (listContainer) listContainer.innerHTML = `<div class="card card--padded" style="text-align: center; padding: var(--space-8);"><div class="skeleton skeleton--card"></div></div>`;
  
  try {
    allComplaints = await apiGetComplaints({ 
      resident_id: user.id, 
      ...currentFilters 
    });
    
    const listEl = document.getElementById('complaints-list');
    if (listEl) {
      listEl.innerHTML = renderTable(allComplaints, allComplaints.length);
      bindTableEvents(content);
      handleResponsive();
    }
  } catch (err) {
    const listEl = document.getElementById('complaints-list');
    if (listEl) listEl.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Unable to load requests: ${err.message}</div>`;
  }
}

function bindTableEvents(content) {
  content.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => navigate(`/complaints/${el.dataset.id}`));
  });
  content.querySelectorAll('[data-view-id]').forEach(el => {
    el.addEventListener('click', () => navigate(`/complaints/${el.dataset.viewId}`));
  });
  content.querySelectorAll('[data-card-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-id]')) return;
      navigate(`/complaints/${el.dataset.cardId}`);
    });
  });
  content.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      const page = parseInt(el.dataset.page, 10);
      if (page >= 1 && page !== currentPage) {
        currentPage = page;
        const listEl = document.getElementById('complaints-list');
        if (listEl) {
          listEl.innerHTML = renderTable(allComplaints, allComplaints.length);
          bindTableEvents(content);
          handleResponsive();
        }
      }
    });
  });
}

function handleResponsive() {
  const table = document.getElementById('complaints-table');
  const cards = document.getElementById('complaints-cards-mobile');
  if (!table || !cards) return;
  
  if (window.innerWidth <= 768) {
    table.style.display = 'none';
    cards.style.display = 'block';
  } else {
    table.style.display = '';
    cards.style.display = 'none';
  }
}

export async function renderMyComplaints() {
  currentPage = 1;
  currentFilters = { status: 'All', category: 'All', search: '' };
  
  const content = mountAppShell('My Complaints');
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="my-complaints-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
      <div>
        <h2 class="page-header__title">My Maintenance Requests</h2>
        <p class="page-header__subtitle">Track resolution milestones, view assigned technicians, and review status histories.</p>
      </div>
      <a href="#/complaints/new" class="btn btn--primary">${icon('plusCircle', 16)} New Request</a>
    </div>
    ${renderFilters()}
    <div id="complaints-list"></div>
  `;
  
  document.getElementById('my-complaints-back-btn')?.addEventListener('click', () => navigate('/dashboard'));
  await loadComplaints(content);
  
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
  
  window.addEventListener('resize', handleResponsive);
  
  return () => {
    window.removeEventListener('resize', handleResponsive);
  };
}
