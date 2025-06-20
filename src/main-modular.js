/**
 * Kitoweo Recipe App - Main Entry Point (Modular Version)
 * Vanilla JavaScript application using modular components and dynamic data loading
 */

import { qs } from './js/utils.js';
import RecipeDataSource from './js/recipeData.js';
import Recipe from './js/recipe.js';
import Router from './js/router.js';
import MealPlanner from './js/mealPlanner.js';
import APISettings from './js/apiSettings.js';

// Import modular components
import { pageTemplate } from './views/pageTemplate.js';
import HomePage from './views/pages/homePage.js';
import dataService from './js/dataService.js';
import { initializeRecipeCards } from './views/partials/recipeCard.js';

/**
 * Main Application Class
 */
class KitoweoApp {
  constructor() {
    this.dataSource = new RecipeDataSource();
    this.recipe = new Recipe(this.dataSource);
    this.router = new Router();
    this.mealPlanner = new MealPlanner(this.dataSource);
    this.apiSettings = new APISettings(this.dataSource);

    // Page components
    this.homePage = new HomePage(this.dataSource);

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Kitoweo Recipe App...');

      // Initialize router
      this.setupRouting();

      // Load initial page
      const currentRoute = pageTemplate.getCurrentRoute();
      await this.handleRoute(currentRoute);

      console.log('✅ Kitoweo app initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      this.showErrorPage(error);
    }
  }

