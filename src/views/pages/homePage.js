/**
 * Home Page Component
 * Dynamic home page with featured recipes and categories
 */

import { createRecipeGrid, initializeRecipeCards } from '../partials/recipeCard.js';
import { createLoadingSpinner, createSkeletonGrid } from '../partials/loading.js';
import dataService from '../../js/dataService.js';

export class HomePage {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Create home page HTML
   */
  createHomePage() {
    return `
      <section class="hero">
        <div class="container">
          <div class="hero-content text-center">
            <h1 class="hero-title">Find & Plan Your Perfect Meals</h1>
            <p class="hero-description">
              Discover recipes that match your preferences, plan your meals for the week, 
              and generate shopping lists in seconds.
            </p>
            <div class="hero-actions">
              <a href="#recipes" class="btn btn-primary btn-lg">
                🔍 Explore Recipes
              </a>
              <a href="#meal-planner" class="btn btn-secondary btn-lg">
                📅 Start Meal Planning
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-filters">
        <div class="container">
          <h2 class="section-title">Quick Filters</h2>
          <div class="filter-grid">
            <button class="filter-card active" data-filter="all">
              <span class="filter-icon">🍽️</span>
              <span class="filter-name">All Recipes</span>
            </button>
            <button class="filter-card" data-filter="vegetarian">
              <span class="filter-icon">🥬</span>
              <span class="filter-name">Vegetarian</span>
            </button>
            <button class="filter-card" data-filter="quick">
              <span class="filter-icon">⚡</span>
              <span class="filter-name">Quick Meals</span>
            </button>
            <button class="filter-card" data-filter="healthy">
              <span class="filter-icon">💚</span>
              <span class="filter-name">Healthy</span>
            </button>
          </div>
        </div>
      </section>

      <section class="featured-recipes">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Featured Recipes</h2>
            <a href="#recipes" class="section-link">View All →</a>
          </div>
          <div id="featured-recipes-container">
            ${createSkeletonGrid(6)}
          </div>
        </div>
      </section>

      <section class="categories-section">
        <div class="container">
          <h2 class="section-title">Browse by Category</h2>
          <div id="categories-grid" class="categories-grid">
            <!-- Categories will be loaded here -->
          </div>
        </div>
      </section>

      <section class="cuisines-section">
        <div class="container">
          <h2 class="section-title">Explore Cuisines</h2>
          <div id="cuisines-grid" class="cuisines-grid">
            <!-- Cuisines will be loaded here -->
          </div>
        </div>
      </section>

      <section class="app-features">
        <div class="container">
          <h2 class="section-title">Why Choose Kitoweo?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <h3 class="feature-title">Smart Search</h3>
              <p class="feature-description">
                Find recipes by ingredients, diet, cooking time, or cuisine with our intelligent search.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3 class="feature-title">Meal Planning</h3>
              <p class="feature-description">
                Plan your weekly meals with drag-and-drop calendar and auto-generate shopping lists.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛒</div>
              <h3 class="feature-title">Shopping Lists</h3>
              <p class="feature-description">
                Automatically create organized shopping lists from your meal plans and recipes.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3 class="feature-title">Mobile Friendly</h3>
              <p class="feature-description">
                Access your recipes and meal plans anywhere with our responsive mobile design.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Load and display featured recipes
   */
  async loadFeaturedRecipes() {
    try {
      const recipes = await this.dataSource.getFeaturedRecipes(6);
      const container = document.getElementById('featured-recipes-container');

      if (container) {
        container.innerHTML = createRecipeGrid(recipes, 3);
      }
    } catch (error) {
      console.error('Error loading featured recipes:', error);
      const container = document.getElementById('featured-recipes-container');
      if (container) {
        container.innerHTML = `
          <div class="error-message">
            <p>Unable to load featured recipes. Please try again later.</p>
          </div>
        `;
      }
    }
  }

  /**
   * Load and display categories
   */
  async loadCategories() {
    try {
      const data = await dataService.loadCategories();
      const categories = data.categories;
      const container = document.getElementById('categories-grid');

      if (container && categories) {
        container.innerHTML = categories
          .map(
            (category) => `
          <div class="category-card" data-category="${category.id}" title="${category.description || ''}">
            <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
            <h3 class="category-name">${category.name}</h3>
          </div>
        `
          )
          .join('');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to mock data structure
      try {
        const mockData = await dataService.loadMockData();
        const categories = mockData.categories;
        const container = document.getElementById('categories-grid');

        if (container && categories) {
          container.innerHTML = categories
            .map(
              (category) => `
            <div class="category-card" data-category="${category.id}">
              <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
              <h3 class="category-name">${category.name}</h3>
            </div>
          `
            )
            .join('');
        }
      } catch (fallbackError) {
        console.error('Error loading categories fallback:', fallbackError);
      }
    }
  }
  /**
   * Load and display cuisines
   */
  async loadCuisines() {
    try {
      const data = await dataService.loadCuisines();
      const cuisines = data.cuisines;
      const container = document.getElementById('cuisines-grid');

      if (container && cuisines) {
        container.innerHTML = cuisines
          .map(
            (cuisine) => `
          <div class="cuisine-card" data-cuisine="${cuisine.id}" title="${cuisine.description || ''}">
            <div class="cuisine-flag">${cuisine.flag}</div>
            <h3 class="cuisine-name">${cuisine.name}</h3>
          </div>
        `
          )
          .join('');
      }
    } catch (error) {
      console.error('Error loading cuisines:', error);
      // Fallback to mock data structure
      try {
        const mockData = await dataService.loadMockData();
        const cuisines = mockData.cuisines;
        const container = document.getElementById('cuisines-grid');

        if (container && cuisines) {
          container.innerHTML = cuisines
            .map(
              (cuisine) => `
            <div class="cuisine-card" data-cuisine="${cuisine.id}">
              <div class="cuisine-flag">${cuisine.flag}</div>
              <h3 class="cuisine-name">${cuisine.name}</h3>
            </div>
          `
            )
            .join('');
        }
      } catch (fallbackError) {
        console.error('Error loading cuisines fallback:', fallbackError);
      }
    }
  }

  /**
   * Initialize home page interactions
   */
  initializeHomePage() {
    // Initialize recipe cards
    initializeRecipeCards();

    // Quick filter buttons
    const filterCards = document.querySelectorAll('.filter-card');
    filterCards.forEach((card) => {
      card.addEventListener('click', () => {
        // Remove active class from all cards
        filterCards.forEach((c) => c.classList.remove('active'));
        // Add active class to clicked card
        card.classList.add('active');

        const filter = card.getAttribute('data-filter');
        this.handleQuickFilter(filter);
      });
    });

    // Category navigation
    document.addEventListener('click', (e) => {
      const categoryCard = e.target.closest('.category-card');
      if (categoryCard) {
        const category = categoryCard.getAttribute('data-category');
        window.location.hash = `recipes?category=${category}`;
      }
    });

    // Cuisine navigation
    document.addEventListener('click', (e) => {
      const cuisineCard = e.target.closest('.cuisine-card');
      if (cuisineCard) {
        const cuisine = cuisineCard.getAttribute('data-cuisine');
        window.location.hash = `recipes?cuisine=${cuisine}`;
      }
    });

    // Load dynamic content
    this.loadFeaturedRecipes();
    this.loadCategories();
    this.loadCuisines();
  }

  /**
   * Handle quick filter selection
   */
  handleQuickFilter(filter) {
    switch (filter) {
      case 'all':
        window.location.hash = 'recipes';
        break;
      case 'vegetarian':
        window.location.hash = 'recipes?diet=vegetarian';
        break;
      case 'quick':
        window.location.hash = 'recipes?time=quick';
        break;
      case 'healthy':
        window.location.hash = 'recipes?tags=healthy';
        break;
      default:
        window.location.hash = 'recipes';
    }
  }
}

export default HomePage;
