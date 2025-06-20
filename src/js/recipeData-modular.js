/**
 * Recipe Data Source (Modular Version)
 * Handles all recipe-related data operations with dynamic JSON loading
 */

import SpoonacularAPI from './spoonacularAPI.js';
import dataService from './dataService.js';

export default class RecipeDataSource {
  constructor() {
    this.spoonacularAPI = new SpoonacularAPI();
    this.useAPI = true; // Set to false to use mock data only
    this.mockDataFallback = true; // Use mock data when API fails
    this.mockData = null; // Cached mock data
  }

  /**
   * Load mock data from JSON file
   */ async loadMockData() {
    if (!this.mockData) {
      try {
        const data = await dataService.loadAllData();
        this.mockData = data;
        console.log('📁 All data loaded from JSON files:', {
          recipes: data.recipes.length,
          categories: data.categories.length,
          cuisines: data.cuisines.length,
          dietary: data.dietary.length,
        });
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Fallback to individual file loading
        try {
          const mockData = await dataService.loadMockData();
          this.mockData = {
            recipes: mockData.recipes || [],
            categories: mockData.categories || [],
            cuisines: mockData.cuisines || [],
            dietary: [],
          };
        } catch (fallbackError) {
          console.error('❌ Fallback loading failed:', fallbackError);
          this.mockData = { recipes: [], categories: [], cuisines: [], dietary: [] };
        }
      }
    }
    return this.mockData;
  }

  /**
   * Toggle between API and mock data
   */
  setUseAPI(useAPI) {
    this.useAPI = useAPI;
  }

  /**
   * Search for recipes with filters
   */
  async searchRecipes(query = '', options = {}) {
    console.log('🔍 RecipeDataSource.searchRecipes called:', {
      query,
      options,
      useAPI: this.useAPI,
    });

    if (this.useAPI) {
      try {
        console.log('🌐 Searching recipes via Spoonacular API...');
        const result = await this.spoonacularAPI.searchRecipes(query, {
          number: options.number || 12,
          diet: options.diet,
          cuisine: options.cuisine,
          type: options.type,
          maxReadyTime: options.maxReadyTime,
          sort: options.sort,
        });
        console.log('✅ API search result:', result);
        console.log('📊 Recipes found:', result.recipes?.length || 0);
        return result.recipes;
      } catch (error) {
        console.error('❌ Spoonacular API search failed:', error);

        if (this.mockDataFallback) {
          console.log('🔄 Falling back to JSON mock data...');
          return this.searchMockRecipes(query, options);
        }
        throw error;
      }
    }

    return this.searchMockRecipes(query, options);
  }

  /**
   * Get all available recipes
   */
  async getAllRecipes() {
    if (this.useAPI) {
      try {
        console.log('🌐 Fetching popular recipes via Spoonacular API...');
        const result = await this.spoonacularAPI.searchRecipes('', {
          number: 24,
          sort: 'popularity',
        });
        return result.recipes;
      } catch (error) {
        console.error('❌ Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('🔄 Falling back to JSON mock data...');
          const mockData = await this.loadMockData();
          return mockData.recipes;
        }
        throw error;
      }
    }

    const mockData = await this.loadMockData();
    return mockData.recipes;
  }

  /**
   * Get featured recipes for homepage
   */
  async getFeaturedRecipes(count = 3) {
    if (this.useAPI) {
      try {
        console.log('🌟 Fetching featured recipes via Spoonacular API...');
        const recipes = await this.spoonacularAPI.getRandomRecipes(count, 'healthy,popular');
        return recipes;
      } catch (error) {
        console.error('❌ Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('🔄 Falling back to JSON mock data...');
          const mockData = await this.loadMockData();
          return mockData.recipes.slice(0, count);
        }
        throw error;
      }
    }

    const mockData = await this.loadMockData();
    return mockData.recipes.slice(0, count);
  }

  /**
   * Get a specific recipe by ID
   */
  async getRecipeById(id) {
    if (this.useAPI && typeof id === 'number' && id > 1000) {
      try {
        console.log(`🌐 Fetching recipe ${id} via Spoonacular API...`);
        return await this.spoonacularAPI.getRecipeDetails(id);
      } catch (error) {
        console.error('❌ Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('🔄 Falling back to JSON mock data...');
          const mockData = await this.loadMockData();
          return mockData.recipes.find((recipe) => recipe.id == id);
        }
        throw error;
      }
    }

    // For mock data or small IDs, use JSON mock data
    const mockData = await this.loadMockData();
    return mockData.recipes.find((recipe) => recipe.id == id);
  }

  /**
   * Search recipes by ingredients
   */
  async searchByIngredients(ingredients) {
    if (this.useAPI) {
      try {
        console.log('🥕 Searching by ingredients via Spoonacular API...');
        return await this.spoonacularAPI.searchByIngredients(ingredients);
      } catch (error) {
        console.error('❌ Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('🔄 Falling back to JSON mock data...');
          return this.searchMockByIngredients(ingredients);
        }
        throw error;
      }
    }

    return this.searchMockByIngredients(ingredients);
  }

