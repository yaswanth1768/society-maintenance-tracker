// ===== Login Page =====
import { icon } from '../assets/icons.js';
import { apiLogin, apiGoogleAuth } from '../api.js';
import { setCurrentUser, isAdmin } from '../store.js';
import { navigate } from '../router.js';
import { showModal } from '../components/ui/Modal.js';

export async function renderLoginPage() {
  const app = document.getElementById('app');
  app.className = '';
  
  let currentTab = 'resident'; // 'resident' | 'admin'

  app.innerHTML = `
    <div class="auth-layout">
      <div class="auth-layout__visual">
        <img src="/society-bg.jpg" alt="Residential society" />
        <div class="auth-layout__visual-overlay"></div>
        <div class="auth-layout__visual-content">
          <h2>Society Maintenance Tracker</h2>
          <p>Streamline maintenance requests, track resolutions, and keep your community informed.</p>
        </div>
      </div>
      <div class="auth-layout__form">
        <div class="auth-layout__logo">
          <div class="auth-layout__logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <span class="auth-layout__logo-text">Society Maintenance</span>
        </div>

        <!-- Role Login Switcher Tabs -->
        <div style="display: flex; background: var(--color-gray-100); border-radius: var(--radius-lg); padding: 4px; margin-bottom: var(--space-6); border: 1px solid var(--color-gray-200);">
          <button type="button" id="tab-resident-btn" class="btn" style="flex: 1; height: 40px; border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-sm); background: var(--color-white); color: var(--color-navy); box-shadow: var(--shadow-sm);">
            ${icon('home', 16)} Resident Login
          </button>
          <button type="button" id="tab-admin-btn" class="btn" style="flex: 1; height: 40px; border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-sm); background: transparent; color: var(--color-gray-500);">
            ${icon('building', 16)} Admin Login
          </button>
        </div>
        
        <div id="login-header-section">
          <h1 class="auth-layout__title" id="auth-role-title">Resident Sign In</h1>
          <p class="auth-layout__subtitle" id="auth-role-subtitle">Access your maintenance requests, notices & community updates</p>
        </div>
        
        <div id="login-error"></div>
        
        <!-- Google Sign In Button -->
        <button type="button" class="btn btn--secondary btn--lg btn--full" id="google-login-btn" style="margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: center; gap: var(--space-3); border-color: var(--color-gray-300);">
          ${icon('google', 20)}
          <span id="google-btn-text">Sign in with Google (Resident)</span>
        </button>

        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-5);">
          <div style="flex: 1; height: 1px; background: var(--color-gray-200);"></div>
          <span style="font-size: var(--font-size-xs); color: var(--color-gray-400); text-transform: uppercase; letter-spacing: 0.05em;">Or continue with email</span>
          <div style="flex: 1; height: 1px; background: var(--color-gray-200);"></div>
        </div>
        
        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email" id="login-email-label">Resident Email</label>
            <input class="form-input" type="email" id="login-email" placeholder="yaswanth@example.com" value="yaswanth@example.com" autocomplete="email" required />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-input" type="password" id="login-password" placeholder="Enter your password" value="password123" autocomplete="current-password" required />
          </div>
          
          <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
            <label class="form-checkbox">
              <input type="checkbox" id="login-remember" checked />
              <span>Remember me</span>
            </label>
            <button type="button" class="link-btn" style="font-size: var(--font-size-sm);">Forgot password?</button>
          </div>
          
          <button type="submit" class="btn btn--primary btn--lg btn--full" id="login-submit-btn">
            Sign In to Resident Portal
          </button>
        </form>
        
        <div id="register-link-container">
          <p style="text-align: center; margin-top: var(--space-6); font-size: var(--font-size-sm); color: var(--color-gray-500);">
            Don't have a resident account? <a href="#/register" class="link-btn">Create an account</a>
          </p>
        </div>
        
        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
            <span style="font-size: var(--font-size-xs); color: var(--color-gray-500);" id="quick-demo-hint">Quick Demo Sign In:</span>
            <button class="btn btn--ghost btn--sm" id="quick-demo-btn" type="button" style="font-size: var(--font-size-xs); color: var(--color-blue); font-weight: 600;">
              Use Demo Resident Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailLabel = document.getElementById('login-email-label');
  const submitBtn = document.getElementById('login-submit-btn');
  const errorDiv = document.getElementById('login-error');
  const titleEl = document.getElementById('auth-role-title');
  const subtitleEl = document.getElementById('auth-role-subtitle');
  const googleText = document.getElementById('google-btn-text');
  const regLink = document.getElementById('register-link-container');
  const tabResident = document.getElementById('tab-resident-btn');
  const tabAdmin = document.getElementById('tab-admin-btn');
  const quickDemoBtn = document.getElementById('quick-demo-btn');

  function updateTabState(tab) {
    currentTab = tab;
    errorDiv.innerHTML = '';
    
    if (tab === 'resident') {
      tabResident.style.background = 'var(--color-white)';
      tabResident.style.color = 'var(--color-navy)';
      tabResident.style.boxShadow = 'var(--shadow-sm)';
      tabAdmin.style.background = 'transparent';
      tabAdmin.style.color = 'var(--color-gray-500)';
      tabAdmin.style.boxShadow = 'none';

      titleEl.textContent = 'Resident Sign In';
      subtitleEl.textContent = 'Access your maintenance requests, notices & community updates';
      emailLabel.textContent = 'Resident Email';
      emailInput.placeholder = 'yaswanth@example.com';
      emailInput.value = 'yaswanth@example.com';
      passwordInput.value = 'password123';
      googleText.textContent = 'Sign in with Google (Resident)';
      submitBtn.textContent = 'Sign In to Resident Portal';
      regLink.style.display = 'block';
      quickDemoBtn.textContent = 'Use Demo Resident Credentials';
    } else {
      tabAdmin.style.background = 'var(--color-white)';
      tabAdmin.style.color = 'var(--color-navy)';
      tabAdmin.style.boxShadow = 'var(--shadow-sm)';
      tabResident.style.background = 'transparent';
      tabResident.style.color = 'var(--color-gray-500)';
      tabResident.style.boxShadow = 'none';

      titleEl.textContent = 'Society Admin Sign In';
      subtitleEl.textContent = 'Authorized society committee, facility managers & staff';
      emailLabel.textContent = 'Admin Email';
      emailInput.placeholder = 'admin@society.com';
      emailInput.value = 'admin@society.com';
      passwordInput.value = 'admin123';
      googleText.textContent = 'Sign in with Google (Admin)';
      submitBtn.textContent = 'Sign In to Admin Console';
      regLink.style.display = 'none';
      quickDemoBtn.textContent = 'Use Demo Admin Credentials';
    }
  }

  tabResident.addEventListener('click', () => updateTabState('resident'));
  tabAdmin.addEventListener('click', () => updateTabState('admin'));

  quickDemoBtn.addEventListener('click', () => {
    if (currentTab === 'resident') {
      emailInput.value = 'yaswanth@example.com';
      passwordInput.value = 'password123';
    } else {
      emailInput.value = 'admin@society.com';
      passwordInput.value = 'admin123';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Please enter both email and password.</div>`;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
    errorDiv.innerHTML = '';
    
    try {
      const user = await apiLogin(email, password);
      setCurrentUser(user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} ${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = currentTab === 'resident' ? 'Sign In to Resident Portal' : 'Sign In to Admin Console';
    }
  });

  // Google Sign In Handler
  document.getElementById('google-login-btn')?.addEventListener('click', () => {
    const modalBody = `
      <p style="font-size: var(--font-size-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
        Select a Google account to sign in:
      </p>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        ${currentTab === 'resident' ? `
          <button class="btn btn--secondary" id="g-user-1" style="justify-content: flex-start; height: auto; padding: var(--space-3);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: var(--space-3);">R</div>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: var(--color-gray-900);">Yaswanth Kumar (Resident)</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">yaswanth@example.com • Flat A-404</div>
            </div>
          </button>
          <button class="btn btn--secondary" id="g-user-2" style="justify-content: flex-start; height: auto; padding: var(--space-3);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: var(--space-3);">P</div>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: var(--color-gray-900);">Priya Sharma (Resident)</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">priya@example.com • Flat B-302</div>
            </div>
          </button>
        ` : `
          <button class="btn btn--secondary" id="g-user-3" style="justify-content: flex-start; height: auto; padding: var(--space-3);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #1e3a5f; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: var(--space-3);">A</div>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: var(--color-gray-900);">Society Admin (Manager)</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-gray-500);">admin@society.com • Office</div>
            </div>
          </button>
        `}
      </div>
    `;

    const { close, overlay } = showModal({
      title: currentTab === 'resident' ? 'Sign in with Google (Resident)' : 'Sign in with Google (Admin)',
      body: modalBody
    });

    const handleGoogleSelect = async (account) => {
      close();
      errorDiv.innerHTML = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating with Google…';
      try {
        const user = await apiGoogleAuth(account);
        setCurrentUser(user);
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      } catch (err) {
        errorDiv.innerHTML = `<div class="inline-error">${icon('alertCircle', 16)} Google login failed: ${err.message}</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = currentTab === 'resident' ? 'Sign In to Resident Portal' : 'Sign In to Admin Console';
      }
    };

    overlay.querySelector('#g-user-1')?.addEventListener('click', () => handleGoogleSelect({ name: 'Yaswanth Kumar', email: 'yaswanth@example.com', role: 'resident', flat: 'A-404' }));
    overlay.querySelector('#g-user-2')?.addEventListener('click', () => handleGoogleSelect({ name: 'Priya Sharma', email: 'priya@example.com', role: 'resident', flat: 'B-302' }));
    overlay.querySelector('#g-user-3')?.addEventListener('click', () => handleGoogleSelect({ name: 'Society Admin', email: 'admin@society.com', role: 'admin', flat: 'Office' }));
  });
}
