/**
 * Kitoweo Recipe App - Main Entry Point
 * Vanilla JavaScript application using ES6 modules and clean architecture
 */

import './style.css';
import { qs } from './js/utils.js';
import RecipeDataSource from './js/recipeData.js';
import Recipe from './js/recipe.js';

// App state
class KitoweoApp {
  constructor() {
    this.dataSource = new RecipeDataSource();
    this.recipe = new Recipe(this.dataSource);
    
    this.init();
  }

  async init() {
    try {
      // Initialize the main app container
      this.setupAppContainer();
      
      // Load initial content
      await this.loadHomePage();
      
      console.log('Kitoweo app initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  setupAppContainer() {
    const app = qs('#app');
    app.innerHTML = `
      <div class="app">
        <!-- Navigation will be inserted here -->
        <nav class="navbar">
          <div class="container navbar-content">
            <a href="#" class="logo">Kitoweo</a>
            <button class="mobile-menu-btn">☰</button>
          </div>
        </nav>
        
        <!-- Main content area -->
        <main id="main-content" class="main-content">
          <!-- Dynamic content will be loaded here -->
        </main>
        
        <!-- Footer will be inserted here -->
      </div>
    `;
  }

  async loadHomePage() {
    try {
      const mainContent = qs('#main-content');
      
      // Create home page HTML
      mainContent.innerHTML = `
        <section class="hero">
          <div class="container">
            <div class="hero-content text-center">
              <h1>Find & Plan Your Perfect Meals</h1>
              <p class="text-secondary">Discover recipes that match your preferences, plan your meals for the week, and generate shopping lists in seconds.</p>
              <div class="hero-actions flex justify-center gap-md">
                <button class="btn btn-primary explore-recipes-btn">Explore Recipes</button>
                <button class="btn btn-secondary meal-plan-btn">Start Meal Planning</button>
              </div>
            </div>
          </div>
        </section>
        
        <section class="filters p-lg">
          <div class="container">
            <h2>Quick Filters</h2>
            <div class="filter-buttons flex gap-sm">
              <button class="btn btn-ghost filter-btn active" data-filter="all">All Recipes</button>
              <button class="btn btn-ghost filter-btn" data-filter="vegetarian">Vegetarian</button>
              <button class="btn btn-ghost filter-btn" data-filter="vegan">Vegan</button>
              <button class="btn btn-ghost filter-btn" data-filter="gluten-free">Gluten-Free</button>
            </div>
          </div>
        </section>
        
        <section class="featured-recipes p-lg">
          <div class="container">
            <h2>Featured Recipes</h2>
            <div id="featured-recipes" class="grid grid-md-3 gap-lg">
              <!-- Recipes will be loaded here -->
            </div>
          </div>
        </section>
        
        <section class="categories p-lg">
          <div class="container">
            <h2>Browse by Category</h2>
            <div class="categories-grid grid grid-lg-6 gap-md">
              <div class="category-card card text-center category-btn" data-category="breakfast">
                <div class="card-body">
                  <div class="category-icon">🍳</div>
                  <h3>Breakfast</h3>
                </div>
              </div>
              <div class="category-card card text-center category-btn" data-category="lunch">
                <div class="card-body">
                  <div class="category-icon">🥗</div>
                  <h3>Lunch</h3>
                </div>
              </div>
              <div class="category-card card text-center category-btn" data-category="dinner">
                <div class="card-body">
                  <div class="category-icon">🍽️</div>
                  <h3>Dinner</h3>
                </div>
              </div>
              <div class="category-card card text-center category-btn" data-category="dessert">
                <div class="card-body">
                  <div class="category-icon">🍰</div>
                  <h3>Desserts</h3>
                </div>
              </div>
              <div class="category-card card text-center category-btn" data-category="snack">
                <div class="card-body">
                  <div class="category-icon">🥨</div>
                  <h3>Snacks</h3>
                </div>
              </div>
              <div class="category-card card text-center category-btn" data-category="drink">
                <div class="card-body">
                  <div class="category-icon">🥤</div>
                  <h3>Drinks</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
      
      // Load featured recipes
      const featuredRecipes = await this.dataSource.getFeaturedRecipes(3);
      const featuredContainer = qs('#featured-recipes');
      await this.recipe.renderRecipeList(featuredRecipes, featuredContainer);
      
      // Initialize home page interactions
      this.initializeHomePageEvents();
      
    } catch (error) {
      console.error('Error loading home page:', error);
    }
  }

  initializeHomePageEvents() {
    // Quick filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter value
        const filter = button.getAttribute('data-filter');
        
        if (filter === 'all') {
          // Show all recipes
          const allRecipes = await this.dataSource.getAllRecipes();
          this.recipe.renderRecipeList(allRecipes, '#featured-recipes');
        } else {
          // Filter recipes
          const filteredRecipes = await this.dataSource.searchRecipes('', {
            dietaryInfo: [filter]
          });
          this.recipe.renderRecipeList(filteredRecipes, '#featured-recipes');
        }
      });
    });

    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const category = button.getAttribute('data-category');
        console.log(`Clicked category: ${category}`);
        
        // For now, just show alert - will implement navigation later
        alert(`Loading ${category} recipes...`);
      });
    });

    // CTA buttons
    const exploreBtn = qs('.explore-recipes-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        alert('Explore Recipes clicked - will navigate to recipes page');
      });
    }

    const mealPlanBtn = qs('.meal-plan-btn');
    if (mealPlanBtn) {
      mealPlanBtn.addEventListener('click', () => {
        alert('Meal Planning clicked - will navigate to meal planner');
      });
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new KitoweoApp();
});
