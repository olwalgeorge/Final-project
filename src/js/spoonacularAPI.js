/**
 * Spoonacular API Integration Service
 * Handles all communication with the Spoonacular Food API
 */

export default class SpoonacularAPI {
  constructor() {
    this.baseURL = 'https://api.spoonacular.com';
    this.apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
    this.requestCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache

    if (!this.apiKey) {
      console.warn('🔑 Spoonacular API key not found!');
      console.warn('📁 Please create a .env file with: VITE_SPOONACULAR_API_KEY=your_api_key_here');
      console.warn('📖 Get your API key from: https://spoonacular.com/food-api/console#Dashboard');
    }
  }

  /**
   * Check if API key is properly configured
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  /**
   * Get API configuration status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'Not set',
      baseURL: this.baseURL,
      cacheSize: this.requestCache.size,
    };
  }

  /**
   * Generic API request method with caching and error handling
   */ async makeRequest(endpoint, params = {}) {
    // Check if API is configured
    if (!this.isConfigured()) {
      throw new Error('Spoonacular API key not configured. Please check your .env file.');
    }

    // Add API key to all requests
    const urlParams = new URLSearchParams({
      apiKey: this.apiKey,
      ...params,
    });

    const url = `${this.baseURL}${endpoint}?${urlParams}`;

    // Check cache first
    const cached = this.getFromCache(url);
    if (cached) {
      return cached;
    }

    try {
      console.log(`🌐 Making Spoonacular API request: ${endpoint}`);

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('🚫 API quota exceeded. Please try again later or upgrade your plan.');
        } else if (response.status === 401) {
          throw new Error('🔑 Invalid API key. Please check your .env configuration.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access forbidden. Please check your API key permissions.');
        } else {
          throw new Error(`❌ API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Cache the response
      this.setCache(url, data);

      return data;
    } catch (error) {
      console.error('Spoonacular API Error:', error);
      throw error;
    }
  }

  /**
   * Search for recipes with various filters
   */
  async searchRecipes(query = '', options = {}) {
    const params = {
      query: query,
      number: options.number || 12,
      offset: options.offset || 0,
      addRecipeInformation: true,
      addRecipeNutrition: false,
      fillIngredients: false,
      instructionsRequired: true,
      sort: options.sort || 'popularity',
    };

    // Add diet filters
    if (options.diet) {
      params.diet = options.diet;
    }

    // Add cuisine filters
    if (options.cuisine) {
      params.cuisine = options.cuisine;
    }

    // Add meal type filters
    if (options.type) {
      params.type = options.type;
    }

    // Add cooking time filter
    if (options.maxReadyTime) {
      params.maxReadyTime = options.maxReadyTime;
    }

    // Add excluded ingredients
    if (options.excludeIngredients) {
      params.excludeIngredients = options.excludeIngredients;
    }

    try {
      const data = await this.makeRequest('/recipes/complexSearch', params);

      return {
        recipes: data.results.map((recipe) => this.normalizeRecipe(recipe)),
        totalResults: data.totalResults,
        offset: data.offset,
        number: data.number,
      };
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  }

  /**
   * Get detailed recipe information including ingredients and instructions
   */
  async getRecipeDetails(recipeId) {
    try {
      const params = {
        includeNutrition: true,
      };

      const recipe = await this.makeRequest(`/recipes/${recipeId}/information`, params);
      return this.normalizeDetailedRecipe(recipe);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  }

  /**
   * Get random recipes for featured content
   */
  async getRandomRecipes(count = 6, tags = '') {
    try {
      const params = {
        number: count,
        'include-tags': tags,
      };

      const data = await this.makeRequest('/recipes/random', params);
      return data.recipes.map((recipe) => this.normalizeDetailedRecipe(recipe));
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  }

  /**
   * Get recipes by multiple IDs
   */
  async getRecipesByIds(ids) {
    try {
      const params = {
        ids: ids.join(','),
        includeNutrition: false,
      };

      const data = await this.makeRequest('/recipes/informationBulk', params);
      return data.map((recipe) => this.normalizeDetailedRecipe(recipe));
    } catch (error) {
      console.error('Error fetching recipes by IDs:', error);
      throw error;
    }
  }

  /**
   * Search recipes by ingredients
   */
  async searchByIngredients(ingredients, number = 12) {
    try {
      const params = {
        ingredients: ingredients.join(','),
        number: number,
        ranking: 1, // Maximize used ingredients
        ignorePantry: true,
      };

      const data = await this.makeRequest('/recipes/findByIngredients', params);

      // Get full recipe information for each result
      const recipeIds = data.map((recipe) => recipe.id);
      if (recipeIds.length > 0) {
        return await this.getRecipesByIds(recipeIds);
      }

      return [];
    } catch (error) {
      console.error('Error searching by ingredients:', error);
      throw error;
    }
  }

  /**
   * Get recipe nutrition information
   */
  async getRecipeNutrition(recipeId) {
    try {
      const nutrition = await this.makeRequest(`/recipes/${recipeId}/nutritionWidget.json`);
      return this.normalizeNutrition(nutrition);
    } catch (error) {
      console.error('Error fetching recipe nutrition:', error);
      throw error;
    }
  }

  /**
   * Normalize recipe data from search results to match our app format
   */
  normalizeRecipe(spoonacularRecipe) {
    return {
      id: spoonacularRecipe.id,
      title: spoonacularRecipe.title,
      description: spoonacularRecipe.summary
        ? this.stripHtml(spoonacularRecipe.summary).substring(0, 150) + '...'
        : 'Delicious recipe from Spoonacular',
      cookingTime: spoonacularRecipe.readyInMinutes || 30,
      servings: spoonacularRecipe.servings || 4,
      calories:
        spoonacularRecipe.nutrition?.nutrients?.find((n) => n.name === 'Calories')?.amount || 0,
      difficulty: this.getDifficultyFromTime(spoonacularRecipe.readyInMinutes),
      tags: spoonacularRecipe.dishTypes || [],
      dietaryInfo: this.extractDietaryInfo(spoonacularRecipe),
      ingredients: [], // Will be populated when fetching detailed recipe
      instructions: [], // Will be populated when fetching detailed recipe
      image:
        spoonacularRecipe.image ||
        `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(spoonacularRecipe.title)}`,
      category: this.categorizeRecipe(spoonacularRecipe.dishTypes),
      cuisine: spoonacularRecipe.cuisines?.[0] || 'international',
      rating: spoonacularRecipe.spoonacularScore
        ? Math.round(spoonacularRecipe.spoonacularScore / 20)
        : 4,
      source: 'spoonacular',
      sourceUrl: spoonacularRecipe.sourceUrl,
      creditsText: spoonacularRecipe.creditsText,
    };
  }

  /**
   * Normalize detailed recipe data including ingredients and instructions
   */
  normalizeDetailedRecipe(spoonacularRecipe) {
    const baseRecipe = this.normalizeRecipe(spoonacularRecipe);

    return {
      ...baseRecipe,
      ingredients: this.normalizeIngredients(spoonacularRecipe.extendedIngredients || []),
      instructions: this.normalizeInstructions(spoonacularRecipe.analyzedInstructions || []),
      nutrition: spoonacularRecipe.nutrition
        ? this.normalizeNutrition(spoonacularRecipe.nutrition)
        : null,
      winePairing: spoonacularRecipe.winePairing,
      tips: spoonacularRecipe.tips || [],
    };
  }

  /**
   * Normalize ingredients to our app format
   */
  normalizeIngredients(spoonacularIngredients) {
    return spoonacularIngredients.map((ingredient) => ({
      name: ingredient.name || ingredient.original,
      amount: ingredient.measures?.metric?.amount
        ? `${ingredient.measures.metric.amount} ${ingredient.measures.metric.unitLong}`
        : ingredient.original,
      category: ingredient.aisle || 'other',
      image: ingredient.image
        ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`
        : null,
    }));
  }

  /**
   * Normalize instructions to our app format
   */
  normalizeInstructions(spoonacularInstructions) {
    if (!spoonacularInstructions.length) return [];

    const instructions = spoonacularInstructions[0]?.steps || [];
    return instructions.map((step) => step.step);
  }

  /**
   * Normalize nutrition data
   */
  normalizeNutrition(nutrition) {
    if (!nutrition.nutrients) return null;

    const nutrients = nutrition.nutrients.reduce((acc, nutrient) => {
      acc[nutrient.name.toLowerCase()] = {
        amount: nutrient.amount,
        unit: nutrient.unit,
        percentOfDailyNeeds: nutrient.percentOfDailyNeeds,
      };
      return acc;
    }, {});

    return {
      calories: nutrients.calories?.amount || 0,
      protein: nutrients.protein?.amount || 0,
      carbs: nutrients.carbohydrates?.amount || 0,
      fat: nutrients.fat?.amount || 0,
      fiber: nutrients.fiber?.amount || 0,
      sugar: nutrients.sugar?.amount || 0,
      nutrients: nutrients,
    };
  }

  /**
   * Extract dietary information from recipe data
   */
  extractDietaryInfo(recipe) {
    const dietInfo = [];

    if (recipe.vegetarian) dietInfo.push('vegetarian');
    if (recipe.vegan) dietInfo.push('vegan');
    if (recipe.glutenFree) dietInfo.push('gluten-free');
    if (recipe.dairyFree) dietInfo.push('dairy-free');
    if (recipe.veryHealthy) dietInfo.push('healthy');
    if (recipe.cheap) dietInfo.push('budget-friendly');
    if (recipe.veryPopular) dietInfo.push('popular');
    if (recipe.sustainable) dietInfo.push('sustainable');
    if (recipe.ketogenic) dietInfo.push('keto');
    if (recipe.whole30) dietInfo.push('whole30');

    return dietInfo;
  }

  /**
   * Categorize recipe based on dish types
   */
  categorizeRecipe(dishTypes = []) {
    const categories = {
      breakfast: ['breakfast', 'brunch', 'morning meal'],
      lunch: ['lunch', 'salad', 'soup', 'sandwich'],
      dinner: ['dinner', 'main course', 'main dish'],
      dessert: ['dessert', 'sweet', 'cake', 'cookie', 'ice cream'],
      snack: ['snack', 'appetizer', 'side dish', 'fingerfood'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (
        dishTypes.some((type) => keywords.some((keyword) => type.toLowerCase().includes(keyword)))
      ) {
        return category;
      }
    }

    return 'dinner'; // Default category
  }

  /**
   * Determine difficulty based on cooking time
   */
  getDifficultyFromTime(readyInMinutes) {
    if (!readyInMinutes) return 'easy';
    if (readyInMinutes <= 30) return 'easy';
    if (readyInMinutes <= 60) return 'intermediate';
    return 'advanced';
  }

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Cache management methods
   */
  getFromCache(key) {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log('Using cached data for:', key);
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.requestCache.set(key, {
      data: data,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    if (this.requestCache.size > 100) {
      const oldestKey = this.requestCache.keys().next().value;
      this.requestCache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.requestCache.clear();
  }

  /**
   * Get API usage information (for monitoring quota)
   */
  async getAPIUsage() {
    try {
      // This endpoint might not be available in all Spoonacular plans
      return await this.makeRequest('/recipes/quota');
    } catch (error) {
      console.warn('Could not fetch API usage:', error);
      return null;
    }
  }
}
