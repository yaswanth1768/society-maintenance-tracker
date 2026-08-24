// ===== Distinctive Glassmorphic Authentication Portal =====
import { icon } from '../assets/icons.js';
import { apiLogin, apiGoogleAuth } from '../api.js';
import { setCurrentUser } from '../store.js';
import { navigate } from '../router.js';
import { showModal } from '../components/ui/Modal.js';

export async function renderLoginPage() {
  const app = document.getElementById('app');
  app.className = '';
  
  let currentTab = 'resident'; // 'resident' | 'admin'

  app.innerHTML = `
    <div class="auth-portal-container">
      <!-- Ambient Glowing Orbs in Background -->
      <div class="ambient-glow ambient-glow--1"></div>
      <div class="ambient-glow ambient-glow--2"></div>
      <div class="ambient-glow ambient-glow--3"></div>

      <div class="auth-glass-card">
        <!-- Brand Header -->
        <div class="auth-glass-header">
          <div class="auth-glass-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <h1 style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); letter-spacing: -0.02em; color: #ffffff; margin-bottom: 4px;">
            Society Maintenance
          </h1>
          <p style="font-size: var(--font-size-xs); color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
            Next-Gen Residential Operations
          </p>
        </div>

        <!-- Segmented Role Switcher Tabs -->
        <div style="display: flex; background: rgba(0, 0, 0, 0.35); border-radius: var(--radius-lg); padding: 4px; margin-bottom: var(--space-6); border: 1px solid rgba(255, 255, 255, 0.08);">
          <button type="button" id="tab-resident-btn" class="btn" style="flex: 1; height: 38px; border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-xs); background: var(--gradient-primary); color: #ffffff; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">
            ${icon('home', 14)} Resident Portal
          </button>
          <button type="button" id="tab-admin-btn" class="btn" style="flex: 1; height: 38px; border-radius: var(--radius-md); font-weight: 600; font-size: var(--font-size-xs); background: transparent; color: rgba(255,255,255,0.6);">
            ${icon('shieldCheck', 14)} Admin Console
          </button>
        </div>

        <div id="login-error"></div>

        <!-- 1-Click Quick Demo Profiles Switcher -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-5); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);">
          <div style="font-size: var(--font-size-xs); color: rgba(255,255,255,0.6);">
            <strong style="color: #ffffff; display: block;" id="quick-demo-title">Demo Account:</strong>
            <span id="quick-demo-subtitle">Yaswanth (A-404)</span>
          </div>
          <button class="btn btn--sm" id="quick-fill-btn" type="button" style="background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-size: 11px; padding: 4px 10px;">
            ⚡ Quick Fill
          </button>
        </div>

        <!-- Email / Password Login Form -->
        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email" id="login-email-label" style="color: rgba(255,255,255,0.9); font-size: var(--font-size-xs);">Resident Email</label>
            <input class="form-input form-input--dark" type="email" id="login-email" placeholder="yaswanth@example.com" value="yaswanth@example.com" autocomplete="email" required />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="login-password" style="color: rgba(255,255,255,0.9); font-size: var(--font-size-xs);">Password</label>
            <input class="form-input form-input--dark" type="password" id="login-password" placeholder="Enter password" value="password123" autocomplete="current-password" required />
          </div>
          
          <button type="submit" class="btn btn--primary btn--lg btn--full" id="login-submit-btn" style="margin-top: var(--space-4); height: 46px;">
            Sign In to Resident Portal
          </button>
        </form>

        <!-- Google OAuth Simulation -->
        <div style="display: flex; align-items: center; gap: var(--space-3); margin: var(--space-5) 0;">
          <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
          <span style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em;">Or authenticate with</span>
          <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
        </div>

        <button type="button" class="btn btn--secondary btn--full" id="google-login-btn" style="background: rgba(255,255,255,0.06); color: #ffffff; border-color: rgba(255,255,255,0.15); height: 42px;">
          ${icon('google', 18)}
          <span id="google-btn-text" style="font-size: var(--font-size-xs);">Continue with Google Account</span>
        </button>

        <div id="register-link-container" style="text-align: center; margin-top: var(--space-5);">
          <p style="font-size: var(--font-size-xs); color: rgba(255,255,255,0.6);">
            New resident? <a href="#/register" class="link-btn" style="color: var(--color-accent); font-weight: 600;">Create an account</a>
          </p>
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
  const regLink = document.getElementById('register-link-container');
  const tabResident = document.getElementById('tab-resident-btn');
  const tabAdmin = document.getElementById('tab-admin-btn');
  const quickTitle = document.getElementById('quick-demo-title');
  const quickSubtitle = document.getElementById('quick-demo-subtitle');
  const quickFillBtn = document.getElementById('quick-fill-btn');

  function updateTabState(tab) {
    currentTab = tab;
    errorDiv.innerHTML = '';
    
    if (tab === 'resident') {
      tabResident.style.background = 'var(--gradient-primary)';
      tabResident.style.color = '#ffffff';
      tabResident.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
      tabAdmin.style.background = 'transparent';
      tabAdmin.style.color = 'rgba(255,255,255,0.6)';
      tabAdmin.style.boxShadow = 'none';

      emailLabel.textContent = 'Resident Email';
      emailInput.placeholder = 'yaswanth@example.com';
      emailInput.value = 'yaswanth@example.com';
      passwordInput.value = 'password123';
      submitBtn.textContent = 'Sign In to Resident Portal';
      regLink.style.display = 'block';
      quickTitle.textContent = 'Demo Resident:';
      quickSubtitle.textContent = 'Yaswanth (A-404)';
    } else {
      tabAdmin.style.background = 'var(--gradient-primary)';
      tabAdmin.style.color = '#ffffff';
      tabAdmin.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
      tabResident.style.background = 'transparent';
      tabResident.style.color = 'rgba(255,255,255,0.6)';
      tabResident.style.boxShadow = 'none';

      emailLabel.textContent = 'Admin Email';
      emailInput.placeholder = 'admin@society.com';
      emailInput.value = 'admin@society.com';
      passwordInput.value = 'admin123';
      submitBtn.textContent = 'Sign In to Admin Console';
      regLink.style.display = 'none';
      quickTitle.textContent = 'Demo Admin:';
      quickSubtitle.textContent = 'Society Management Office';
    }
  }

  tabResident.addEventListener('click', () => updateTabState('resident'));
  tabAdmin.addEventListener('click', () => updateTabState('admin'));

  quickFillBtn.addEventListener('click', () => {
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
      errorDiv.innerHTML = `<div class="inline-error" style="background: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.4); color: #fecdd3;">${icon('alertCircle', 16)} Please enter both email and password.</div>`;
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating…';
    errorDiv.innerHTML = '';
    
    try {
      const user = await apiLogin(email, password);
      setCurrentUser(user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      errorDiv.innerHTML = `<div class="inline-error" style="background: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.4); color: #fecdd3;">${icon('alertCircle', 16)} ${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = currentTab === 'resident' ? 'Sign In to Resident Portal' : 'Sign In to Admin Console';
    }
  });

  // Google Sign In Simulation Modal
  document.getElementById('google-login-btn')?.addEventListener('click', () => {
    const modalBody = `
      <p style="font-size: var(--font-size-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
        Select an account to sign in securely:
      </p>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        ${currentTab === 'resident' ? `
          <button class="btn btn--secondary" id="g-user-1" style="justify-content: flex-start; height: auto; padding: var(--space-3);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: var(--space-3);">Y</div>
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
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: var(--space-3);">A</div>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: var(--color-gray-900);">Society Management (Admin)</div>
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
      submitBtn.textContent = 'Authenticating…';
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
