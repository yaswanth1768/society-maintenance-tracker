// ===== Toast Notification System =====
import { icon } from '../../assets/icons.js';

let toastContainer = null;

function ensureContainer() {
  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  toastContainer.className = 'toast-container';
}

export function showToast(message, type = 'success', duration = 4000) {
  ensureContainer();
  
  const iconMap = {
    success: icon('checkCircle', 20),
    error: icon('alertCircle', 20),
    info: icon('info', 20)
  };
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${iconMap[type] || iconMap.info}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close">${icon('x', 16)}</button>
  `;
  
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => removeToast(toast));
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('toast--exit');
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 200);
}
