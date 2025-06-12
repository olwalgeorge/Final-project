/**
 * Navigation class for handling menu interactions
 */

export default class Navigation {
  constructor() {
    this.mobileMenuOpen = false;
  }

  init() {
    this.setupMobileMenu();
    this.setupNavigationEvents();
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }
  }

  setupNavigationEvents() {
    // Logo click
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#home';
      });
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    if (this.mobileMenuOpen) {
      this.showMobileMenu();
    } else {
      this.hideMobileMenu();
    }
  }

  showMobileMenu() {
    // For now, just log - will implement actual mobile menu later
    console.log('Mobile menu opened');
  }

  hideMobileMenu() {
    // For now, just log - will implement actual mobile menu later
    console.log('Mobile menu closed');
  }
}
