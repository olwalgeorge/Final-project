/**
 * Page Template System
 * Manages layout and partial rendering
 */

import { createHeader, initializeHeader } from './partials/header.js';
import { createFooter, initializeFooter } from './partials/footer.js';
import { createLoadingSpinner } from './partials/loading.js';

export class PageTemplate {
  constructor() {
    this.currentPage = null;
    this.isLoading = false;
  }

  /**
   * Render complete page with header, footer, and content
   */
  renderPage(contentHTML, pageClass = '') {
    const app = document.getElementById('app');

    if (!app) {
      console.error('App container not found');
      return;
    }

    app.innerHTML = `
      ${createHeader()}
      <main class="main-content ${pageClass}" id="main-content">
        ${contentHTML}
      </main>
      ${createFooter()}
    `;

    // Initialize components
    this.initializeComponents();
  }

  /**
   * Update only the main content area
   */
  updateContent(contentHTML, pageClass = '') {
    const mainContent = document.getElementById('main-content');

    if (!mainContent) {
      console.error('Main content container not found');
      return;
    }

    mainContent.innerHTML = contentHTML;
    mainContent.className = `main-content ${pageClass}`;

    // Re-initialize components if needed
    this.initializeContentComponents();
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    if (this.isLoading) return;

    this.isLoading = true;
    const mainContent = document.getElementById('main-content');

    if (mainContent) {
      mainContent.innerHTML = createLoadingSpinner(message);
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.isLoading = false;
  }

  /**
   * Initialize all page components
   */
  initializeComponents() {
    this.initializeHeader();
    this.initializeFooter();
    this.initializeContentComponents();
  }

  /**
   * Initialize header component
   */
  initializeHeader() {
    try {
      initializeHeader();
    } catch (error) {
      console.error('Error initializing header:', error);
    }
  }

  /**
   * Initialize footer component
   */
  initializeFooter() {
    try {
      initializeFooter();
    } catch (error) {
      console.error('Error initializing footer:', error);
    }
  }

  /**
   * Initialize content-specific components
   */
  initializeContentComponents() {
    // This can be overridden by specific pages
    // to initialize page-specific functionality
  }

  /**
   * Set page title
   */
  setTitle(title) {
    document.title = title ? `${title} - Kitoweo Recipe App` : 'Kitoweo Recipe App';
  }

  /**
   * Set meta description
   */
  setMetaDescription(description) {
    let metaDescription = document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }

  /**
   * Add page-specific styles
   */
  addPageStyles(styles) {
    const existingStyles = document.getElementById('page-styles');
    if (existingStyles) {
      existingStyles.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'page-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * Remove page-specific styles
   */
  removePageStyles() {
    const existingStyles = document.getElementById('page-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(smooth = true) {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return window.location.hash.slice(1) || 'home';
  }

  /**
   * Navigate to route
   */
  navigateTo(route) {
    window.location.hash = route;
  }
}

// Create singleton instance
export const pageTemplate = new PageTemplate();
export default pageTemplate;
