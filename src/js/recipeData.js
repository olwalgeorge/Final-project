/**
 * Recipe data service for Kitoweo app
 * Handles all recipe-related API calls and data management
 * Integrates with Spoonacular API and provides fallback to mock data
 */

import SpoonacularAPI from './spoonacularAPI.js';

export default class RecipeDataSource {
  constructor() {
    this.spoonacularAPI = new SpoonacularAPI();
    this.useAPI = true; // Set to false to use mock data only
    this.mockDataFallback = true; // Use mock data when API fails

    this.initializeMockData();
  }

  /**
   * Toggle between API and mock data
   */
  setUseAPI(useAPI) {
    this.useAPI = useAPI;
  }

  /**
   * Search for recipes with filters
   */ async searchRecipes(query = '', options = {}) {
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
        console.error('❌ Full error details:', error.stack);

        // Temporarily disable fallback to see the real error
        if (false && this.mockDataFallback) {
          console.log('🔄 Falling back to mock data...');
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
        console.log('Fetching popular recipes via Spoonacular API...');
        const result = await this.spoonacularAPI.searchRecipes('', {
          number: 24,
          sort: 'popularity',
        });
        return result.recipes;
      } catch (error) {
        console.error('Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('Falling back to mock data...');
          return this.mockRecipes;
        }
        throw error;
      }
    }

