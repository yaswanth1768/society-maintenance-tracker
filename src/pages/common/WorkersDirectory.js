// ===== House Workers & Service Providers Directory Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiGetWorkers, apiCreateWorker, apiDeleteWorker } from '../../api.js';
import { showToast } from '../../components/ui/Toast.js';
import { showModal, showConfirmModal } from '../../components/ui/Modal.js';
import { debounce } from '../../utils.js';
import { navigate } from '../../router.js';

const WORKER_CATEGORIES = [
  'All',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'House Cleaning',
  'Appliance Repair',
  'Gardener',
  'Masonry & Tiles',
  'Other'
];

const CATEGORY_ICONS = {
  'Plumber': 'wrench',
  'Electrician': 'alertCircle',
  'Carpenter': 'wrench',
  'Painter': 'checkCircle',
  'House Cleaning': 'home',
  'Appliance Repair': 'settings',
  'Gardener': 'star',
  'Masonry & Tiles': 'building',
  'Other': 'users'
};

let currentCategory = 'All';
let searchQuery = '';

export async function renderWorkersDirectory() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const content = mountAppShell('Service Directory');

  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="workers-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Dashboard</button>
    </div>
    
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
      <div>
        <h2 class="page-header__title">House Workers & Service Directory</h2>
        <p class="page-header__subtitle">
          Contact trusted plumbers, electricians, carpenters, painters, and technicians recommended by society members.
        </p>
      </div>
      <button class="btn btn--primary" id="add-worker-btn" style="box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
        ${icon('plus', 16)} Add New Service Person
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-bar" style="margin-bottom: var(--space-6);">
      <div class="filter-bar__search">
        ${icon('search', 16)}
        <input class="form-input" type="text" id="worker-search" placeholder="Search by name, trade, phone number, or area…" value="${searchQuery}" />
      </div>
      <div class="filter-bar__select">
        <select class="form-input form-select" id="worker-category-select" title="Filter Trade">
          ${WORKER_CATEGORIES.map(c => `<option value="${c}" ${currentCategory === c ? 'selected' : ''}>${c === 'All' ? 'All Services & Trades' : c}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Worker Cards Grid -->
    <div id="workers-grid-container">
      ${Array(6).fill('<div class="skeleton skeleton--card" style="height: 180px;"></div>').join('')}
    </div>
  `;

  document.getElementById('workers-back-btn')?.addEventListener('click', () => {
    navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
  });

  document.getElementById('add-worker-btn')?.addEventListener('click', () => {
    openAddWorkerModal(currentUser, loadWorkers);
  });

  async function loadWorkers() {
    const container = document.getElementById('workers-grid-container');
    if (!container) return;

    try {
      const workers = await apiGetWorkers({
        category: currentCategory,
        search: searchQuery
      });

      if (workers.length === 0) {
        container.innerHTML = `
          <div class="card card--padded" style="grid-column: 1 / -1;">
            <div class="empty-state">
              <div class="empty-state__icon">${icon('users', 48)}</div>
              <div class="empty-state__title">No Service Providers Found</div>
              <div class="empty-state__text">No workers match your search criteria. You can recommend and add a trusted technician to this community directory.</div>
              <button class="btn btn--primary" id="empty-add-worker-btn">${icon('plus', 16)} Add Service Person</button>
            </div>
          </div>
        `;
        document.getElementById('empty-add-worker-btn')?.addEventListener('click', () => {
          openAddWorkerModal(currentUser, loadWorkers);
        });
        return;
      }

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-5);">
          ${workers.map(w => `
            <div class="card card--padded" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; border-radius: var(--radius-xl); transition: transform 0.2s ease, box-shadow 0.2s ease;">
              <div>
                <!-- Header: Avatar, Name, Trade & Rating -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3);">
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <div style="width: 46px; height: 46px; border-radius: var(--radius-lg); background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--font-size-base); flex-shrink: 0; box-shadow: 0 4px 10px rgba(99,102,241,0.25);">
                      ${w.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <h3 style="font-size: var(--font-size-base); font-weight: 700; color: var(--color-gray-900); margin: 0;">${w.name}</h3>
                        ${w.is_verified ? '<span title="Society Verified" style="color: var(--color-blue); font-size: 13px;">✓</span>' : ''}
                      </div>
                      <span class="badge badge--open" style="margin-top: 4px; font-size: 11px;">
                        ${w.category}
                      </span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 3px; background: #fef3c7; color: #b45309; padding: 3px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                    ${icon('star', 12)}
                    <span>${w.rating}</span>
                  </div>
                </div>

                <!-- Specialty / Scope -->
                <p style="font-size: var(--font-size-xs); color: var(--color-gray-600); line-height: 1.5; margin-bottom: var(--space-4); background: var(--color-gray-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 3px solid var(--color-primary);">
                  <strong>Services:</strong> ${w.speciality || 'General household maintenance work.'}
                </p>

                <!-- Details List -->
                <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-5); font-size: var(--font-size-xs); color: var(--color-gray-600);">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="color: var(--color-gray-400);">${icon('phone', 14)}</span>
                    <strong style="color: var(--color-gray-900); font-family: var(--font-mono); font-size: var(--font-size-sm);">${w.phone}</strong>
                  </div>
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="color: var(--color-gray-400);">${icon('mapPin', 14)}</span>
                    <span>${w.address || 'Local service provider'}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="color: var(--color-gray-400);">${icon('clock', 14)}</span>
                    <span>${w.timing || '8:00 AM – 8:00 PM'}</span>
                  </div>
                </div>
              </div>

              <!-- Footer: Call Action, Copy & Info -->
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); font-size: 11px; color: var(--color-gray-400);">
                  <span>Recommended by: <strong>${w.added_by || 'Member'}</strong></span>
                  ${isAdmin ? `<button class="link-btn" style="color: var(--color-red); font-size: 11px;" data-delete-worker="${w.id}">Delete</button>` : ''}
                </div>

                <div style="display: flex; gap: var(--space-2);">
                  <a href="tel:${w.phone.replace(/[^0-9+]/g, '')}" class="btn btn--primary btn--sm" style="flex: 1; text-decoration: none;">
                    ${icon('phone', 14)} Call Now
                  </a>
                  <button class="btn btn--secondary btn--sm" data-copy-phone="${w.phone}" title="Copy phone number">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Copy phone handlers
      container.querySelectorAll('[data-copy-phone]').forEach(btn => {
        btn.addEventListener('click', () => {
          const num = btn.dataset.copyPhone;
          navigator.clipboard.writeText(num).then(() => {
            showToast(`Copied ${num} to clipboard`, 'info');
          });
        });
      });

      // Admin delete worker handlers
      container.querySelectorAll('[data-delete-worker]').forEach(btn => {
        btn.addEventListener('click', () => {
          const workerId = btn.dataset.deleteWorker;
          showConfirmModal({
            title: 'Remove Service Provider',
            message: 'Are you sure you want to remove this person from the society service directory?',
            confirmText: 'Remove Person',
            confirmType: 'danger',
            onConfirm: async () => {
              await apiDeleteWorker(workerId);
              showToast('Service person removed from directory.', 'success');
              loadWorkers();
            }
          });
        });
      });

    } catch (err) {
      container.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Unable to load service directory: ${err.message}</div>`;
    }
  }

  // Event handlers for filters
  const searchInput = document.getElementById('worker-search');
  const catSelect = document.getElementById('worker-category-select');

  const debouncedWorkerSearch = debounce(() => {
    searchQuery = searchInput?.value || '';
    loadWorkers();
  }, 300);

  searchInput?.addEventListener('input', debouncedWorkerSearch);
  catSelect?.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    loadWorkers();
  });

  loadWorkers();
}