  /**
   * Get recipe categories from JSON
   */
  async getCategories() {
    const mockData = await this.loadMockData();
    return (
      mockData.categories || [
        { id: 'breakfast', name: 'Breakfast', icon: '🍳', color: '#FF6B35' },
        { id: 'lunch', name: 'Lunch', icon: '🥗', color: '#4CAF50' },
        { id: 'dinner', name: 'Dinner', icon: '🍽️', color: '#2196F3' },
        { id: 'dessert', name: 'Desserts', icon: '🍰', color: '#E91E63' },
        { id: 'snack', name: 'Snacks', icon: '🥨', color: '#FF9800' },
        { id: 'drink', name: 'Drinks', icon: '🥤', color: '#9C27B0' },
      ]
    );
  }

  /**
   * Get cuisine types from JSON
   */
  async getCuisines() {
    const mockData = await this.loadMockData();
    return (
      mockData.cuisines || [
        { id: 'swahili', name: 'Swahili', flag: '🇰🇪' },
        { id: 'indian', name: 'Indian', flag: '🇮🇳' },
        { id: 'italian', name: 'Italian', flag: '🇮🇹' },
        { id: 'american', name: 'American', flag: '🇺🇸' },
        { id: 'mexican', name: 'Mexican', flag: '🇲🇽' },
        { id: 'chinese', name: 'Chinese', flag: '🇨🇳' },
      ]
    );
  }

  /**
   * Search mock recipes (JSON-based)
   */
  async searchMockRecipes(query = '', options = {}) {
    const mockData = await this.loadMockData();
    let results = [...mockData.recipes];

    // Apply text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchTerm)) ||
          recipe.cuisine.toLowerCase().includes(searchTerm)
      );
    }

    // Apply dietary filters
    if (options.diet) {
      const dietFilters = Array.isArray(options.diet) ? options.diet : [options.diet];
      results = results.filter((recipe) =>
        dietFilters.some((diet) =>
          recipe.dietaryInfo.some((info) => info.toLowerCase().includes(diet.toLowerCase()))
        )
      );
    }

    // Apply cuisine filter
    if (options.cuisine) {
      results = results.filter(
        (recipe) => recipe.cuisine.toLowerCase() === options.cuisine.toLowerCase()
      );
    }

    // Apply meal type filter
    if (options.type) {
      results = results.filter((recipe) => recipe.mealType.includes(options.type.toLowerCase()));
    }

    // Apply cooking time filter
    if (options.maxReadyTime) {
      results = results.filter((recipe) => recipe.cookingTime <= options.maxReadyTime);
    }

    // Apply sorting
    if (options.sort) {
      switch (options.sort) {
        case 'time':
          results.sort((a, b) => a.cookingTime - b.cookingTime);
          break;
        case 'calories':
          results.sort((a, b) => a.calories - b.calories);
          break;
        case 'rating':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // Keep original order for relevance
          break;
      }
    }

    // Apply limit
    if (options.number) {
      results = results.slice(0, options.number);
    }

    console.log('📊 Mock search results:', results.length, 'recipes found');
    return results;
  }

  /**
   * Search mock recipes by ingredients
   */
  async searchMockByIngredients(ingredients) {
    const mockData = await this.loadMockData();
    const searchTerms = ingredients.map((ing) => ing.toLowerCase());

    const results = mockData.recipes.filter((recipe) =>
      searchTerms.some((term) =>
        recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(term))
      )
    );

    return results;
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(category) {
    const mockData = await this.loadMockData();
    return mockData.recipes.filter((recipe) => recipe.mealType.includes(category.toLowerCase()));
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisine) {
    const mockData = await this.loadMockData();
    return mockData.recipes.filter(
      (recipe) => recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  /**
   * Get API status and usage information
   */
  async getAPIStatus() {
    const apiStatus = this.spoonacularAPI.getStatus();

    if (!this.useAPI) {
      return {
        status: 'disabled',
        configured: apiStatus.configured,
        usingMockData: true,
        message: 'Using JSON mock data only',
      };
    }

    if (!apiStatus.configured) {
      return {
        status: 'not-configured',
        configured: false,
        usingMockData: this.mockDataFallback,
        message: 'API key not configured. Using JSON mock data.',
      };
    }

    try {
      // Test API connection with a minimal request
      await this.spoonacularAPI.searchRecipes('test', { number: 1 });

      return {
        status: 'active',
        configured: true,
        usingMockData: false,
        message: 'Spoonacular API is working correctly',
        apiKey: apiStatus.apiKey,
        cacheSize: apiStatus.cacheSize,
      };
    } catch (error) {
      return {
        status: 'error',
        configured: apiStatus.configured,
        usingMockData: this.mockDataFallback,
        error: error.message,
        message: `API error: ${error.message}. Using JSON mock data.`,
      };
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.mockData = null;
    this.spoonacularAPI.clearCache();
    dataService.clearCache();
  }
}