    return this.mockRecipes;
  }

  /**
   * Get featured recipes for homepage
   */
  async getFeaturedRecipes(count = 3) {
    if (this.useAPI) {
      try {
        console.log('Fetching featured recipes via Spoonacular API...');
        const recipes = await this.spoonacularAPI.getRandomRecipes(count, 'healthy,popular');
        return recipes;
      } catch (error) {
        console.error('Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('Falling back to mock data...');
          return this.mockRecipes.slice(0, count);
        }
        throw error;
      }
    }

    return this.mockRecipes.slice(0, count);
  }

  /**
   * Get a specific recipe by ID
   */
  async getRecipeById(id) {
    if (this.useAPI && typeof id === 'number' && id > 1000) {
      try {
        console.log(`Fetching recipe ${id} via Spoonacular API...`);
        return await this.spoonacularAPI.getRecipeDetails(id);
      } catch (error) {
        console.error('Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('Falling back to mock data...');
          return this.mockRecipes.find((recipe) => recipe.id == id);
        }
        throw error;
      }
    }

    // For mock data or small IDs, use mock recipes
    return this.mockRecipes.find((recipe) => recipe.id == id);
  }

  /**
   * Search recipes by ingredients
   */
  async searchByIngredients(ingredients) {
    if (this.useAPI) {
      try {
        console.log('Searching by ingredients via Spoonacular API...');
        return await this.spoonacularAPI.searchByIngredients(ingredients);
      } catch (error) {
        console.error('Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('Falling back to mock data...');
          return this.searchMockByIngredients(ingredients);
        }
        throw error;
      }
    }

    return this.searchMockByIngredients(ingredients);
  }

  /**
   * Get recipe categories
   */
  getCategories() {
    return [
      { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
      { id: 'lunch', name: 'Lunch', icon: '🥗' },
      { id: 'dinner', name: 'Dinner', icon: '🍽️' },
      { id: 'dessert', name: 'Desserts', icon: '🍰' },
      { id: 'snack', name: 'Snacks', icon: '🥨' },
      { id: 'drink', name: 'Drinks', icon: '🥤' },
    ];
  }

  /**
   * Search mock recipes (fallback method)
   */
  searchMockRecipes(query = '', options = {}) {
    let results = [...this.mockRecipes];

    // Apply text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchTerm))
      );
    }

    // Apply dietary filters
    if (options.dietaryInfo && options.dietaryInfo.length > 0) {
      results = results.filter((recipe) =>
        options.dietaryInfo.some((diet) => recipe.dietaryInfo.includes(diet.toLowerCase()))
      );
    }

    // Apply category filter
    if (options.category) {
      results = results.filter((recipe) => recipe.category === options.category.toLowerCase());
    }

    return results;
  }

  /**
   * Search mock recipes by ingredients
   */
  searchMockByIngredients(ingredients) {
    const searchTerms = ingredients.map((ing) => ing.toLowerCase());

    return this.mockRecipes.filter((recipe) =>
      searchTerms.some((term) =>
        recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(term))
      )
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
        message: 'Using mock data only',
      };
    }

    if (!apiStatus.configured) {
      return {
        status: 'not-configured',
        configured: false,
        usingMockData: this.mockDataFallback,
        message: 'API key not configured. Check your .env file.',
      };
    }

    try {
      // Test API connection with a minimal request
      await this.spoonacularAPI.searchRecipes('test', { number: 1 });

      return {
        status: 'active',
        configured: true,
        usingMockData: false,
        message: 'API is working correctly',
        apiKey: apiStatus.apiKey,
        cacheSize: apiStatus.cacheSize,
      };
    } catch (error) {
      return {
        status: 'error',
        configured: apiStatus.configured,
        usingMockData: this.mockDataFallback,
        error: error.message,
        message: `API error: ${error.message}`,
      };
    }
  }

  /**
   * Initialize mock data for fallback
   */
  initializeMockData() {
    this.mockRecipes = [
      {
        id: 1,
        title: 'Swahili Pilau',
        description: 'Traditional aromatic rice dish with meat and spices',
        cookingTime: 45,
        servings: 4,
        calories: 420,
        difficulty: 'intermediate',
        tags: ['traditional', 'swahili', 'rice'],
        dietaryInfo: [],
        ingredients: [
          { name: 'Basmati rice', amount: '2 cups', category: 'grains' },
          { name: 'Beef', amount: '500g', category: 'meat' },
          { name: 'Onions', amount: '2 large', category: 'vegetables' },
          { name: 'Garlic', amount: '4 cloves', category: 'aromatics' },
          { name: 'Ginger', amount: '1 inch piece', category: 'aromatics' },
          { name: 'Pilau masala', amount: '2 tbsp', category: 'spices' },
        ],
        instructions: [
          'Soak rice for 30 minutes',
          'Brown the meat with whole spices',
          'Add onions and cook until golden',
          'Add rice and stock, simmer for 20 minutes',
        ],
        image: '/images/recipes/swahili-pilau.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'swahili',
      },
      {
        id: 2,
        title: 'Swahili Biryani',
        description: 'Fragrant layered rice dish with tender meat and aromatic spices',
        cookingTime: 60,
        servings: 6,
        calories: 480,
        difficulty: 'advanced',
        tags: ['traditional', 'swahili', 'rice', 'layered'],
        dietaryInfo: [],
        ingredients: [
          { name: 'Basmati rice', amount: '3 cups', category: 'grains' },
          { name: 'Mutton/Goat meat', amount: '750g', category: 'meat' },
          { name: 'Yogurt', amount: '1 cup', category: 'dairy' },
          { name: 'Fried onions', amount: '1 cup', category: 'vegetables' },
          { name: 'Saffron', amount: '1/2 tsp', category: 'spices' },
          { name: 'Biryani masala', amount: '2 tbsp', category: 'spices' },
        ],
        instructions: [
          'Marinate meat in yogurt and spices',
          'Partially cook rice with whole spices',
          'Layer meat and rice alternately',
          'Cook on low heat for 45 minutes',
        ],
        image: '/images/recipes/swahili-biryani.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'swahili',
      },
      {
        id: 3,
        title: 'Mbaazi wa Nazi',
        description: 'Pigeon peas cooked in rich coconut curry sauce',
        cookingTime: 40,
        servings: 4,
        calories: 350,
        difficulty: 'beginner',
        tags: ['traditional', 'vegetarian', 'coconut'],
        dietaryInfo: ['vegetarian', 'gluten-free'],
        ingredients: [
          { name: 'Pigeon peas', amount: '2 cups', category: 'legumes' },
          { name: 'Coconut milk', amount: '400ml', category: 'dairy' },
          { name: 'Onions', amount: '1 large', category: 'vegetables' },
          { name: 'Tomatoes', amount: '2 medium', category: 'vegetables' },
          { name: 'Curry powder', amount: '1 tbsp', category: 'spices' },
          { name: 'Coriander', amount: '1/4 cup', category: 'herbs' },
        ],
        instructions: [
          'Soak pigeon peas overnight',
          'Cook peas until tender',
          'Prepare coconut curry base',
          'Combine and simmer for 15 minutes',
        ],
        image: '/images/recipes/mbaazi-wa-nazi.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'swahili',
      },
      {
        id: 4,
        title: 'Swahili Chicken Curry',
        description: 'Tender chicken pieces in aromatic coconut curry sauce',
        cookingTime: 35,
        servings: 4,
        calories: 380,
        difficulty: 'intermediate',
        tags: ['traditional', 'swahili', 'curry', 'chicken'],
        dietaryInfo: ['gluten-free'],
        ingredients: [
          { name: 'Chicken', amount: '1 kg', category: 'meat' },
          { name: 'Coconut milk', amount: '400ml', category: 'dairy' },
          { name: 'Onions', amount: '2 medium', category: 'vegetables' },
          { name: 'Tomatoes', amount: '3 medium', category: 'vegetables' },
          { name: 'Curry powder', amount: '2 tbsp', category: 'spices' },
          { name: 'Ginger', amount: '1 inch piece', category: 'aromatics' },
        ],
        instructions: [
          'Cut chicken into pieces',
          'Sauté onions until golden',
          'Add chicken and brown',
          'Add coconut milk and simmer for 25 minutes',
        ],
        image: '/images/recipes/swahili-chicken-curry.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'swahili',
      },
      {
        id: 5,
        title: 'Kuku wa Nazi',
        description: 'Traditional Swahili chicken cooked in coconut milk',
        cookingTime: 40,
        servings: 6,
        calories: 420,
        difficulty: 'beginner',
        tags: ['traditional', 'swahili', 'coconut', 'chicken'],
        dietaryInfo: ['gluten-free'],
        ingredients: [
          { name: 'Chicken pieces', amount: '1.5 kg', category: 'meat' },
          { name: 'Coconut milk', amount: '500ml', category: 'dairy' },
          { name: 'Onions', amount: '1 large', category: 'vegetables' },
          { name: 'Garlic', amount: '4 cloves', category: 'aromatics' },
          { name: 'Green chilies', amount: '2 pieces', category: 'spices' },
          { name: 'Coriander', amount: '1/4 cup', category: 'herbs' },
        ],
        instructions: [
          'Marinate chicken with spices',
          'Cook onions until soft',
          'Add chicken and cook until tender',
          'Pour coconut milk and simmer',
        ],
        image: '/images/recipes/kuku-wa-nazi.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'swahili',
      },
      {
        id: 6,
        title: 'Chicken Biriyani',
        description: 'Layered chicken and rice dish with aromatic spices',
        cookingTime: 75,
        servings: 8,
        calories: 520,
        difficulty: 'advanced',
        tags: ['traditional', 'chicken', 'rice', 'layered'],
        dietaryInfo: [],
        ingredients: [
          { name: 'Chicken', amount: '1 kg', category: 'meat' },
          { name: 'Basmati rice', amount: '3 cups', category: 'grains' },
          { name: 'Yogurt', amount: '1 cup', category: 'dairy' },
          { name: 'Fried onions', amount: '1 cup', category: 'vegetables' },
          { name: 'Saffron', amount: '1/2 tsp', category: 'spices' },
          { name: 'Garam masala', amount: '2 tbsp', category: 'spices' },
        ],
        instructions: [
          'Marinate chicken in yogurt and spices',
          'Cook rice with whole spices until 70% done',
          'Layer chicken and rice alternately',
          'Cook on low heat for 45 minutes',
        ],
        image: '/images/recipes/chicken-biryani.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'indian',
      },
      {
        id: 7,
        title: 'Simple Pasta Marinara',
        description: 'Classic Italian pasta with fresh tomato sauce',
        cookingTime: 25,
        servings: 4,
        calories: 320,
        difficulty: 'beginner',
        tags: ['italian', 'pasta', 'vegetarian', 'quick'],
        dietaryInfo: ['vegetarian'],
        ingredients: [
          { name: 'Pasta', amount: '400g', category: 'grains' },
          { name: 'Tomatoes', amount: '6 large', category: 'vegetables' },
          { name: 'Garlic', amount: '4 cloves', category: 'aromatics' },
          { name: 'Basil', amount: '1/4 cup', category: 'herbs' },
          { name: 'Olive oil', amount: '3 tbsp', category: 'oils' },
          { name: 'Parmesan cheese', amount: '1/2 cup', category: 'dairy' },
        ],
        instructions: [
          'Cook pasta according to package directions',
          'Sauté garlic in olive oil',
          'Add tomatoes and simmer for 15 minutes',
          'Toss with pasta and fresh basil',
        ],
        image: '/images/recipes/pasta-marinara.jpg',
        mealType: ['lunch', 'dinner'],
        cuisine: 'italian',
      },
      {
        id: 8,
        title: 'Chocolate Chip Cookies',
        description: 'Soft and chewy homemade chocolate chip cookies',
        cookingTime: 30,
        servings: 24,
        calories: 180,
        difficulty: 'beginner',
        tags: ['dessert', 'cookies', 'chocolate', 'baking'],
        dietaryInfo: ['vegetarian'],
        ingredients: [
          { name: 'Flour', amount: '2 cups', category: 'grains' },
          { name: 'Butter', amount: '1 cup', category: 'dairy' },
          { name: 'Brown sugar', amount: '3/4 cup', category: 'sweeteners' },
          { name: 'Eggs', amount: '2 large', category: 'dairy' },
          { name: 'Chocolate chips', amount: '2 cups', category: 'chocolate' },
          { name: 'Vanilla extract', amount: '2 tsp', category: 'flavorings' },
        ],
        instructions: [
          'Cream butter and sugars',
          'Add eggs and vanilla',
          'Mix in flour gradually',
          'Fold in chocolate chips and bake for 12 minutes',
        ],
        image: '/images/recipes/chocolate-chip-cookies.jpg',
        mealType: ['dessert'],
        cuisine: 'american',
      },
    ];
  }

  async getAllRecipes() {
    // Simulate API delay
    await this.delay(500);
    return this.mockRecipes;
  }

  async getRecipeById(id) {
    await this.delay(300);
    return this.mockRecipes.find((recipe) => recipe.id === parseInt(id));
  }

  async searchRecipes(query, filters = {}) {
    await this.delay(400);

    let results = [...this.mockRecipes];

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          recipe.cuisine.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.dietaryInfo && filters.dietaryInfo.length > 0) {
      results = results.filter((recipe) =>
        filters.dietaryInfo.some((diet) => recipe.dietaryInfo.includes(diet))
      );
    }

    if (filters.mealType) {
      results = results.filter((recipe) => recipe.mealType.includes(filters.mealType));
    }

    if (filters.maxCookingTime) {
      results = results.filter((recipe) => recipe.cookingTime <= filters.maxCookingTime);
    }

    if (filters.maxCalories) {
      results = results.filter((recipe) => recipe.calories <= filters.maxCalories);
    }

    return results;
  }

  async getFeaturedRecipes(limit = 3) {
    await this.delay(300);
    return this.mockRecipes.slice(0, limit);
  }

  async getRecipesByCategory(category) {
    await this.delay(300);
    return this.mockRecipes.filter((recipe) => recipe.mealType.includes(category.toLowerCase()));
  }

  // Utility method to simulate API delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Future methods for when you have a real API
  async createRecipe(recipeData) {
    // Would make POST request to API    ];
  }

  /**
   * Clear API cache
   */
  clearCache() {
    if (this.spoonacularAPI) {
      this.spoonacularAPI.clearCache();
    }
  }

  /**
   * Get popular recipes by category
   */
  async getRecipesByCategory(category, count = 12) {
    if (this.useAPI) {
      try {
        console.log(`Fetching ${category} recipes via Spoonacular API...`);
        const result = await this.spoonacularAPI.searchRecipes('', {
          type: category,
          number: count,
          sort: 'popularity',
        });
        return result.recipes;
      } catch (error) {
        console.error('Spoonacular API failed:', error);
        if (this.mockDataFallback) {
          console.log('Falling back to mock data...');
          return this.mockRecipes
            .filter((recipe) => recipe.category === category.toLowerCase())
            .slice(0, count);
        }
        throw error;
      }
    }

    return this.mockRecipes
      .filter((recipe) => recipe.category === category.toLowerCase())
      .slice(0, count);
  }

  /**
   * Get recipe nutrition information
   */
  async getRecipeNutrition(recipeId) {
    if (this.useAPI && typeof recipeId === 'number' && recipeId > 1000) {
      try {
        return await this.spoonacularAPI.getRecipeNutrition(recipeId);
      } catch (error) {
        console.error('Failed to fetch nutrition:', error);
        return null;
      }
    }

    // Return mock nutrition data for mock recipes
    return {
      calories: 350,
      protein: 25,
      carbs: 40,
      fat: 15,
      fiber: 8,
      sugar: 12,
    };
  }

  /**
   * Legacy methods for backward compatibility
   */
  async createRecipe(recipeData) {
    console.log('Creating recipe:', recipeData);
    // In a real app, this would save to your backend
  }

  async updateRecipe(id, recipeData) {
    console.log('Updating recipe:', id, recipeData);
    // In a real app, this would update your backend
  }

  async deleteRecipe(id) {
    console.log('Deleting recipe:', id);
    // In a real app, this would delete from your backend
  }
}
