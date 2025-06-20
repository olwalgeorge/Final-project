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
      console.log('🔍 loadRecipes called with:', { searchQuery, initialParams });

      const loadingSpinner = qs('#loading-spinner');
      const recipesGrid = qs('#recipes-grid');
      const resultsCount = qs('#results-count');

      // Show loading state
      loadingSpinner.style.display = 'block';
      recipesGrid.style.display = 'none';

      // Build search options for API
      const searchOptions = this.buildSearchOptions(initialParams);
      console.log('🔧 Search options built:', searchOptions);

      // Get recipes based on search query
      let recipes;
      if (searchQuery) {
        console.log('🌐 Calling searchRecipes with query:', searchQuery);
        recipes = await this.dataSource.searchRecipes(searchQuery, searchOptions);
        qs('#results-title').textContent = `Search Results for "${searchQuery}"`;
      } else {
        console.log('🌐 Calling getAllRecipes');
        recipes = await this.dataSource.getAllRecipes();
        qs('#results-title').textContent = 'All Recipes';
      }

      console.log('📊 Recipes received:', recipes?.length || 0, 'recipes');
      console.log('📋 First recipe:', recipes?.[0]?.title || 'None');

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
    try {
      const mainContent = qs('#main-content');

      // Show loading state
      mainContent.innerHTML = `
        <section class="recipe-detail-loading">
          <div class="container">
            <div class="text-center">
              <div class="loading-spinner"></div>
              <p>Loading recipe details...</p>
            </div>
          </div>
        </section>
      `;

      // Fetch recipe details
      const recipe = await this.dataSource.getRecipeById(parseInt(recipeId));

      if (!recipe) {
        mainContent.innerHTML = `
          <section class="recipe-not-found">
            <div class="container text-center">
              <h1>Recipe Not Found</h1>
              <p>Sorry, we couldn't find the recipe you're looking for.</p>
              <a href="#recipes" class="btn btn-primary">Back to Recipes</a>
            </div>
          </section>
        `;
        return;
      }

      // Create detailed recipe view
      mainContent.innerHTML = `
        <section class="recipe-detail">
          <div class="container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
              <a href="#home">Home</a> › 
              <a href="#recipes">Recipes</a> › 
              <span>${recipe.title}</span>
            </nav>

            <!-- Recipe Header -->
            <div class="recipe-header">
              <div class="recipe-image-container">
                <img src="${recipe.image || '/images/placeholders/recipe-placeholder.jpg'}" 
                     alt="${recipe.title}" 
                     class="recipe-image"
                     onerror="this.src='/images/placeholders/recipe-placeholder.jpg'">
                <div class="recipe-badges">
                  ${recipe.difficulty ? `<span class="badge badge-${recipe.difficulty}">${recipe.difficulty}</span>` : ''}
                  ${recipe.cuisine ? `<span class="badge badge-cuisine">${recipe.cuisine}</span>` : ''}
                  ${
                    recipe.dietaryInfo && recipe.dietaryInfo.length > 0
                      ? recipe.dietaryInfo
                          .map((diet) => `<span class="badge badge-diet">${diet}</span>`)
                          .join('')
                      : ''
                  }
                </div>
              </div>
              
              <div class="recipe-info">
                <h1 class="recipe-title">${recipe.title}</h1>
                <p class="recipe-description">${recipe.description}</p>
                
                <div class="recipe-meta">
                  <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span class="meta-label">Prep Time</span>
                    <span class="meta-value">${recipe.cookingTime} min</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span class="meta-label">Servings</span>
                    <span class="meta-value">${recipe.servings}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">🔥</span>
                    <span class="meta-label">Calories</span>
                    <span class="meta-value">${recipe.calories} per serving</span>
                  </div>
                  ${
                    recipe.rating
                      ? `
                  <div class="meta-item">
                    <span class="meta-icon">⭐</span>
                    <span class="meta-label">Rating</span>
                    <span class="meta-value">${'⭐'.repeat(recipe.rating)} (${recipe.rating}/5)</span>
                  </div>
                  `
                      : ''
                  }
                </div>

                <div class="recipe-actions">
                  <button class="btn btn-primary add-to-meal-plan" data-recipe-id="${recipe.id}">
                    📅 Add to Meal Plan
                  </button>
                  <button class="btn btn-secondary save-recipe" data-recipe-id="${recipe.id}">
                    💾 Save Recipe
                  </button>
                  <button class="btn btn-ghost share-recipe" data-recipe-id="${recipe.id}">
                    📤 Share
                  </button>
                </div>
              </div>
            </div>

            <!-- Recipe Content -->
            <div class="recipe-content">
              <div class="recipe-main">
                <!-- Ingredients -->
                <div class="recipe-section">
                  <h2>Ingredients</h2>
                  <div class="ingredients-list">
                    ${
                      recipe.ingredients && recipe.ingredients.length > 0
                        ? recipe.ingredients
                            .map(
                              (ingredient) => `
                        <div class="ingredient-item">
                          <input type="checkbox" id="ingredient-${ingredient.name.replace(/\s+/g, '-')}" class="ingredient-checkbox">
                          <label for="ingredient-${ingredient.name.replace(/\s+/g, '-')}">
                            <span class="ingredient-amount">${ingredient.amount}</span>
                            <span class="ingredient-name">${ingredient.name}</span>
                          </label>
                        </div>
                      `
                            )
                            .join('')
                        : '<p>Ingredients list not available.</p>'
                    }
                  </div>
                  <button class="btn btn-secondary add-to-shopping-list" data-recipe-id="${recipe.id}">
                    🛒 Add All to Shopping List
                  </button>
                </div>

                <!-- Instructions -->
                <div class="recipe-section">
                  <h2>Instructions</h2>
                  <div class="instructions-list">
                    ${
                      recipe.instructions && recipe.instructions.length > 0
                        ? recipe.instructions
                            .map(
                              (step, index) => `
                        <div class="instruction-step">
                          <div class="step-number">${index + 1}</div>
                          <div class="step-content">${step}</div>
                        </div>
                      `
                            )
                            .join('')
                        : '<p>Instructions not available.</p>'
                    }
                  </div>
                </div>
              </div>

              <!-- Recipe Sidebar -->
              <div class="recipe-sidebar">
                <!-- Tags -->
                ${
                  recipe.tags && recipe.tags.length > 0
                    ? `
                <div class="recipe-section">
                  <h3>Tags</h3>
                  <div class="recipe-tags">
                    ${recipe.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}
                  </div>
                </div>
                `
                    : ''
                }

                <!-- Nutrition Info -->
                ${
                  recipe.nutrition
                    ? `
                <div class="recipe-section">
                  <h3>Nutrition (per serving)</h3>
                  <div class="nutrition-info">
                    ${Object.entries(recipe.nutrition)
                      .map(
                        ([key, value]) => `
                      <div class="nutrition-item">
                        <span class="nutrition-label">${key}</span>
                        <span class="nutrition-value">${value}</span>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
                `
                    : ''
                }

                <!-- Recipe Source -->
                ${
                  recipe.sourceUrl
                    ? `
                <div class="recipe-section">
                  <h3>Recipe Source</h3>
                  <a href="${recipe.sourceUrl}" target="_blank" class="source-link">
                    View Original Recipe
                  </a>
                  ${recipe.creditsText ? `<p class="source-credit">${recipe.creditsText}</p>` : ''}
                </div>
                `
                    : ''
                }
              </div>
            </div>

            <!-- Back Button -->
            <div class="recipe-footer">
              <a href="#recipes" class="btn btn-ghost">← Back to Recipes</a>
            </div>
          </div>
        </section>
      `;

      // Initialize recipe detail interactions
      this.initializeRecipeDetailEvents(recipe);
    } catch (error) {
      console.error('Error loading recipe detail:', error);
      mainContent.innerHTML = `
        <section class="recipe-error">
          <div class="container text-center">
            <h1>Error Loading Recipe</h1>
            <p>Sorry, there was an error loading the recipe details.</p>
            <a href="#recipes" class="btn btn-primary">Back to Recipes</a>
          </div>
        </section>
      `;
    }
  }

  initializeRecipeDetailEvents(recipe) {
    // Add to meal plan functionality
    const addToMealPlanBtn = qs('.add-to-meal-plan');
    if (addToMealPlanBtn) {
      addToMealPlanBtn.addEventListener('click', () => {
        // This would integrate with meal planner
        alert(`Added "${recipe.title}" to meal plan!`);
      });
    }

    // Save recipe functionality
    const saveRecipeBtn = qs('.save-recipe');
    if (saveRecipeBtn) {
      saveRecipeBtn.addEventListener('click', () => {
        // This would save to local storage or user account
        alert(`Saved "${recipe.title}" to your favorites!`);
      });
    }

    // Share recipe functionality
    const shareRecipeBtn = qs('.share-recipe');
    if (shareRecipeBtn) {
      shareRecipeBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: recipe.title,
            text: recipe.description,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href);
          alert('Recipe link copied to clipboard!');
        }
      });
    }

    // Add to shopping list functionality
    const addToShoppingListBtn = qs('.add-to-shopping-list');
    if (addToShoppingListBtn) {
      addToShoppingListBtn.addEventListener('click', () => {
        // This would integrate with shopping list
        alert(`Added all ingredients from "${recipe.title}" to shopping list!`);
      });
    }

    // Ingredient checkbox functionality
    const ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox');
    ingredientCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const label = e.target.nextElementSibling;
        if (e.target.checked) {
          label.style.textDecoration = 'line-through';
          label.style.opacity = '0.6';
        } else {
          label.style.textDecoration = 'none';
          label.style.opacity = '1';
        }
      });
    });
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
  window.testAPI = async function () {
    console.log('🧪 Testing Spoonacular API Connection...');
    console.log('='.repeat(50));

    // Test 1: Check configuration
    console.log('1️⃣ Configuration Check:');
    const apiStatus = app.dataSource.spoonacularAPI.getStatus();
    console.log('   ✓ API Key configured:', apiStatus.configured);
    console.log('   ✓ API Key (masked):', apiStatus.apiKey);
    console.log('   ✓ Base URL:', apiStatus.baseURL);
    console.log('   ✓ Cache size:', apiStatus.cacheSize, 'entries');
    console.log('   ✓ Using API:', app.dataSource.useAPI);

    if (!apiStatus.configured) {
      console.error('❌ API key not configured. Please check your .env file.');
      return false;
    }

    // Test 2: Direct API call
    console.log('\n2️⃣ Direct API Test:');
    try {
      const directResult = await app.dataSource.spoonacularAPI.searchRecipes('pasta', {
        number: 3,
      });
      console.log('   ✅ Direct API call successful!');
      console.log('   ✓ Found', directResult.totalResults, 'total recipes');
      console.log('   ✓ Returned', directResult.recipes.length, 'recipes');
      if (directResult.recipes.length > 0) {
        console.log('   ✓ Sample recipe:', directResult.recipes[0].title);
        console.log('   ✓ Recipe source:', directResult.recipes[0].source);
      }
    } catch (error) {
      console.error('   ❌ Direct API call failed:', error.message);
    }

    // Test 3: DataSource search
    console.log('\n3️⃣ DataSource Search Test:');
    try {
      const recipes = await app.dataSource.searchRecipes('pasta', { number: 3 });
      console.log('   ✅ DataSource search successful!');
      console.log('   ✓ Found', recipes.length, 'recipes');
      if (recipes.length > 0) {
        console.log('   ✓ Sample recipe:', recipes[0].title);
        console.log('   ✓ Recipe source:', recipes[0].source);
        console.log('   ✓ Recipe image:', recipes[0].image);
      }

      return true;
    } catch (error) {
      console.error('   ❌ DataSource search failed:', error.message);
      return false;
    }
  };

  // Add search testing function
  window.testSearch = async function (query = 'pasta') {
    console.log(`🔍 Testing search for: "${query}"`);
    console.log('='.repeat(50));

    try {
      const recipes = await app.dataSource.searchRecipes(query, { number: 5 });
      console.log(`✅ Found ${recipes.length} recipes for "${query}"`);

      recipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (${recipe.source})`);
        console.log(`   - Cooking time: ${recipe.cookingTime} min`);
        console.log(`   - Category: ${recipe.category}`);
        console.log(`   - Image: ${recipe.image.substring(0, 50)}...`);
      });

      return recipes;
    } catch (error) {
      console.error(`❌ Search failed for "${query}":`, error.message);
      return [];
    }
  };
  // Add detailed search debugging function
  window.debugSearch = async function (query = 'pasta') {
    console.log(`🔍 DEBUG: Full search flow for "${query}"`);
    console.log('='.repeat(60));

    // Step 1: Check app state
    console.log('1️⃣ App State Check:');
    console.log('   ✓ API configured:', app.dataSource.spoonacularAPI.isConfigured());
    console.log('   ✓ Using API:', app.dataSource.useAPI);
    console.log('   ✓ Mock fallback:', app.dataSource.mockDataFallback);

    // Step 2: Test direct API call
    console.log('\n2️⃣ Direct API Call:');
    try {
      const apiResult = await app.dataSource.spoonacularAPI.searchRecipes(query, { number: 5 });
      console.log('   ✅ API returned:', apiResult.totalResults, 'total recipes');
      console.log('   ✓ Recipes in batch:', apiResult.recipes.length);
    } catch (error) {
      console.error('   ❌ API call failed:', error.message);
    }

    // Step 3: Test DataSource search
    console.log('\n3️⃣ DataSource Search:');
    try {
      const dsResult = await app.dataSource.searchRecipes(query, { number: 5 });
      console.log('   ✅ DataSource returned:', dsResult.length, 'recipes');
      if (dsResult.length > 0) {
        console.log('   ✓ First recipe:', dsResult[0].title);
        console.log('   ✓ Recipe has image:', !!dsResult[0].image);
        console.log('   ✓ Recipe source:', dsResult[0].source);
      }
    } catch (error) {
      console.error('   ❌ DataSource search failed:', error.message);
    }

    // Step 4: Test UI search (simulate what happens when user searches)
    console.log('\n4️⃣ UI Search Simulation:');
    try {
      // Navigate to recipes page
      window.location.hash = `#recipes?search=${encodeURIComponent(query)}`;
      console.log('   ✓ Navigated to recipes page with search query');
    } catch (error) {
      console.error('   ❌ Navigation failed:', error.message);
    }
  };

  // Add function to check current page state
  window.checkPageState = function () {
    console.log('📊 Current Page State:');
    console.log('='.repeat(40));

    const recipesGrid = qs('#recipes-grid');
    const resultsCount = qs('#results-count');
    const searchInput = qs('#recipe-search-input');
    const loadingSpinner = qs('#loading-spinner');

    console.log('Grid element exists:', !!recipesGrid);
    console.log('Grid children count:', recipesGrid?.children.length || 0);
    console.log('Results count text:', resultsCount?.textContent || 'Not found');
    console.log('Search input value:', searchInput?.value || 'Not found');
    console.log('Loading spinner visible:', loadingSpinner?.style.display !== 'none');
    console.log('Current URL hash:', window.location.hash);

    if (recipesGrid) {
      console.log('Grid display style:', window.getComputedStyle(recipesGrid).display);
      console.log('Grid innerHTML length:', recipesGrid.innerHTML.length);
      if (recipesGrid.innerHTML.length < 100) {
        console.log('Grid content:', recipesGrid.innerHTML);
      }
    }
  };

  // Add console helper message
  console.log('🍳 Kitoweo Recipe App loaded!');
  console.log('💡 Type "testAPI()" in console to test Spoonacular API connection');
  console.log('💡 Type "testSearch("pasta")" to test searching for specific terms');
  console.log('💡 Type "debugSearch("pasta")" for detailed search debugging');
  console.log('💡 Type "checkPageState()" to see current page state');
  console.log('💡 Access app instance via "window.kitoweoApp"');
});
