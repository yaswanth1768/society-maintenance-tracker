// ===== Utility Functions =====

export function generateId(prefix = 'CMP') {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function formatDate(date, format = 'short') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (format === 'short') {
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  
  if (format === 'full') {
    return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  
  if (format === 'datetime') {
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} • ${h}:${minutes} ${ampm}`;
  }
  
  if (format === 'input') {
    return d.toISOString().split('T')[0];
  }
  
  return d.toLocaleDateString();
}

export function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date, 'short');
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / 86400000);
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '…' : str;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function statusClass(status) {
  const map = {
    'Open': 'open',
    'In Progress': 'in-progress',
    'Resolved': 'resolved',
    'Overdue': 'overdue'
  };
  return map[status] || 'open';
}

export function priorityClass(priority) {
  return (priority || 'low').toLowerCase();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
