/**
 * Recipe Card Partial Component
 * Reusable recipe card for lists and grids
 */

export function createRecipeCard(recipe) {
  const imageUrl = recipe.image || '/images/placeholders/recipe-placeholder.svg';
  const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty}` : '';

  return `
    <div class="recipe-card" data-recipe-id="${recipe.id}">
      <div class="recipe-card-image">
        <img src="${imageUrl}" 
             alt="${recipe.title}" 
             loading="lazy"
             onerror="this.src='/images/placeholders/recipe-placeholder.svg'">
        <div class="recipe-card-badges">
          ${recipe.difficulty ? `<span class="badge ${difficultyClass}">${recipe.difficulty}</span>` : ''}
          ${
            recipe.dietaryInfo && recipe.dietaryInfo.length > 0
              ? recipe.dietaryInfo
                  .slice(0, 2)
                  .map((diet) => `<span class="badge badge-diet">${diet}</span>`)
                  .join('')
              : ''
          }
        </div>
        <button class="recipe-card-favorite" data-recipe-id="${recipe.id}" aria-label="Add to favorites">
          <span class="favorite-icon">🤍</span>
        </button>
      </div>
      
      <div class="recipe-card-content">
        <h3 class="recipe-card-title">${recipe.title}</h3>
        <p class="recipe-card-description">${recipe.description}</p>
        
        <div class="recipe-card-meta">
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span class="meta-text">${recipe.cookingTime}m</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span class="meta-text">${recipe.servings}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🔥</span>
            <span class="meta-text">${recipe.calories}</span>
          </div>
          ${
            recipe.rating
              ? `
          <div class="meta-item">
            <span class="meta-icon">⭐</span>
            <span class="meta-text">${recipe.rating}/5</span>
          </div>
          `
              : ''
          }
        </div>
        
        <div class="recipe-card-tags">
          ${
            recipe.tags && recipe.tags.length > 0
              ? recipe.tags
                  .slice(0, 3)
                  .map((tag) => `<span class="tag">#${tag}</span>`)
                  .join('')
              : ''
          }
        </div>
        
        <div class="recipe-card-actions">
          <button class="btn btn-primary btn-sm view-recipe" data-recipe-id="${recipe.id}">
            👁️ View Recipe
          </button>
          <button class="btn btn-secondary btn-sm add-to-plan" data-recipe-id="${recipe.id}">
            📅 Add to Plan
          </button>
        </div>
      </div>
    </div>
  `;
}

export function createRecipeGrid(recipes, columns = 3) {
  if (!recipes || recipes.length === 0) {
    return `
      <div class="empty-recipes">
        <div class="empty-content">
          <div class="empty-icon">🔍</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search criteria or browse all recipes.</p>
          <a href="#recipes" class="btn btn-primary">Browse All Recipes</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="recipes-grid grid-${columns}">
      ${recipes.map((recipe) => createRecipeCard(recipe)).join('')}
    </div>
  `;
}

export function initializeRecipeCards() {
  // View recipe buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.view-recipe') || e.target.closest('.view-recipe')) {
      const button = e.target.matches('.view-recipe') ? e.target : e.target.closest('.view-recipe');
      const recipeId = button.getAttribute('data-recipe-id');
      if (recipeId) {
        window.location.hash = `recipe/${recipeId}`;
      }
    }
  });

  // Recipe card click (entire card clickable)
  document.addEventListener('click', (e) => {
    const recipeCard = e.target.closest('.recipe-card');
    if (recipeCard && !e.target.closest('button')) {
      const recipeId = recipeCard.getAttribute('data-recipe-id');
      if (recipeId) {
        window.location.hash = `recipe/${recipeId}`;
      }
    }
  });

  // Favorite buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.recipe-card-favorite') || e.target.closest('.recipe-card-favorite')) {
      e.stopPropagation();
      const button = e.target.matches('.recipe-card-favorite')
        ? e.target
        : e.target.closest('.recipe-card-favorite');
      const icon = button.querySelector('.favorite-icon');
      const recipeId = button.getAttribute('data-recipe-id');

      // Toggle favorite state
      if (icon.textContent === '🤍') {
        icon.textContent = '❤️';
        // Save to favorites (implement your storage logic)
        console.log(`Added recipe ${recipeId} to favorites`);
      } else {
        icon.textContent = '🤍';
        // Remove from favorites
        console.log(`Removed recipe ${recipeId} from favorites`);
      }
    }
  });

  // Add to meal plan buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.add-to-plan') || e.target.closest('.add-to-plan')) {
      e.stopPropagation();
      const button = e.target.matches('.add-to-plan') ? e.target : e.target.closest('.add-to-plan');
      const recipeId = button.getAttribute('data-recipe-id');

      // Add to meal plan (implement your logic)
      console.log(`Added recipe ${recipeId} to meal plan`);

      // Visual feedback
      const originalText = button.textContent;
      button.textContent = '✅ Added!';
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  });
}
