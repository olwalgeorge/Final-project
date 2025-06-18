/**
 * Meal Planner module for the Kitoweo Recipe App
 * Handles meal planning, calendar management, and meal scheduling
 */

import { qs, createElement, getLocalStorage, setLocalStorage, alertMessage } from './utils.js';

export default class MealPlanner {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.currentWeek = this.getCurrentWeek();
    this.mealPlan = this.loadMealPlan();
  }

  getCurrentWeek() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  }

  loadMealPlan() {
    const saved = getLocalStorage('mealPlan');
    return saved || this.createEmptyMealPlan();
  }

  createEmptyMealPlan() {
    const mealPlan = {};
    
    this.currentWeek.forEach(date => {
      const dateKey = this.formatDateKey(date);
      mealPlan[dateKey] = {
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: []
      };
    });
    
    return mealPlan;
  }

  formatDateKey(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  saveMealPlan() {
    setLocalStorage('mealPlan', this.mealPlan);
  }

  async renderMealPlanner(container) {
    const plannerContainer = typeof container === 'string' ? qs(container) : container;
    
    plannerContainer.innerHTML = `
      <div class="meal-planner">
        <div class="planner-header">
          <div class="week-navigation">
            <button class="btn btn-ghost prev-week-btn" id="prev-week">
              ← Previous Week
            </button>
            <h2 class="current-week-display">${this.getWeekDisplayText()}</h2>
            <button class="btn btn-ghost next-week-btn" id="next-week">
              Next Week →
            </button>
          </div>
          <div class="planner-actions">
            <button class="btn btn-secondary clear-week-btn">Clear Week</button>
            <button class="btn btn-primary generate-shopping-btn">Generate Shopping List</button>
          </div>
        </div>
        
        <div class="meal-calendar">
          ${this.renderWeekView()}
        </div>
        
        <div class="quick-add-section">
          <h3>Quick Add Recipes</h3>
          <div class="quick-recipes" id="quick-recipes">
            <!-- Quick add recipes will be loaded here -->
          </div>
        </div>
      </div>
    `;

    await this.loadQuickAddRecipes();
    this.attachMealPlannerEvents(plannerContainer);
  }

  renderWeekView() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    return `
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="time-slot"></div>
          ${this.currentWeek.map((date, index) => `
            <div class="day-header">
              <div class="day-name">${days[index]}</div>
              <div class="day-date">${date.getDate()}</div>
            </div>
          `).join('')}
        </div>
        
        ${mealTypes.map(mealType => `
          <div class="meal-row">
            <div class="meal-label">
              <h4>${this.capitalizeFirst(mealType)}</h4>
            </div>
            ${this.currentWeek.map(date => {
              const dateKey = this.formatDateKey(date);
              const meal = this.mealPlan[dateKey]?.[mealType];
              
              return `
                <div class="meal-slot" 
                     data-date="${dateKey}" 
                     data-meal-type="${mealType}">
                  ${meal ? this.renderMealItem(meal) : this.renderEmptySlot()}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderMealItem(meal) {
    return `
      <div class="meal-item">
        <div class="meal-content">
          <h5>${meal.title}</h5>
          <div class="meal-meta">
            <span>⏱ ${meal.cookingTime} min</span>
            <span>👥 ${meal.servings}</span>
          </div>
        </div>
        <div class="meal-actions">
          <button class="btn-icon view-recipe-btn" data-recipe-id="${meal.id}" title="View Recipe">
            👁
          </button>
          <button class="btn-icon remove-meal-btn" title="Remove">
            ✕
          </button>
        </div>
      </div>
    `;
  }

  renderEmptySlot() {
    return `
      <div class="empty-meal-slot">
        <button class="add-meal-btn">
          <span class="add-icon">+</span>
          <span class="add-text">Add Meal</span>
        </button>
      </div>
    `;
  }

  async loadQuickAddRecipes() {
    try {
      const recipes = await this.dataSource.getFeaturedRecipes(6);
      const quickRecipesContainer = qs('#quick-recipes');
      
      quickRecipesContainer.innerHTML = recipes.map(recipe => `
        <div class="quick-recipe-card" data-recipe-id="${recipe.id}">
          <img src="${recipe.image}" alt="${recipe.title}" class="quick-recipe-image">
          <div class="quick-recipe-info">
            <h5>${recipe.title}</h5>
            <div class="quick-recipe-meta">
              <span>⏱ ${recipe.cookingTime}m</span>
              <span>🔥 ${recipe.calories} cal</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary add-to-plan-btn" data-recipe-id="${recipe.id}">
            Add to Plan
          </button>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Error loading quick add recipes:', error);
    }
  }

  attachMealPlannerEvents(container) {
    // Week navigation
    const prevWeekBtn = qs('#prev-week', container);
    const nextWeekBtn = qs('#next-week', container);
    
    prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
    nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));

    // Clear week
    const clearWeekBtn = qs('.clear-week-btn', container);
    clearWeekBtn.addEventListener('click', () => this.clearWeek());

    // Generate shopping list
    const generateShoppingBtn = qs('.generate-shopping-btn', container);
    generateShoppingBtn.addEventListener('click', () => this.generateShoppingList());

    // Meal slot interactions
    container.addEventListener('click', (e) => {
      if (e.target.closest('.add-meal-btn')) {
        this.handleAddMeal(e.target.closest('.meal-slot'));
      } else if (e.target.closest('.remove-meal-btn')) {
        this.handleRemoveMeal(e.target.closest('.meal-slot'));
      } else if (e.target.closest('.view-recipe-btn')) {
        const recipeId = e.target.closest('.view-recipe-btn').getAttribute('data-recipe-id');
        this.viewRecipe(recipeId);
      } else if (e.target.closest('.add-to-plan-btn')) {
        const recipeId = e.target.closest('.add-to-plan-btn').getAttribute('data-recipe-id');
        this.showMealPlanModal(recipeId);
      }
    });
  }
  navigateWeek(direction) {
    const daysToAdd = direction * 7;
    this.currentWeek = this.currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + daysToAdd);
      return newDate;
    });

    // Load meal plan for new week
    this.mealPlan = { ...this.mealPlan, ...this.createEmptyMealPlan() };
    
    // Re-render the meal planner
    this.renderMealPlanner('.meal-planner-container');
  }

  clearWeek() {
    if (confirm('Are you sure you want to clear all meals for this week?')) {
      this.currentWeek.forEach(date => {
        const dateKey = this.formatDateKey(date);
        this.mealPlan[dateKey] = {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: []
        };
      });
        this.saveMealPlan();
      this.renderMealPlanner('.meal-planner-container');
      alertMessage('Week cleared successfully!');
    }
  }
  async handleAddMeal(mealSlot) {
    const date = mealSlot.getAttribute('data-date');
    const mealType = mealSlot.getAttribute('data-meal-type');
    
    // Show recipe selection modal
    await this.showRecipeSelectionModal(date, mealType);
  }

  handleRemoveMeal(mealSlot) {
    const date = mealSlot.getAttribute('data-date');
    const mealType = mealSlot.getAttribute('data-meal-type');
    
    if (confirm('Remove this meal from your plan?')) {
      this.removeMealFromPlan(date, mealType);
    }
  }

  addMealToPlan(date, mealType, recipe) {
    if (!this.mealPlan[date]) {
      this.mealPlan[date] = { breakfast: null, lunch: null, dinner: null, snacks: [] };
    }
    
    this.mealPlan[date][mealType] = recipe;
    this.saveMealPlan();
      // Re-render the specific meal slot
    this.renderMealPlanner('.meal-planner-container');
    alertMessage(`${recipe.title} added to ${mealType}!`);
  }

  removeMealFromPlan(date, mealType) {
    if (this.mealPlan[date]) {
      this.mealPlan[date][mealType] = null;
      this.saveMealPlan();
        // Re-render the meal planner
      this.renderMealPlanner('.meal-planner-container');
      alertMessage('Meal removed from plan');
    }
  }
  showMealPlanModal(recipeId) {
    // Show date and meal type selection modal
    this.showDateMealTypeModal(recipeId);
  }

  viewRecipe(recipeId) {
    window.location.hash = `#recipe/${recipeId}`;
  }

  generateShoppingList() {
    const ingredients = this.extractIngredientsFromWeek();
    
    if (ingredients.length === 0) {
      alertMessage('No meals planned for this week. Add some recipes to generate a shopping list.');
      return;
    }

    // For now, just log - in a full app, this would navigate to shopping list
    console.log('Shopping list ingredients:', ingredients);
    alertMessage('Shopping list generated! (Check console for details)');
    
    // Navigate to shopping list page
    window.location.hash = '#shopping-list';
  }

  extractIngredientsFromWeek() {
    const allIngredients = [];
    
    this.currentWeek.forEach(date => {
      const dateKey = this.formatDateKey(date);
      const dayMeals = this.mealPlan[dateKey];
      
      if (dayMeals) {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const meal = dayMeals[mealType];
          if (meal && meal.ingredients) {
            allIngredients.push(...meal.ingredients);
          }
        });
      }
    });
    
    return this.consolidateIngredients(allIngredients);
  }

  consolidateIngredients(ingredients) {
    const consolidated = {};
    
    ingredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase();
      if (consolidated[key]) {
        // In a real app, you'd need to handle unit conversion and addition
        consolidated[key].amount += ` + ${ingredient.amount}`;
      } else {
        consolidated[key] = { ...ingredient };
      }
    });
    
    return Object.values(consolidated);
  }

  getWeekDisplayText() {
    const start = this.currentWeek[0];
    const end = this.currentWeek[6];
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async showRecipeSelectionModal(date, mealType) {
    // Create modal overlay
    const modal = createElement('div', 'recipe-selection-modal');
    modal.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Select Recipe for ${this.capitalizeFirst(mealType)}</h3>
            <button class="modal-close" id="modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="recipe-search-container">
              <input 
                type="text" 
                id="recipe-search-input" 
                class="search-input" 
                placeholder="Search for recipes..."
                autocomplete="off"
              >
            </div>
            <div class="recipe-results" id="recipe-results">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading recipes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Load initial recipes
    await this.loadModalRecipes();

    // Attach modal events
    this.attachModalEvents(modal, date, mealType);
  }

  async loadModalRecipes(searchQuery = '') {
    try {
      const resultsContainer = qs('#recipe-results');
      
      let recipes;
      if (searchQuery) {
        recipes = await this.dataSource.searchRecipes(searchQuery);
      } else {
        recipes = await this.dataSource.getAllRecipes();
      }

      // Limit to 12 recipes for the modal
      recipes = recipes.slice(0, 12);

      resultsContainer.innerHTML = `
        <div class="modal-recipe-grid">
          ${recipes.map(recipe => `
            <div class="modal-recipe-card" data-recipe-id="${recipe.id}">
              <div class="recipe-image-small">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
              </div>
              <div class="recipe-info-small">
                <h5>${recipe.title}</h5>
                <div class="recipe-meta-small">
                  <span>⏱ ${recipe.cookingTime}m</span>
                  <span>🔥 ${recipe.calories} cal</span>
                </div>
                <button class="btn btn-sm btn-primary select-recipe-btn" data-recipe-id="${recipe.id}">
                  Select
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

    } catch (error) {
      console.error('Error loading modal recipes:', error);
      qs('#recipe-results').innerHTML = `
        <div class="error-state">
          <p>Error loading recipes. Please try again.</p>
        </div>
      `;
    }
  }

  attachModalEvents(modal, date, mealType) {
    const overlay = qs('#modal-overlay', modal);
    const closeBtn = qs('#modal-close', modal);
    const searchInput = qs('#recipe-search-input', modal);

    // Close modal events
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.loadModalRecipes(e.target.value.trim());
      }, 300);
    });

    // Recipe selection
    modal.addEventListener('click', async (e) => {
      if (e.target.closest('.select-recipe-btn')) {
        const recipeId = e.target.closest('.select-recipe-btn').getAttribute('data-recipe-id');
        const recipe = await this.dataSource.getRecipeById(recipeId);
        
        if (recipe) {
          this.addMealToPlan(date, mealType, recipe);
          closeModal();
        }
      }
    });
  }

  async showDateMealTypeModal(recipeId) {
    const recipe = await this.dataSource.getRecipeById(recipeId);
    if (!recipe) return;

    const modal = createElement('div', 'date-meal-modal');
    modal.innerHTML = `
      <div class="modal-overlay" id="date-modal-overlay">
        <div class="modal-content modal-content-small">
          <div class="modal-header">
            <h3>Add "${recipe.title}" to Meal Plan</h3>
            <button class="modal-close" id="date-modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select Date:</label>
              <select class="form-input" id="date-select">
                ${this.currentWeek.map(date => {
                  const dateKey = this.formatDateKey(date);
                  const displayDate = this.formatDisplayDate(date);
                  return `<option value="${dateKey}">${displayDate}</option>`;
                }).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Select Meal:</label>
              <select class="form-input" id="meal-type-select">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="cancel-add">Cancel</button>
              <button class="btn btn-primary" id="confirm-add">Add to Plan</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach events
    const overlay = qs('#date-modal-overlay', modal);
    const closeBtn = qs('#date-modal-close', modal);
    const cancelBtn = qs('#cancel-add', modal);
    const confirmBtn = qs('#confirm-add', modal);

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    [closeBtn, cancelBtn].forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    confirmBtn.addEventListener('click', () => {
      const selectedDate = qs('#date-select', modal).value;
      const selectedMealType = qs('#meal-type-select', modal).value;
      
      this.addMealToPlan(selectedDate, selectedMealType, recipe);
      closeModal();
    });
  }
}
