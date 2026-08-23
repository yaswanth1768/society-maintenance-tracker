// ===== New Complaint Page =====
import { mountAppShell } from '../../components/layout/AppShell.js';
import { icon } from '../../assets/icons.js';
import { getCurrentUser } from '../../store.js';
import { apiCreateComplaint } from '../../api.js';
import { showToast } from '../../components/ui/Toast.js';
import { navigate } from '../../router.js';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Water Supply', 'Common Area', 'Other'];

export async function renderNewComplaint() {
  const content = mountAppShell('New Complaint');
  const user = getCurrentUser();
  
  let photoDataUrl = null;
  let submitted = false;
  
  content.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <button class="btn btn--ghost" id="new-complaint-back-btn" style="padding-left: 0;">${icon('arrowLeft', 16)} Back to Complaints</button>
    </div>
    <div class="page-header">
      <h2 class="page-header__title">Raise a Maintenance Complaint</h2>
      <p class="page-header__subtitle">Describe the issue and our maintenance team will address it promptly.</p>
    </div>
    
    <div class="card card--padded" style="max-width: 720px;" id="complaint-form-card">
      <div id="form-error"></div>
      
      <form id="new-complaint-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="complaint-category">Category</label>
          <select class="form-input form-select" id="complaint-category" required>
            <option value="">Select a category</option>
            ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="complaint-description">Description</label>
          <textarea class="form-input form-textarea" id="complaint-description" rows="5" 
            placeholder="Describe the issue in detail. Include location, severity, and when you first noticed the problem." required></textarea>
          <p class="form-hint">Provide as much detail as possible to help the maintenance team understand the issue.</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Photo (optional)</label>
          <div class="photo-uploader" id="photo-uploader">
            <div class="photo-uploader__icon">${icon('upload', 40)}</div>
            <p class="photo-uploader__text"><strong>Click to upload</strong> or drag and drop</p>
            <p class="photo-uploader__hint">JPG, PNG, or WEBP — Max 5MB</p>
            <input type="file" accept="image/jpeg,image/png,image/webp" id="photo-input" />
          </div>
          <div id="photo-preview-container"></div>
          <p class="form-hint mt-2">Upload a photo to help the maintenance team understand the issue.</p>
        </div>
        
        <div class="form-actions">
          <a href="#/complaints" class="btn btn--secondary">Cancel</a>
          <button type="submit" class="btn btn--primary" id="submit-complaint-btn">Submit Complaint</button>
        </div>
      </form>
    </div>
    
    <!-- Confirmation (hidden initially) -->
    <div class="card card--padded" style="max-width: 720px; display: none;" id="confirmation-card">
      <div class="confirmation">
        <div class="confirmation__icon">${icon('checkCircle', 28)}</div>
        <h3 class="confirmation__title">Complaint submitted successfully</h3>
        <p class="confirmation__text">Your complaint ID is <span class="confirmation__id" id="conf-complaint-id"></span></p>
        <p style="font-size: var(--font-size-sm); color: var(--color-gray-500); margin-bottom: var(--space-6);">
          Our maintenance team has been notified and will review your complaint shortly.
        </p>
        <div style="display: flex; gap: var(--space-3); justify-content: center;">
          <a href="#/complaints" class="btn btn--secondary">View My Complaints</a>
          <button class="btn btn--primary" id="raise-another-btn">${icon('plusCircle', 16)} Raise Another</button>
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
  
  // Back button handler
  document.getElementById('new-complaint-back-btn')?.addEventListener('click', () => navigate('/complaints'));

  // Photo upload handling
  function handleFileSelect(file) {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG, PNG, or WEBP image.', 'error');
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
          <button class="photo-uploader__remove" id="remove-photo-btn" type="button">${icon('x', 14)}</button>
        </div>
      `;
      document.getElementById('remove-photo-btn').addEventListener('click', () => {
        photoDataUrl = null;
        previewContainer.innerHTML = '';
        photoUploader.style.display = '';
        photoInput.value = '';
      });
      showToast('Photo uploaded successfully.', 'success');
    };
    reader.readAsDataURL(file);
  }
  
  photoInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });
  
  // Drag and drop
  photoUploader.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploader.classList.add('photo-uploader--dragover');
  });
  
  photoUploader.addEventListener('dragleave', () => {
    photoUploader.classList.remove('photo-uploader--dragover');
  });
  
  photoUploader.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploader.classList.remove('photo-uploader--dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('complaint-category').value;
    const description = document.getElementById('complaint-description').value.trim();
    
    if (!category) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please select a category.</div>`;
      return;
    }
    
    if (!description || description.length < 10) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please provide a detailed description (at least 10 characters).</div>`;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    errorDiv.innerHTML = '';
    
    try {
      const complaint = await apiCreateComplaint({
        resident_id: user.id,
        category,
        description,
        photo_url: photoDataUrl
      });
      
      submitted = true;
      formCard.style.display = 'none';
      confCard.style.display = '';
      document.getElementById('conf-complaint-id').textContent = `#${complaint.id}`;
      
      showToast('Complaint submitted successfully.', 'success');
      
      // "Raise Another" button
      document.getElementById('raise-another-btn').addEventListener('click', () => {
        navigate('/complaints/new');
      });
      
    } catch (err) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} ${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Complaint';
    }
  });
}