// Modal for Adding a New Service Person
function openAddWorkerModal(currentUser, onSuccess) {
  const memberName = currentUser ? `${currentUser.name} (${currentUser.flat || 'Member'})` : 'Resident Member';

  const modalBody = `
    <form id="add-worker-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="new-worker-name">Full Name <span style="color: var(--color-red);">*</span></label>
        <input class="form-input" type="text" id="new-worker-name" placeholder="e.g. Ramesh Kumar, Sunita Devi" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="new-worker-category">Trade / Profession <span style="color: var(--color-red);">*</span></label>
          <select class="form-input form-select" id="new-worker-category" required>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Painter">Painter</option>
            <option value="House Cleaning">House Cleaning / Maid</option>
            <option value="Appliance Repair">Appliance / AC Repair</option>
            <option value="Gardener">Gardener</option>
            <option value="Masonry & Tiles">Masonry & Tiles</option>
            <option value="Pest Control">Pest Control</option>
            <option value="Other">Other Home Service</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="new-worker-phone">Phone Number <span style="color: var(--color-red);">*</span></label>
          <input class="form-input" type="tel" id="new-worker-phone" placeholder="e.g. +91 98450 12345" required />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-worker-address">Address / Operating Shop Location</label>
        <input class="form-input" type="text" id="new-worker-address" placeholder="e.g. Shop #4 Main Market, Near Gate 2" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="new-worker-timing">Working Hours / Availability</label>
          <input class="form-input" type="text" id="new-worker-timing" placeholder="e.g. 8:00 AM – 7:00 PM" value="8:00 AM – 8:00 PM" />
        </div>

        <div class="form-group">
          <label class="form-label" for="new-worker-rating">Rating (1 to 5)</label>
          <select class="form-input form-select" id="new-worker-rating">
            <option value="5.0">⭐⭐⭐⭐⭐ 5.0 (Highly Recommended)</option>
            <option value="4.9" selected>⭐⭐⭐⭐⭐ 4.9 (Excellent)</option>
            <option value="4.8">⭐⭐⭐⭐ 4.8 (Very Good)</option>
            <option value="4.5">⭐⭐⭐⭐ 4.5 (Good)</option>
            <option value="4.0">⭐⭐⭐⭐ 4.0 (Average)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-worker-speciality">Specialty / Services Handled</label>
        <textarea class="form-input form-textarea" id="new-worker-speciality" rows="2" placeholder="e.g. Expert in pipe leaks, sanitary fittings, tank motors, drain blockage"></textarea>
      </div>

      <div id="worker-modal-error"></div>
    </form>
  `;

  const { close, overlay } = showModal({
    title: 'Add Person to Service Directory',
    body: modalBody,
    footer: `
      <button class="btn btn--secondary" id="cancel-worker-modal-btn">Cancel</button>
      <button class="btn btn--primary" id="save-worker-modal-btn">${icon('check', 14)} Add to Directory</button>
    `
  });

  overlay.querySelector('#cancel-worker-modal-btn')?.addEventListener('click', close);

  overlay.querySelector('#save-worker-modal-btn')?.addEventListener('click', async () => {
    const name = overlay.querySelector('#new-worker-name').value.trim();
    const category = overlay.querySelector('#new-worker-category').value;
    const phone = overlay.querySelector('#new-worker-phone').value.trim();
    const address = overlay.querySelector('#new-worker-address').value.trim();
    const timing = overlay.querySelector('#new-worker-timing').value.trim();
    const rating = overlay.querySelector('#new-worker-rating').value;
    const speciality = overlay.querySelector('#new-worker-speciality').value.trim();
    const errorBox = overlay.querySelector('#worker-modal-error');

    if (!name || name.length < 2) {
      errorBox.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please enter the worker's full name.</div>`;
      return;
    }

    if (!phone || phone.length < 8) {
      errorBox.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please enter a valid phone number.</div>`;
      return;
    }

    try {
      await apiCreateWorker({
        name,
        category,
        phone,
        address: address || 'Community Area',
        timing: timing || '8:00 AM – 8:00 PM',
        rating,
        speciality: speciality || `${category} services`,
        added_by: memberName
      });

      showToast(`${name} (${category}) added to the service directory!`, 'success');
      close();
      if (onSuccess) onSuccess();
    } catch (err) {
      errorBox.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} ${err.message}</div>`;
    }
  });
}
