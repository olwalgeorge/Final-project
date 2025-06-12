/**
 * Utility functions for the Kitoweo Recipe App
 */

// DOM manipulation utilities
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

export function createElement(tag, className = '', attributes = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  return element;
}

// Local storage utilities
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Alert and notification utilities
export function alertMessage(message, scroll = true, duration = 3000) {
  const alert = createElement('div', 'alert');
  alert.innerHTML = `<p>${message}</p><span class="alert-close">&times;</span>`;
  
  // Add to alert container or create one
  let alertContainer = qs('.alert-container');
  if (!alertContainer) {
    alertContainer = createElement('div', 'alert-container');
    document.body.appendChild(alertContainer);
  }
  
  alertContainer.appendChild(alert);
  
  // Auto remove after duration
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert);
    }
  }, duration);
  
  // Manual close
  qs('.alert-close', alert).addEventListener('click', () => {
    alert.parentNode.removeChild(alert);
  });
  
  if (scroll) {
    window.scrollTo(0, 0);
  }
}

// Convert parameter to camelCase for use with templates
export function convertToText(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Render template with data
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.insertAdjacentHTML('afterbegin', template);
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  const template = await response.text();
  return template;
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate('../partials/header.html');
  const footerTemplate = await loadTemplate('../partials/footer.html');
  
  const headerElement = qs('#main-header');
  const footerElement = qs('#main-footer');
  
  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }
  
  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

// Animation utilities
export function animateCSS(element, animationName, callback) {
  const node = typeof element === 'string' ? qs(element) : element;
  node.classList.add('animated', animationName);
  
  function handleAnimationEnd() {
    node.classList.remove('animated', animationName);
    node.removeEventListener('animationend', handleAnimationEnd);
    if (typeof callback === 'function') callback();
  }
  
  node.addEventListener('animationend', handleAnimationEnd);
}
