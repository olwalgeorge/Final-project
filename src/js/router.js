/**
 * Simple client-side router for the Kitoweo Recipe App
 * Handles hash-based routing without external dependencies
 */

import { qs } from './utils.js';

export default class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '';
    this.defaultRoute = 'home';
  }

  init() {
    // Register routes
    this.addRoute('home', () => this.loadHomePage());
    this.addRoute('recipes', () => this.loadRecipesPage());
    this.addRoute('recipe/:id', (params) => this.loadRecipeDetail(params.id));
    this.addRoute('meal-planner', () => this.loadMealPlannerPage());
    this.addRoute('shopping-list', () => this.loadShoppingListPage());
    this.addRoute('preferences', () => this.loadPreferencesPage());

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    
    // Handle initial route
    this.handleRouteChange();
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || this.defaultRoute;
    const [route, ...params] = hash.split('/');
    
    // Parse query parameters
    const queryParams = this.parseQueryParams(hash);
    
    this.currentRoute = route;
    this.navigate(route, params, queryParams);
  }

  navigate(route, params = [], queryParams = {}) {
    // Check for exact route match first
    if (this.routes[route]) {
      this.routes[route]({ params, queryParams });
      return;
    }

    // Check for parameterized routes
    for (const [routePath, handler] of Object.entries(this.routes)) {
      if (routePath.includes(':')) {
        const match = this.matchParameterizedRoute(routePath, route, params);
        if (match) {
          handler({ ...match, queryParams });
          return;
        }
      }
    }

    // Fallback to home if route not found
    console.warn(`Route not found: ${route}`);
    this.routes[this.defaultRoute]({ params: [], queryParams: {} });
  }

  matchParameterizedRoute(routePath, currentRoute, params) {
    const routeParts = routePath.split('/');
    const currentParts = [currentRoute, ...params];

    if (routeParts.length !== currentParts.length) {
      return null;
    }

    const matchedParams = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const currentPart = currentParts[i];

      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        matchedParams[paramName] = currentPart;
      } else if (routePart !== currentPart) {
        return null;
      }
    }

    return matchedParams;
  }

  parseQueryParams(hash) {
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = hash.slice(queryIndex + 1);
    const params = {};

    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });

    return params;
  }

  // Route handlers
  loadHomePage() {
    console.log('Router: Loading home page');
    // Will be handled by main app
  }

  loadRecipesPage() {
    console.log('Router: Loading recipes page');
    // Will be handled by main app
  }

  loadRecipeDetail(recipeId) {
    console.log('Router: Loading recipe detail for:', recipeId);
    // Will be handled by main app
  }

  loadMealPlannerPage() {
    console.log('Router: Loading meal planner');
    // Will be handled by main app
  }

  loadShoppingListPage() {
    console.log('Router: Loading shopping list');
    // Will be handled by main app
  }

  loadPreferencesPage() {
    console.log('Router: Loading preferences');
    // Will be handled by main app
  }

  // Public method to programmatically navigate
  goTo(route) {
    window.location.hash = route;
  }
}
