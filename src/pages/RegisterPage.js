// ===== Register Page =====
import { icon } from '../assets/icons.js';
import { apiRegister, apiGoogleAuth } from '../api.js';
import { setCurrentUser } from '../store.js';
import { navigate } from '../router.js';
import { showModal } from '../components/ui/Modal.js';

export async function renderRegisterPage() {
  const app = document.getElementById('app');
  app.className = '';
  
  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-layout__visual">
        <img src="/society-bg.jpg" alt="Residential society" />
        <div class="auth-layout__visual-overlay"></div>
        <div class="auth-layout__visual-content">
          <h2>Join Your Community</h2>
          <p>Register to submit maintenance requests, track progress, and stay updated with society notices.</p>
        </div>
      </div>
      <div class="auth-layout__form">
        <div class="auth-layout__logo">
          <div class="auth-layout__logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span class="auth-layout__logo-text">Society Maintenance</span>
        </div>
        
        <h1 class="auth-layout__title">Create your account</h1>
        <p class="auth-layout__subtitle">Register as a resident to get started</p>
        
        <div id="register-error"></div>
        
        <!-- Google Sign Up Button -->
        <button type="button" class="btn btn--secondary btn--lg btn--full" id="google-register-btn" style="margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: center; gap: var(--space-3); border-color: var(--color-gray-300);">
          ${icon('google', 20)}
          <span>Sign up with Google</span>
        </button>

        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-5);">
          <div style="flex: 1; height: 1px; background: var(--color-gray-200);"></div>
          <span style="font-size: var(--font-size-xs); color: var(--color-gray-400); text-transform: uppercase; letter-spacing: 0.05em;">Or register with email</span>
          <div style="flex: 1; height: 1px; background: var(--color-gray-200);"></div>
        </div>
        
        <form id="register-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="reg-name">Full name</label>
            <input class="form-input" type="text" id="reg-name" placeholder="Enter your full name" required />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="reg-email">Email address</label>
            <input class="form-input" type="email" id="reg-email" placeholder="you@example.com" autocomplete="email" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="reg-flat">Flat / Unit number</label>
              <input class="form-input" type="text" id="reg-flat" placeholder="e.g. A-404" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-phone">Phone number</label>
              <input class="form-input" type="tel" id="reg-phone" placeholder="10-digit number" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <input class="form-input" type="password" id="reg-password" placeholder="Minimum 6 characters" autocomplete="new-password" required />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="reg-confirm">Confirm password</label>
            <input class="form-input" type="password" id="reg-confirm" placeholder="Re-enter your password" autocomplete="new-password" required />
          </div>
          
          <button type="submit" class="btn btn--primary btn--lg btn--full" id="register-submit-btn">
            Create account
          </button>
        </form>
        
        <p style="text-align: center; margin-top: var(--space-6); font-size: var(--font-size-sm); color: var(--color-gray-500);">
          Already have an account? <a href="#/login" class="link-btn">Sign in</a>
        </p>
      </div>
    </div>
  `;
  
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit-btn');
  const errorDiv = document.getElementById('register-error');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const flat = document.getElementById('reg-flat').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    // Validation
    if (!name || !email || !flat || !password) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please fill in all required fields.</div>`;
      return;
    }
    
    if (password.length < 6) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Password must be at least 6 characters.</div>`;
      return;
    }
    
    if (password !== confirm) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Passwords do not match.</div>`;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';
    errorDiv.innerHTML = '';
    
    try {
      const user = await apiRegister({ name, email, password, flat, phone });
      setCurrentUser(user);
      navigate('/dashboard');
    } catch (err) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} ${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });

  // Google Sign Up Handler
  document.getElementById('google-register-btn')?.addEventListener('click', () => {
    const modalBody = `
      <p style="font-size: var(--font-size-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
        Continue with Google as a resident:
      </p>
      <form id="google-quick-form">
        <div class="form-group">
          <label class="form-label">Google Account Name</label>
          <input type="text" id="g-reg-name" class="form-input" value="Suresh Verma" required />
        </div>
        <div class="form-group">
          <label class="form-label">Google Email</label>
          <input type="email" id="g-reg-email" class="form-input" value="suresh.verma@gmail.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Flat / Unit Number</label>
          <input type="text" id="g-reg-flat" class="form-input" placeholder="e.g. C-304" value="C-304" required />
        </div>
      </form>
    `;

    const { close, overlay } = showModal({
      title: 'Sign up with Google',
      body: modalBody,
      footer: `
        <button class="btn btn--secondary" id="g-cancel-btn">Cancel</button>
        <button class="btn btn--primary" id="g-confirm-btn">${icon('check', 14)} Complete Sign Up</button>
      `
    });

    overlay.querySelector('#g-cancel-btn')?.addEventListener('click', close);
    overlay.querySelector('#g-confirm-btn')?.addEventListener('click', async () => {
      const name = overlay.querySelector('#g-reg-name').value.trim();
      const email = overlay.querySelector('#g-reg-email').value.trim();
      const flat = overlay.querySelector('#g-reg-flat').value.trim();

      if (!name || !email || !flat) {
        return;
      }

      close();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering with Google…';

      try {
        const user = await apiGoogleAuth({ name, email, flat, role: 'resident' });
        setCurrentUser(user);
        navigate('/dashboard');
      } catch (err) {
        errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Google sign-up failed: ${err.message}</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
      }
    });
  });
}
