/**
 * Data Service
 * Handles loading and caching of JSON data
 */

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load JSON data with caching
   */
  async loadJSON(url) {
    const cacheKey = url;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      return cachedData.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }

      const data = await response.json();

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Error loading JSON:', error);
      throw error;
    }
  } /**
   * Load mock recipes data
   */
  async loadMockData() {
    return await this.loadJSON('/data/mockData.json');
  }

  /**
   * Load categories data
   */
  async loadCategories() {
    return await this.loadJSON('/data/categories.json');
  }

  /**
   * Load cuisines data
   */
  async loadCuisines() {
    return await this.loadJSON('/data/cuisines.json');
  }

  /**
   * Load dietary restrictions data
   */
  async loadDietaryOptions() {
    return await this.loadJSON('/data/dietary.json');
  }

  /**
   * Load app configuration
   */
  async loadConfig() {
    return await this.loadJSON('/data/config.json');
  }

  /**
   * Load all data sources at once
   */
  async loadAllData() {
    try {
      const [mockData, categories, cuisines, dietary, config] = await Promise.all([
        this.loadMockData(),
        this.loadCategories(),
        this.loadCuisines(),
        this.loadDietaryOptions(),
        this.loadConfig(),
      ]);

      return {
        recipes: mockData.recipes || [],
        categories: categories.categories || [],
        cuisines: cuisines.cuisines || [],
        dietary: dietary.dietary || [],
        config: config,
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Create singleton instance
export const dataService = new DataService();
export default dataService;
