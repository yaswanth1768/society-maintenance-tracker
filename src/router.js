// ===== Hash-based SPA Router =====
import { getCurrentUser, isAuthenticated, isAdmin } from './store.js';

const routes = [];
let currentCleanup = null;

export function addRoute(path, handler, options = {}) {
  routes.push({ path, handler, ...options });
}

export function navigate(path) {
  window.location.hash = path;
}

export function getHash() {
  return window.location.hash.slice(1) || '/login';
}

export function getRouteParams() {
  const hash = getHash();
  for (const route of routes) {
    const match = matchRoute(route.path, hash);
    if (match) return match.params;
  }
  return {};
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  if (patternParts.length !== pathParts.length) return null;
  
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return { params };
}

export function initRouter() {
  async function handleRoute() {
    const hash = getHash();
    
    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }
    
    for (const route of routes) {
      const match = matchRoute(route.path, hash);
      if (match) {
        // Auth guard
        if (route.requireAuth && !isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Role guard
        if (route.role === 'admin' && !isAdmin()) {
          navigate('/dashboard');
          return;
        }
        
        if (route.role === 'resident' && isAdmin()) {
          navigate('/admin/dashboard');
          return;
        }
        
        // Guest guard (login/register should redirect if already logged in)
        if (route.guest && isAuthenticated()) {
          navigate(isAdmin() ? '/admin/dashboard' : '/dashboard');
          return;
        }
        
        try {
          currentCleanup = await route.handler(match.params);
        } catch (err) {
          console.error('Route error:', err);
        }
        return;
      }
    }
    
    // No route matched — redirect
    if (isAuthenticated()) {
      navigate(isAdmin() ? '/admin/dashboard' : '/dashboard');
    } else {
      navigate('/login');
    }
  }
  
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
