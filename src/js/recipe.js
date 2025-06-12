/**
 * Recipe class for rendering recipe UI components
 */

import { qs, createElement, alertMessage } from './utils.js';

export default class Recipe {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  async renderRecipeList(recipes, container) {
    const recipesContainer = typeof container === 'string' ? qs(container) : container;
    
    if (!recipes || recipes.length === 0) {
      recipesContainer.innerHTML = '<p class="no-recipes">No recipes found</p>';
      return;
    }

    const recipeCards = recipes.map(recipe => this.createRecipeCard(recipe));
    recipesContainer.innerHTML = '';
    recipeCards.forEach(card => recipesContainer.appendChild(card));
  }

  createRecipeCard(recipe) {
    const card = createElement('div', 'recipe-card');
    card.setAttribute('data-recipe-id', recipe.id);
    
    card.innerHTML = `      <div class="recipe-image">
        <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
        <button class="favorite-btn" data-recipe-id="${recipe.id}">
          <span class="heart-icon">♡</span>
        </button>
      </div>
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <p class="recipe-description">${recipe.description}</p>
        <div class="recipe-meta">
          <div class="meta-item">
            <span class="icon">⏱</span>
            <span>${recipe.cookingTime} min</span>
          </div>
          <div class="meta-item">
            <span class="icon">🔥</span>
            <span>${recipe.calories} cal</span>
          </div>
          <div class="meta-item">
            <span class="icon">👥</span>
            <span>${recipe.servings} servings</span>
          </div>
        </div>
        <div class="recipe-tags">
          ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          ${recipe.dietaryInfo.map(diet => `<span class="diet-tag">${diet}</span>`).join('')}
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary view-recipe-btn" data-recipe-id="${recipe.id}">
            View Recipe
          </button>
          <button class="btn btn-secondary add-to-plan-btn" data-recipe-id="${recipe.id}">
            Add to Plan
          </button>
        </div>
      </div>
    `;

    this.attachCardEventListeners(card);
    return card;
  }

