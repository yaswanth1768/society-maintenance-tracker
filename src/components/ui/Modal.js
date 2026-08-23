// ===== Modal Component =====
import { icon } from '../../assets/icons.js';

export function showModal({ title, body, footer, onClose }) {
  const container = document.getElementById('modal-container') || document.body;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close" id="modal-close-btn">${icon('x', 20)}</button>
      </div>
      <div class="modal__body">${body}</div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
    </div>
  `;
  
  function close() {
    overlay.remove();
    if (onClose) onClose();
  }
  
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  
  container.appendChild(overlay);
  
  return { close, overlay };
}

export function showConfirmModal({ title, message, confirmText = 'Confirm', confirmClass = 'btn--danger', onConfirm }) {
  const { close, overlay } = showModal({
    title,
    body: `<p style="color: var(--color-gray-600); font-size: var(--font-size-sm);">${message}</p>`,
    footer: `
      <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
      <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
    `
  });
  
  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.querySelector('#modal-confirm').addEventListener('click', () => {
    close();
    if (onConfirm) onConfirm();
  });
  
  return { close };
}
