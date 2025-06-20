/**
 * Header Partial Component
 * Reusable navigation header for all pages
 */

export function createHeader() {
  return `
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="navbar-brand">
            <a href="#home" class="brand-link">
              <span class="brand-icon">🍽️</span>
              <span class="brand-name">Kitoweo</span>
            </a>
          </div>
          
          <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div class="navbar-menu" id="navbar-menu">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a href="#home" class="nav-link" data-page="home">
                  <span class="nav-icon">🏠</span>
                  <span class="nav-text">Home</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#recipes" class="nav-link" data-page="recipes">
                  <span class="nav-icon">🍳</span>
                  <span class="nav-text">Recipes</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#meal-planner" class="nav-link" data-page="meal-planner">
                  <span class="nav-icon">📅</span>
                  <span class="nav-text">Meal Plan</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#shopping-list" class="nav-link" data-page="shopping-list">
                  <span class="nav-icon">🛒</span>
                  <span class="nav-text">Shopping</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#preferences" class="nav-link" data-page="preferences">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  `;
}

export function initializeHeader() {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  if (mobileToggle && navbarMenu) {
    mobileToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }

  // Active page highlighting
  const currentHash = window.location.hash.slice(1) || 'home';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const page = link.getAttribute('data-page');
    if (page === currentHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navbarMenu.classList.contains('active')) {
      navbarMenu.classList.remove('active');
      mobileToggle.classList.remove('active');
    }
  });
}
