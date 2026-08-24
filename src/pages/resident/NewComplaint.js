// ===== Distinctive New Complaint Form Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiCreateComplaint } from '../../api.js';
import { showToast } from '../../components/ui/Toast.js';
import { navigate } from '../../router.js';

const CATEGORIES = [
  { name: 'Plumbing', icon: 'wrench' },
  { name: 'Electrical', icon: 'alertCircle' },
  { name: 'Cleaning', icon: 'checkCircle' },
  { name: 'Security', icon: 'shieldCheck' },
  { name: 'Lift', icon: 'building' },
  { name: 'Water Supply', icon: 'inbox' },
  { name: 'Common Area', icon: 'home' },
  { name: 'Other', icon: 'clipboardList' }
];

export async function renderNewComplaint() {
  const content = mountAppShell('Raise Complaint');
  const user = getCurrentUser();
  
  let selectedCategory = '';
  let photoDataUrl = null;
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="new-complaint-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Complaints</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Submit a Maintenance Request</h2>
      <p class="page-header__subtitle">Select an issue category, provide description details, and optionally attach photos for fast resolution.</p>
    </div>
    
    <div class="card card--padded" style="max-width: 760px;" id="complaint-form-card">
      <div id="form-error"></div>
      
      <form id="new-complaint-form" novalidate>
        <!-- Interactive Category Selection Tiles -->
        <div class="form-group">
          <label class="form-label">Select Issue Category <span style="color: var(--color-red);">*</span></label>
          <div class="category-grid" id="category-picker-grid">
            ${CATEGORIES.map(c => `
              <div class="category-tile" data-cat-name="${c.name}">
                <div class="category-tile__icon">
                  ${icon(c.icon, 20)}
                </div>
                <span class="category-tile__name">${c.name}</span>
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="complaint-category" value="" required />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="complaint-description">Issue Description <span style="color: var(--color-red);">*</span></label>
          <textarea class="form-input form-textarea" id="complaint-description" rows="4" 
            placeholder="Describe the issue in detail. Include specific room/area, severity, and any hazards..." required></textarea>
          <p class="form-hint">Detailed descriptions help the maintenance team dispatch the right tools and personnel on the first visit.</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Supporting Photo (Optional)</label>
          <div class="photo-uploader" id="photo-uploader">
            <div class="photo-uploader__icon">${icon('upload', 40)}</div>
            <p class="photo-uploader__text"><strong>Click to upload image</strong> or drag and drop</p>
            <p class="photo-uploader__hint">Supports JPG, PNG, WEBP — Max 5MB</p>
            <input type="file" accept="image/jpeg,image/png,image/webp" id="photo-input" />
          </div>
          <div id="photo-preview-container"></div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);">
          <a href="#/complaints" class="btn btn--secondary">Cancel</a>
          <button type="submit" class="btn btn--primary" id="submit-complaint-btn" style="min-width: 160px;">
            ${icon('check', 16)} Submit Request
          </button>
        </div>
      </form>
    </div>
    
    <!-- Success Confirmation State (hidden initially) -->
    <div class="card card--padded" style="max-width: 760px; display: none;" id="confirmation-card">
      <div class="confirmation">
        <div class="confirmation__icon" style="background: var(--color-green-light); color: var(--color-green);">${icon('checkCircle', 32)}</div>
        <h3 class="confirmation__title">Maintenance Request Lodged!</h3>
        <p class="confirmation__text">Your complaint tracking ID is <span class="complaint-id" id="conf-complaint-id"></span></p>
        <p style="font-size: var(--font-size-sm); color: var(--color-gray-500); margin-bottom: var(--space-6); max-width: 460px; margin-left: auto; margin-right: auto;">
          The society maintenance administrator has been notified. You will receive real-time email updates as status milestones progress.
        </p>
        <div style="display: flex; gap: var(--space-3); justify-content: center;">
          <a href="#/complaints" class="btn btn--secondary">View My Complaints</a>
          <button class="btn btn--primary" id="raise-another-btn">${icon('plusCircle', 16)} Raise Another Request</button>
        </div>
      </div>
    </div>
  `;
  
  const form = document.getElementById('new-complaint-form');
  const formCard = document.getElementById('complaint-form-card');
  const confCard = document.getElementById('confirmation-card');
  const submitBtn = document.getElementById('submit-complaint-btn');
  const errorDiv = document.getElementById('form-error');
  const photoInput = document.getElementById('photo-input');
  const photoUploader = document.getElementById('photo-uploader');
  const previewContainer = document.getElementById('photo-preview-container');
  const categoryHidden = document.getElementById('complaint-category');

  // Category Picker Grid Selection
  document.querySelectorAll('.category-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      document.querySelectorAll('.category-tile').forEach(t => t.classList.remove('category-tile--selected'));
      tile.classList.add('category-tile--selected');
      selectedCategory = tile.dataset.catName;
      categoryHidden.value = selectedCategory;
    });
  });

  // Back button handler
  document.getElementById('new-complaint-back-btn')?.addEventListener('click', () => navigate('/complaints'));

  // Photo upload handling
  function handleFileSelect(file) {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG, PNG, or WEBP image format.', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo must be under 5MB.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      photoDataUrl = e.target.result;
      photoUploader.style.display = 'none';
      previewContainer.innerHTML = `
        <div class="photo-uploader__preview">
          <img src="${photoDataUrl}" alt="Complaint photo preview" />
          <button class="photo-uploader__remove" id="remove-photo-btn" type="button" title="Remove image">${icon('x', 14)}</button>
        </div>
      `;
      document.getElementById('remove-photo-btn')?.addEventListener('click', () => {
        photoDataUrl = null;
        previewContainer.innerHTML = '';
        photoUploader.style.display = '';
        photoInput.value = '';
      });
      showToast('Photo attached successfully.', 'success');
    };
    reader.readAsDataURL(file);
  }
  
  photoInput?.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });
  
  // Drag and drop events
  photoUploader?.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploader.classList.add('photo-uploader--dragover');
  });
  
  photoUploader?.addEventListener('dragleave', () => {
    photoUploader.classList.remove('photo-uploader--dragover');
  });
  
  photoUploader?.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploader.classList.remove('photo-uploader--dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
  
  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = categoryHidden.value || selectedCategory;
    const description = document.getElementById('complaint-description').value.trim();
    
    if (!category) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please select an issue category tile above.</div>`;
      return;
    }
    
    if (!description || description.length < 8) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please provide a descriptive issue explanation (at least 8 characters).</div>`;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Request…';
    errorDiv.innerHTML = '';
    
    try {
      const complaint = await apiCreateComplaint({
        resident_id: user.id,
        category,
        description,
        photo_url: photoDataUrl
      });
      
      formCard.style.display = 'none';
      confCard.style.display = '';
      document.getElementById('conf-complaint-id').textContent = `#${complaint.id}`;
      
      showToast('Complaint registered successfully.', 'success');
      
      document.getElementById('raise-another-btn')?.addEventListener('click', () => {
        navigate('/complaints/new');
      });
      
    } catch (err) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} ${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  });
}
