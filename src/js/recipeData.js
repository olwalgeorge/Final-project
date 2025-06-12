/**
 * Recipe data service for Kitoweo app
 * Handles all recipe-related API calls and data management
 */

const BASE_URL = 'https://api.kitoweo.com'; // This would be your actual API endpoint

export default class RecipeDataSource {
  constructor() {
    // For now, we'll use mock data. In production, this would connect to your API
    this.mockRecipes = [
      {
        id: 1,
        title: "Swahili Pilau",
        description: "Traditional aromatic rice dish with meat and spices",
        cookingTime: 45,
        servings: 4,
        calories: 420,
        difficulty: "intermediate",
        tags: ["traditional", "swahili", "rice"],
        dietaryInfo: [],
        ingredients: [
          { name: "Basmati rice", amount: "2 cups", category: "grains" },
          { name: "Beef", amount: "500g", category: "meat" },
          { name: "Onions", amount: "2 large", category: "vegetables" },
          { name: "Garlic", amount: "4 cloves", category: "aromatics" },
          { name: "Ginger", amount: "1 inch piece", category: "aromatics" },
          { name: "Pilau masala", amount: "2 tbsp", category: "spices" }
        ],
        instructions: [
          "Soak rice for 30 minutes",
          "Brown the meat with whole spices",
          "Add onions and cook until golden",
          "Add rice and stock, simmer for 20 minutes"
        ],
        image: "https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Swahili+Pilau",
        mealType: ["lunch", "dinner"],
        cuisine: "swahili"
      },
      {
        id: 2,
        title: "Swahili Biryani",
        description: "Fragrant layered rice dish with tender meat and aromatic spices",
        cookingTime: 60,
        servings: 6,
        calories: 480,
        difficulty: "advanced",
        tags: ["traditional", "swahili", "rice", "layered"],
        dietaryInfo: [],
        ingredients: [
          { name: "Basmati rice", amount: "3 cups", category: "grains" },
          { name: "Mutton/Goat meat", amount: "750g", category: "meat" },
          { name: "Yogurt", amount: "1 cup", category: "dairy" },
          { name: "Fried onions", amount: "1 cup", category: "vegetables" },
          { name: "Saffron", amount: "1/2 tsp", category: "spices" },
          { name: "Biryani masala", amount: "2 tbsp", category: "spices" }
        ],
        instructions: [
          "Marinate meat in yogurt and spices",
          "Partially cook rice with whole spices",
          "Layer meat and rice alternately",
          "Cook on low heat for 45 minutes"
        ],
        image: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Swahili+Biryani",
        mealType: ["lunch", "dinner"],
        cuisine: "swahili"
      },
      {
        id: 3,
        title: "Mbaazi wa Nazi",
        description: "Pigeon peas cooked in rich coconut curry sauce",
        cookingTime: 40,
        servings: 4,
        calories: 350,
        difficulty: "beginner",
        tags: ["traditional", "vegetarian", "coconut"],
        dietaryInfo: ["vegetarian", "gluten-free"],
        ingredients: [
          { name: "Pigeon peas", amount: "2 cups", category: "legumes" },
          { name: "Coconut milk", amount: "400ml", category: "dairy" },
          { name: "Onions", amount: "1 large", category: "vegetables" },
          { name: "Tomatoes", amount: "2 medium", category: "vegetables" },
          { name: "Curry powder", amount: "1 tbsp", category: "spices" },
          { name: "Coriander", amount: "1/4 cup", category: "herbs" }
        ],
        instructions: [
          "Soak pigeon peas overnight",
          "Cook peas until tender",
          "Prepare coconut curry base",
          "Combine and simmer for 15 minutes"
        ],
        image: "https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Mbaazi+wa+Nazi",
        mealType: ["lunch", "dinner"],
        cuisine: "swahili"
      }
    ];
  }

  async getAllRecipes() {
    // Simulate API delay
    await this.delay(500);
    return this.mockRecipes;
  }

  async getRecipeById(id) {
    await this.delay(300);
    return this.mockRecipes.find(recipe => recipe.id === parseInt(id));
  }

  async searchRecipes(query, filters = {}) {
    await this.delay(400);
    
    let results = [...this.mockRecipes];
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        recipe.cuisine.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    if (filters.dietaryInfo && filters.dietaryInfo.length > 0) {
      results = results.filter(recipe => 
        filters.dietaryInfo.some(diet => recipe.dietaryInfo.includes(diet))
      );
    }
    
    if (filters.mealType) {
      results = results.filter(recipe => 
        recipe.mealType.includes(filters.mealType)
      );
    }
    
    if (filters.maxCookingTime) {
      results = results.filter(recipe => 
        recipe.cookingTime <= filters.maxCookingTime
      );
    }
    
    if (filters.maxCalories) {
      results = results.filter(recipe => 
        recipe.calories <= filters.maxCalories
      );
    }
    
    return results;
  }

  async getFeaturedRecipes(limit = 3) {
    await this.delay(300);
    return this.mockRecipes.slice(0, limit);
  }

  async getRecipesByCategory(category) {
    await this.delay(300);
    return this.mockRecipes.filter(recipe => 
      recipe.mealType.includes(category.toLowerCase())
    );
  }

  // Utility method to simulate API delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Future methods for when you have a real API
  async createRecipe(recipeData) {
    // Would make POST request to API
    console.log('Creating recipe:', recipeData);
  }

  async updateRecipe(id, recipeData) {
    // Would make PUT request to API
    console.log('Updating recipe:', id, recipeData);
  }

  async deleteRecipe(id) {
    // Would make DELETE request to API
    console.log('Deleting recipe:', id);
  }
}