  /**
   * Setup client-side routing
   */
  setupRouting() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const route = pageTemplate.getCurrentRoute();
      this.handleRoute(route);
    });

    // Handle initial route
    window.addEventListener('load', () => {
      const route = pageTemplate.getCurrentRoute();
      this.handleRoute(route);
    });
  }

  /**
   * Handle route changes
   */
  async handleRoute(route) {
    console.log(`📍 Navigating to route: ${route}`);

    try {
      pageTemplate.showLoading('Loading page...');

      const [mainRoute, ...params] = route.split('/');
      const queryParams = this.parseQueryParams(route);

      switch (mainRoute) {
        case 'home':
        case '':
          await this.loadHomePage();
          break;
        case 'recipes':
          await this.loadRecipesPage(queryParams);
          break;
        case 'recipe':
          await this.loadRecipeDetail(params[0]);
          break;
        case 'meal-planner':
          await this.loadMealPlannerPage();
          break;
        case 'shopping-list':
          await this.loadShoppingListPage();
          break;
        case 'preferences':
          await this.loadPreferencesPage();
          break;
        default:
          await this.load404Page();
      }

      pageTemplate.hideLoading();
      pageTemplate.scrollToTop();
    } catch (error) {
      console.error('❌ Error handling route:', error);
      this.showErrorPage(error);
    }
  }

  /**
   * Parse query parameters from URL
   */
  parseQueryParams(url) {
    const params = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      queryString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    return params;
  }

  /**
   * Load Home Page
   */
  async loadHomePage() {
    try {
      pageTemplate.setTitle('Home');
      pageTemplate.setMetaDescription(
        'Find amazing recipes, plan your meals, and make cooking enjoyable with Kitoweo Recipe App.'
      );

      const content = this.homePage.createHomePage();
      pageTemplate.renderPage(content, 'home-page');

      // Initialize page-specific functionality
      this.homePage.initializeHomePage();
    } catch (error) {
      console.error('Error loading home page:', error);
      throw error;
    }
  }

  /**
   * Load Recipes Page
   */
  async loadRecipesPage(queryParams = {}) {
    try {
      pageTemplate.setTitle('Recipes');
      pageTemplate.setMetaDescription(
        'Browse and search through thousands of delicious recipes from around the world.'
      );

      const content = this.createRecipesPageHTML();
      pageTemplate.renderPage(content, 'recipes-page');

      // Initialize recipes page
      await this.initializeRecipesPage();

      // Apply filters from query params
      if (Object.keys(queryParams).length > 0) {
        await this.applyFiltersFromParams(queryParams);
      } else {
        await this.loadRecipes();
      }
    } catch (error) {
      console.error('Error loading recipes page:', error);
      throw error;
    }
  }

  /**
   * Create Recipes Page HTML
   */
  createRecipesPageHTML() {
    return `
      <section class="recipes-hero">
        <div class="container">
          <div class="hero-content text-center">
            <h1>Discover Amazing Recipes</h1>
            <p class="text-secondary">Search through thousands of delicious recipes and find your next favorite meal</p>
          </div>
        </div>
      </section>

      <section class="search-section">
        <div class="container">
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <input 
                type="text" 
                id="recipe-search" 
                class="search-input" 
                placeholder="Search for recipes, ingredients, or cuisines..."
                autocomplete="off"
              >
              <button class="search-btn" id="search-btn">
                <span class="search-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="filters-section">
        <div class="container">
          <div class="filters-container">
            <div class="filter-group">
              <h3>Meal Type</h3>
              <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all" data-type="meal">All</button>
                <button class="filter-btn" data-filter="breakfast" data-type="meal">Breakfast</button>
                <button class="filter-btn" data-filter="lunch" data-type="meal">Lunch</button>
                <button class="filter-btn" data-filter="dinner" data-type="meal">Dinner</button>
                <button class="filter-btn" data-filter="dessert" data-type="meal">Dessert</button>
                <button class="filter-btn" data-filter="snack" data-type="meal">Snacks</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Diet</h3>
              <div class="filter-buttons">
                <button class="filter-btn" data-filter="vegetarian" data-type="diet">Vegetarian</button>
                <button class="filter-btn" data-filter="vegan" data-type="diet">Vegan</button>
                <button class="filter-btn" data-filter="gluten-free" data-type="diet">Gluten-Free</button>
                <button class="filter-btn" data-filter="keto" data-type="diet">Keto</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Cooking Time</h3>
              <div class="filter-buttons">
                <button class="filter-btn" data-filter="quick" data-type="time">Under 30 min</button>
                <button class="filter-btn" data-filter="medium" data-type="time">30-60 min</button>
                <button class="filter-btn" data-filter="long" data-type="time">Over 60 min</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Sort By</h3>
              <select id="sort-select" class="sort-select">
                <option value="relevance">Relevance</option>
                <option value="time">Cooking Time</option>
                <option value="calories">Calories</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="results-section">
        <div class="container">
          <div class="results-header">
            <h2 id="results-title">All Recipes</h2>
            <div class="results-meta">
              <span id="results-count">Loading...</span>
            </div>
          </div>
          <div id="recipes-grid" class="recipes-grid">
            <!-- Recipes will be loaded here -->
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Load Recipe Detail Page
   */
  async loadRecipeDetail(recipeId) {
    // This would be the same as before, but using pageTemplate
    try {
      pageTemplate.setTitle('Recipe Details');

      const content = `
        <div class="container">
          <h1>Recipe Detail</h1>
          <p>Recipe ID: ${recipeId}</p>
          <p>Dynamic recipe detail implementation coming from modular components!</p>
          <a href="#recipes" class="btn btn-primary">Back to Recipes</a>
        </div>
      `;

      pageTemplate.renderPage(content, 'recipe-detail-page');
    } catch (error) {
      console.error('Error loading recipe detail:', error);
      throw error;
    }
  }

  /**
   * Load other pages (keeping existing functionality for now)
   */
  async loadMealPlannerPage() {
    pageTemplate.setTitle('Meal Planner');
    const content = `
      <div class="container">
        <h1>Meal Planner</h1>
        <p>Meal planning functionality (existing implementation)</p>
      </div>
    `;
    pageTemplate.renderPage(content, 'meal-planner-page');
  }

  async loadShoppingListPage() {
    pageTemplate.setTitle('Shopping List');
    const content = `
      <div class="container">
        <h1>Shopping List</h1>
        <p>Shopping list functionality (existing implementation)</p>
      </div>
    `;
    pageTemplate.renderPage(content, 'shopping-list-page');
  }

  async loadPreferencesPage() {
    pageTemplate.setTitle('Settings');
    const content = `
      <div class="container">
        <h1>Settings</h1>
        <p>Settings and preferences (existing implementation)</p>
      </div>
    `;
    pageTemplate.renderPage(content, 'preferences-page');
  }

  async load404Page() {
    pageTemplate.setTitle('Page Not Found');
    const content = `
      <div class="container text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#home" class="btn btn-primary">Go Home</a>
      </div>
    `;
    pageTemplate.renderPage(content, 'error-page');
  }

  /**
   * Show error page
   */
  showErrorPage(error) {
    pageTemplate.setTitle('Error');
    const content = `
      <div class="container text-center">
        <h1>Something went wrong</h1>
        <p>We're sorry, but something went wrong. Please try again.</p>
        <pre class="error-details">${error.message}</pre>
        <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
      </div>
    `;
    pageTemplate.renderPage(content, 'error-page');
  }

  /**
   * Placeholder methods for existing functionality
   */
  async initializeRecipesPage() {
    // Initialize search and filters
    initializeRecipeCards();
    // Add existing recipes page logic here
  }

  async loadRecipes() {
    // Load recipes using existing logic
    console.log('Loading recipes...');
  }

  async applyFiltersFromParams(params) {
    // Apply filters from URL parameters
    console.log('Applying filters:', params);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new KitoweoApp();

  // Expose app for testing in browser console
  window.kitoweoApp = app;

  // Add console helper message
  console.log('🍳 Kitoweo Recipe App loaded with modular architecture!');
  console.log('💡 New features: Partial views, JSON data, dynamic loading');
  console.log('💡 Access app instance via "window.kitoweoApp"');
});
