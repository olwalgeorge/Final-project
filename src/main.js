/**
 * Kitoweo Recipe App - Main Entry Point
 * Vanilla JavaScript application using ES6 modules and clean architecture
 */

import './style.css';
import { qs } from './js/utils.js';
import RecipeDataSource from './js/recipeData.js';
import Recipe from './js/recipe.js';
import Router from './js/router.js';
import MealPlanner from './js/mealPlanner.js';
import APISettings from './js/apiSettings.js';

// App state
class KitoweoApp {
  constructor() {
    this.dataSource = new RecipeDataSource();
    this.recipe = new Recipe(this.dataSource);
    this.router = new Router();
    this.mealPlanner = new MealPlanner(this.dataSource);
    this.apiSettings = new APISettings(this.dataSource);

    this.init();
  }

  async init() {
    try {
      // Initialize the main app container
      this.setupAppContainer();

      // Setup routing
      this.setupRouting();

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
        <!-- Navigation -->
        <nav class="navbar">
          <div class="container navbar-content">
            <a href="#home" class="logo">Kitoweo</a>            <div class="nav-links">
              <a href="#home" class="nav-link">Home</a>
              <a href="#recipes" class="nav-link">Recipes</a>
              <a href="#meal-planner" class="nav-link">Meal Planner</a>
              <a href="#shopping-list" class="nav-link">Shopping List</a>
              <a href="#settings" class="nav-link">Settings</a>
            </div>
            <button class="mobile-menu-btn">☰</button>
          </div>
        </nav>
        
        <!-- Main content area -->
        <main id="main-content" class="main-content">
          <!-- Dynamic content will be loaded here -->
        </main>
        
        <!-- Footer -->
        <footer class="footer">
          <div class="container">
            <p>&copy; 2025 Kitoweo. Find your perfect meal.</p>
          </div>
        </footer>
      </div>
    `;
  }

  setupRouting() {
    // Setup hash-based navigation
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });

    // Handle initial route
    this.handleRouteChange();
  }
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const [route, ...params] = hash.split('/');

    // Parse query parameters
    let queryParams = {};
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const queryString = hash.slice(queryIndex + 1);
      queryParams = this.parseQueryParams(queryString);
    }

    // Update active nav link
    this.updateActiveNavLink(route);

    switch (route) {
      case 'home':
        this.loadHomePage();
        break;
      case 'recipes':
        this.loadRecipesPage(queryParams);
        break;
      case 'meal-planner':
        this.loadMealPlannerPage();
        break;
      case 'shopping-list':
        this.loadShoppingListPage();
        break;
      case 'settings':
        this.loadSettingsPage();
        break;
      case 'recipe':
        if (params[0]) {
          this.loadRecipeDetail(params[0]);
        }
        break;
      default:
        this.loadHomePage();
    }
  }

  parseQueryParams(queryString) {
    const params = {};
    const pairs = queryString.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }

    return params;
  }

  updateActiveNavLink(route) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${route}`) {
        link.classList.add('active');
      }
    });
  }

  async loadRecipesPage(queryParams = {}) {
    try {
      const mainContent = qs('#main-content');

      mainContent.innerHTML = `
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
                  <button class="filter-btn" data-filter="paleo" data-type="diet">Paleo</button>
                </div>
              </div>

              <div class="filter-group">
                <h3>Cooking Time</h3>
                <div class="filter-buttons">
                  <button class="filter-btn" data-filter="quick" data-type="time">Under 30min</button>
                  <button class="filter-btn" data-filter="medium" data-type="time">30-60min</button>
                  <button class="filter-btn" data-filter="long" data-type="time">Over 1hr</button>
                </div>
              </div>

              <div class="filter-group">
                <h3>Sort By</h3>
                <select class="sort-select" id="sort-select">
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
              <div class="results-info">
                <span id="results-count">Loading...</span>
                <div class="view-toggle">
                  <button class="view-btn active" data-view="grid">
                    <span class="icon">⊞</span>
                  </button>
                  <button class="view-btn" data-view="list">
                    <span class="icon">☰</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="loading-spinner" id="loading-spinner">
              <div class="spinner"></div>
              <p>Finding delicious recipes...</p>
            </div>

            <div id="recipes-grid" class="recipes-grid grid grid-md-3 gap-lg">
              <!-- Recipes will be loaded here -->
            </div>

            <div class="pagination" id="pagination">
              <!-- Pagination will be added here -->
            </div>
          </div>
        </section>
      `; // Initialize recipes page functionality
      this.initializeRecipesPage();

      // Load initial recipes with any query parameters
      await this.loadRecipes('', queryParams);
    } catch (error) {
      console.error('Error loading recipes page:', error);
    }
  }

  async initializeRecipesPage() {
    // Search functionality
    const searchInput = qs('#recipe-search');
    const searchBtn = qs('#search-btn');

    const performSearch = async () => {
      const query = searchInput.value.trim();
      await this.loadRecipes(query);
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();

        const filterType = button.getAttribute('data-type');
        const filterValue = button.getAttribute('data-filter');

        // Handle meal type filters (single selection)
        if (filterType === 'meal') {
          document
            .querySelectorAll('[data-type="meal"]')
            .forEach((btn) => btn.classList.remove('active'));
        }

        // Toggle active state
        button.classList.toggle('active');

        // Apply filters
        await this.applyFilters();
      });
    });

    // Sort dropdown
    const sortSelect = qs('#sort-select');
    sortSelect.addEventListener('change', async () => {
      await this.applyFilters();
    });

    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        viewButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        const view = button.getAttribute('data-view');
        const recipesGrid = qs('#recipes-grid');

        if (view === 'list') {
          recipesGrid.classList.add('list-view');
        } else {
          recipesGrid.classList.remove('list-view');
        }
      });
    });
  }
  async loadRecipes(searchQuery = '', initialParams = {}) {
    try {
      const loadingSpinner = qs('#loading-spinner');
      const recipesGrid = qs('#recipes-grid');
      const resultsCount = qs('#results-count');

      // Show loading state
      loadingSpinner.style.display = 'block';
      recipesGrid.style.display = 'none';

      // Build search options for API
      const searchOptions = this.buildSearchOptions(initialParams);

      // Get recipes based on search query
      let recipes;
      if (searchQuery) {
        recipes = await this.dataSource.searchRecipes(searchQuery, searchOptions);
        qs('#results-title').textContent = `Search Results for "${searchQuery}"`;
      } else {
        recipes = await this.dataSource.getAllRecipes();
        qs('#results-title').textContent = 'All Recipes';
      }

      // Apply any initial category filter
      if (initialParams.category) {
        // Set the appropriate meal filter button as active
        document
          .querySelectorAll('[data-type="meal"]')
          .forEach((btn) => btn.classList.remove('active'));

        const categoryBtn = document.querySelector(
          `[data-filter="${initialParams.category}"][data-type="meal"]`
        );
        if (categoryBtn) {
          categoryBtn.classList.add('active');
        }
      }

      // Apply current UI filters if using mock data or as additional filtering
      if (!this.dataSource.useAPI || searchOptions.additionalFiltering) {
        recipes = this.filterRecipes(recipes);
      }

      // Update results count
      resultsCount.textContent = `${recipes.length} recipes found`;

      // Render recipes
      await this.recipe.renderRecipeList(recipes, recipesGrid);

      // Hide loading and show results
      loadingSpinner.style.display = 'none';
      recipesGrid.style.display = 'grid';
    } catch (error) {
      console.error('Error loading recipes:', error);

      const loadingSpinner = qs('#loading-spinner');
      loadingSpinner.innerHTML = `
        <div class="error-state">
          <p>Sorry, we couldn't load the recipes. ${error.message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Build search options for Spoonacular API based on current filters
   */
  buildSearchOptions(initialParams = {}) {
    const options = {};

    // Get active filters from UI
    const activeMealFilter = document.querySelector('[data-type="meal"].active');
    const activeDietFilters = document.querySelectorAll('[data-type="diet"].active');
    const activeTimeFilter = document.querySelector('[data-type="time"].active');
    const sortValue = qs('#sort-select')?.value || 'relevance';

    // Map meal type filter to Spoonacular API
    if (activeMealFilter && activeMealFilter.getAttribute('data-filter') !== 'all') {
      const mealType = activeMealFilter.getAttribute('data-filter');
      options.type = mealType;
    } else if (initialParams.category) {
      options.type = initialParams.category;
    }

    // Map diet filters to Spoonacular API
    if (activeDietFilters.length > 0) {
      const dietTypes = Array.from(activeDietFilters).map((btn) => {
        const filter = btn.getAttribute('data-filter');
        // Map our filter names to Spoonacular diet names
        switch (filter) {
          case 'gluten-free':
            return 'glutenFree';
          case 'keto':
            return 'ketogenic';
          default:
            return filter;
        }
      });
      options.diet = dietTypes.join(',');
    }

    // Map time filter to Spoonacular API
    if (activeTimeFilter) {
      const timeFilter = activeTimeFilter.getAttribute('data-filter');
      switch (timeFilter) {
        case 'quick':
          options.maxReadyTime = 30;
          break;
        case 'medium':
          options.maxReadyTime = 60;
          break;
        case 'long':
          // For "long" recipes, we don't set a max time
          break;
      }
    }

    // Map sort options to Spoonacular API
    switch (sortValue) {
      case 'time':
        options.sort = 'time';
        break;
      case 'calories':
        options.sort = 'calories';
        break;
      case 'rating':
        options.sort = 'popularity';
        break;
      default:
        options.sort = 'relevance';
        break;
    }

    return options;
  }

  async applyFilters() {
    const searchQuery = qs('#recipe-search').value.trim();
    await this.loadRecipes(searchQuery);
  }

  filterRecipes(recipes) {
    let filteredRecipes = [...recipes];

    // Get active filters
    const activeMealFilter = document.querySelector('[data-type="meal"].active');
    const activeDietFilters = document.querySelectorAll('[data-type="diet"].active');
    const activeTimeFilter = document.querySelector('[data-type="time"].active');
    const sortValue = qs('#sort-select').value;

    // Apply meal type filter
    if (activeMealFilter && activeMealFilter.getAttribute('data-filter') !== 'all') {
      const mealType = activeMealFilter.getAttribute('data-filter');
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.category.toLowerCase() === mealType.toLowerCase()
      );
    }

    // Apply diet filters
    if (activeDietFilters.length > 0) {
      const dietTypes = Array.from(activeDietFilters).map((btn) => btn.getAttribute('data-filter'));

      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.dietaryInfo.some((diet) => dietTypes.includes(diet.toLowerCase()))
      );
    }

    // Apply time filter
    if (activeTimeFilter) {
      const timeFilter = activeTimeFilter.getAttribute('data-filter');
      filteredRecipes = filteredRecipes.filter((recipe) => {
        const cookingTime = parseInt(recipe.cookingTime);
        switch (timeFilter) {
          case 'quick':
            return cookingTime < 30;
          case 'medium':
            return cookingTime >= 30 && cookingTime <= 60;
          case 'long':
            return cookingTime > 60;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortValue) {
      case 'time':
        filteredRecipes.sort((a, b) => parseInt(a.cookingTime) - parseInt(b.cookingTime));
        break;
      case 'calories':
        filteredRecipes.sort((a, b) => parseInt(a.calories) - parseInt(b.calories));
        break;
      case 'rating':
        filteredRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filteredRecipes;
  }
  async loadMealPlannerPage() {
    try {
      const mainContent = qs('#main-content');

      mainContent.innerHTML = `
        <section class="meal-planner-hero">
          <div class="container">
            <div class="hero-content text-center">
              <h1>Weekly Meal Planner</h1>
              <p class="text-secondary">Plan your meals for the week, organize your cooking schedule, and generate shopping lists automatically</p>
            </div>
          </div>
        </section>

        <section class="meal-planner-section">
          <div class="container">
            <div class="meal-planner-container">
              <!-- Meal planner will be rendered here -->
            </div>
          </div>
        </section>
      `;

      // Initialize and render the meal planner
      await this.mealPlanner.renderMealPlanner('.meal-planner-container');
    } catch (error) {
      console.error('Error loading meal planner page:', error);

      const mainContent = qs('#main-content');
      mainContent.innerHTML = `
        <section class="error-section">
          <div class="container text-center">
            <h1>Oops! Something went wrong</h1>
            <p>We couldn't load the meal planner. Please try again.</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button>
          </div>
        </section>
      `;
    }
  }

  async loadRecipeDetail(recipeId) {
    const mainContent = qs('#main-content');
    mainContent.innerHTML = `
      <section class="recipe-detail">
        <div class="container">
          <h1>Recipe Detail</h1>
          <p>Recipe ID: ${recipeId}</p>
          <p>Detailed recipe view coming soon!</p>
          <a href="#recipes" class="btn btn-primary">Back to Recipes</a>
        </div>
      </section>
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
              <p class="text-secondary">Discover recipes that match your preferences, plan your meals for the week, and generate shopping lists in seconds.</p>              <div class="hero-actions flex justify-center gap-md">
                <a href="#recipes" class="btn btn-primary explore-recipes-btn">Explore Recipes</a>
                <a href="#meal-planner" class="btn btn-secondary meal-plan-btn">Start Meal Planning</a>
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
    filterButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();

        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove('active'));

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
            dietaryInfo: [filter],
          });
          this.recipe.renderRecipeList(filteredRecipes, '#featured-recipes');
        }
      });
    }); // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();

        const category = button.getAttribute('data-category');
        console.log(`Clicked category: ${category}`);

        // Navigate to recipes page with category filter
        window.location.hash = `#recipes?category=${category}`;
      });
    });
  }

  async loadShoppingListPage() {
    try {
      const mainContent = qs('#main-content');

      // Get ingredients from meal planner
      const ingredients = this.mealPlanner.extractIngredientsFromWeek();

      mainContent.innerHTML = `
        <section class="shopping-list-hero">
          <div class="container">
            <div class="hero-content text-center">
              <h1>Shopping List</h1>
              <p class="text-secondary">Your automatically generated shopping list based on this week's meal plan</p>
            </div>
          </div>
        </section>

        <section class="shopping-list-section">
          <div class="container">
            <div class="shopping-list-container">
              <div class="shopping-list-header">
                <h2>Week of ${this.mealPlanner.getWeekDisplayText()}</h2>
                <div class="shopping-actions">
                  <button class="btn btn-secondary" onclick="window.print()">Print List</button>
                  <a href="#meal-planner" class="btn btn-primary">Back to Meal Planner</a>
                </div>
              </div>
              
              ${
                ingredients.length > 0
                  ? `
                <div class="shopping-list">
                  <div class="ingredient-categories">
                    ${this.renderIngredientCategories(ingredients)}
                  </div>
                </div>
              `
                  : `
                <div class="empty-shopping-list">
                  <div class="empty-state">
                    <h3>No items in your shopping list</h3>
                    <p>Add some meals to your meal plan to generate a shopping list.</p>
                    <a href="#meal-planner" class="btn btn-primary">Plan Meals</a>
                  </div>
                </div>
              `
              }
            </div>
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error loading shopping list page:', error);
    }
  }

  renderIngredientCategories(ingredients) {
    // Group ingredients by category (mock categories for now)
    const categories = {
      Produce: [],
      'Meat & Seafood': [],
      'Dairy & Eggs': [],
      Pantry: [],
      Other: [],
    };

    ingredients.forEach((ingredient) => {
      // Simple categorization logic (in a real app, this would be more sophisticated)
      const name = ingredient.name.toLowerCase();
      if (
        name.includes('chicken') ||
        name.includes('beef') ||
        name.includes('fish') ||
        name.includes('meat')
      ) {
        categories['Meat & Seafood'].push(ingredient);
      } else if (
        name.includes('milk') ||
        name.includes('cheese') ||
        name.includes('egg') ||
        name.includes('butter')
      ) {
        categories['Dairy & Eggs'].push(ingredient);
      } else if (
        name.includes('tomato') ||
        name.includes('onion') ||
        name.includes('lettuce') ||
        name.includes('apple')
      ) {
        categories['Produce'].push(ingredient);
      } else if (
        name.includes('flour') ||
        name.includes('oil') ||
        name.includes('salt') ||
        name.includes('pepper')
      ) {
        categories['Pantry'].push(ingredient);
      } else {
        categories['Other'].push(ingredient);
      }
    });

    return Object.entries(categories)
      .filter(([category, items]) => items.length > 0)
      .map(
        ([category, items]) => `
        <div class="ingredient-category">
          <h3 class="category-title">${category}</h3>
          <div class="ingredient-list">
            ${items
              .map(
                (ingredient) => `
              <div class="ingredient-item">
                <label class="ingredient-label">
                  <input type="checkbox" class="ingredient-checkbox">
                  <span class="ingredient-text">${ingredient.amount} ${ingredient.name}</span>
                </label>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      )
      .join('');
  }

  async loadSettingsPage() {
    try {
      const mainContent = qs('#main-content');

      mainContent.innerHTML = `
        <section class="settings-hero">
          <div class="container">
            <div class="hero-content text-center">              <h1>API Settings</h1>
              <p class="text-secondary">Configure your Spoonacular API integration using environment variables</p>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <div class="container">
            <div class="settings-container">
              <!-- Settings will be rendered here -->
            </div>
          </div>
        </section>
      `;

      // Initialize and render the API settings
      await this.apiSettings.renderAPISettings('.settings-container');
    } catch (error) {
      console.error('Error loading settings page:', error);

      const mainContent = qs('#main-content');
      mainContent.innerHTML = `
        <section class="error-section">
          <div class="container text-center">
            <h1>Settings Unavailable</h1>
            <p>We couldn't load the settings page. Please try again.</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button>
          </div>
        </section>
      `;
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new KitoweoApp();
  
  // Expose app for testing in browser console
  window.kitoweoApp = app;
  
  // Add global test function
  window.testAPI = async function() {
    console.log('🧪 Testing Spoonacular API Connection...');
    console.log('=' .repeat(50));
    
    // Test 1: Check configuration
    console.log('1️⃣ Configuration Check:');
    const apiStatus = app.dataSource.spoonacularAPI.getStatus();
    console.log('   ✓ API Key configured:', apiStatus.configured);
    console.log('   ✓ API Key (masked):', apiStatus.apiKey);
    console.log('   ✓ Base URL:', apiStatus.baseURL);
    console.log('   ✓ Cache size:', apiStatus.cacheSize, 'entries');
    
    if (!apiStatus.configured) {
      console.error('❌ API key not configured. Please check your .env file.');
      return false;
    }
    
    // Test 2: Simple API call
    console.log('\n2️⃣ API Connection Test:');
    try {
      const recipes = await app.dataSource.searchRecipes('chicken', { number: 3 });
      console.log('   ✅ API search successful!');
      console.log('   ✓ Found', recipes.length, 'recipes');
      if (recipes.length > 0) {
        console.log('   ✓ Sample recipe:', recipes[0].title);
      }
      
      return true;
    } catch (error) {
      console.error('   ❌ API search failed:', error.message);
      return false;
    }
  };
  
  // Add console helper message
  console.log('🍳 Kitoweo Recipe App loaded!');
  console.log('💡 Type "testAPI()" in console to test Spoonacular API connection');
  console.log('💡 Access app instance via "window.kitoweoApp"');
});