  attachCardEventListeners(card) {
    // View recipe button
    const viewBtn = qs('.view-recipe-btn', card);
    viewBtn.addEventListener('click', (e) => {
      const recipeId = e.target.getAttribute('data-recipe-id');
      this.viewRecipe(recipeId);
    });

    // Add to meal plan button
    const planBtn = qs('.add-to-plan-btn', card);
    planBtn.addEventListener('click', (e) => {
      const recipeId = e.target.getAttribute('data-recipe-id');
      this.addToMealPlan(recipeId);
    });

    // Favorite button
    const favoriteBtn = qs('.favorite-btn', card);
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const recipeId = e.target.closest('.favorite-btn').getAttribute('data-recipe-id');
      this.toggleFavorite(recipeId, e.target.closest('.favorite-btn'));
    });

    // Card click to view recipe
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        const recipeId = card.getAttribute('data-recipe-id');
        this.viewRecipe(recipeId);
      }
    });
  }

  async renderRecipeDetail(recipeId, container) {
    try {
      const recipe = await this.dataSource.getRecipeById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      const detailContainer = typeof container === 'string' ? qs(container) : container;
      detailContainer.innerHTML = this.createRecipeDetailHTML(recipe);
      
      this.attachDetailEventListeners(detailContainer, recipe);
      
    } catch (error) {
      alertMessage('Error loading recipe details: ' + error.message);
    }
  }

  createRecipeDetailHTML(recipe) {
    return `
      <div class="recipe-detail">        <div class="recipe-hero">
          <img src="${recipe.image}" alt="${recipe.title}" class="hero-image">
          <div class="hero-overlay">
            <div class="hero-content">
              <h1 class="recipe-title">${recipe.title}</h1>
              <p class="recipe-description">${recipe.description}</p>
              <div class="recipe-meta">
                <div class="meta-item">
                  <span class="icon">⏱</span>
                  <span>${recipe.cookingTime} min</span>
                </div>
                <div class="meta-item">
                  <span class="icon">👥</span>
                  <span>${recipe.servings} servings</span>
                </div>
                <div class="meta-item">
                  <span class="icon">🔥</span>
                  <span>${recipe.calories} cal</span>
                </div>
              </div>
            </div>
          </div>
          <div class="recipe-actions-hero">
            <button class="btn-icon favorite-btn" data-recipe-id="${recipe.id}">♡</button>
            <button class="btn-icon share-btn">📤</button>
            <button class="btn-icon plan-btn" data-recipe-id="${recipe.id}">📅</button>
          </div>
        </div>
        
        <div class="recipe-content">
          <div class="recipe-tabs">
            <button class="tab-btn active" data-tab="ingredients">Ingredients</button>
            <button class="tab-btn" data-tab="instructions">Instructions</button>
            <button class="tab-btn" data-tab="nutrition">Nutrition</button>
          </div>
          
          <div class="tab-content">
            <div class="tab-pane active" id="ingredients-tab">
              <div class="ingredients-section">
                <div class="servings-adjuster">
                  <label>Servings:</label>
                  <div class="quantity-controls">
                    <button class="qty-btn minus">-</button>
                    <input type="number" value="${recipe.servings}" min="1" max="20" class="servings-input">
                    <button class="qty-btn plus">+</button>
                  </div>
                </div>
                <div class="ingredients-list">
                  ${this.groupIngredientsByCategory(recipe.ingredients)}
                </div>
                <button class="btn btn-primary add-to-shopping-btn">
                  Add to Shopping List
                </button>
              </div>
            </div>
            
            <div class="tab-pane" id="instructions-tab">
              <div class="instructions-list">
                ${recipe.instructions.map((instruction, index) => `
                  <div class="instruction-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">${instruction}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="tab-pane" id="nutrition-tab">
              <div class="nutrition-info">
                <div class="nutrition-item">
                  <span class="label">Calories</span>
                  <span class="value">${recipe.calories}</span>
                </div>
                <!-- Add more nutrition info as available -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  groupIngredientsByCategory(ingredients) {
    const grouped = ingredients.reduce((acc, ingredient) => {
      const category = ingredient.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(ingredient);
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, items]) => `
      <div class="ingredient-category">
        <h4 class="category-title">${this.formatCategoryName(category)}</h4>
        <ul class="ingredient-items">
          ${items.map(item => `
            <li class="ingredient-item">
              <input type="checkbox" class="ingredient-checkbox">
              <span class="ingredient-text">${item.amount} ${item.name}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }

  formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  attachDetailEventListeners(container, recipe) {
    // Tab switching
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabPanes = container.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        qs(`#${tabName}-tab`, container).classList.add('active');
      });
    });

    // Servings adjustment
    const minusBtn = qs('.qty-btn.minus', container);
    const plusBtn = qs('.qty-btn.plus', container);
    const servingsInput = qs('.servings-input', container);
    
    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(servingsInput.value);
      if (currentValue > 1) {
        servingsInput.value = currentValue - 1;
        this.updateIngredientQuantities(container, recipe, currentValue - 1);
      }
    });
    
    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(servingsInput.value);
      if (currentValue < 20) {
        servingsInput.value = currentValue + 1;
        this.updateIngredientQuantities(container, recipe, currentValue + 1);
      }
    });

    // Other action buttons
    const favoriteBtn = qs('.favorite-btn', container);
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        this.toggleFavorite(recipe.id, favoriteBtn);
      });
    }
  }

  updateIngredientQuantities(container, recipe, newServings) {
    const ratio = newServings / recipe.servings;
    // Implementation for updating ingredient quantities based on serving size
    // This would require parsing and recalculating ingredient amounts
  }

  viewRecipe(recipeId) {
    // Navigate to recipe detail page
    window.location.hash = `#recipe/${recipeId}`;
  }

  addToMealPlan(recipeId) {
    // Add recipe to meal plan
    alertMessage('Recipe added to meal plan!');
  }

  toggleFavorite(recipeId, button) {
    // Toggle favorite status
    const heartIcon = qs('.heart-icon', button);
    const isFavorited = heartIcon.textContent === '♥';
    
    heartIcon.textContent = isFavorited ? '♡' : '♥';
    button.classList.toggle('favorited', !isFavorited);
    
    alertMessage(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  }
}
