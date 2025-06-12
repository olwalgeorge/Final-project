/**
 * Simple router for single-page application navigation
 */

export default class Router {
  constructor() {
    this.routes = {
      '#home': 'home',
      '#recipes': 'recipes',
      '#meal-planner': 'meal-planner',
      '#shopping-list': 'shopping-list',
      '#preferences': 'preferences'
    };
    
    this.currentRoute = null;
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });

    // Handle initial route
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash || '#home';
    
    // Parse route and parameters
    const [route, ...params] = hash.split('/');
    
    if (this.routes[route]) {
      this.currentRoute = route;
      this.loadRoute(route, params);
    } else {
      // Default to home if route not found
      window.location.hash = '#home';
    }
  }

  loadRoute(route, params = []) {
    console.log(`Loading route: ${route}`, params);
    
    // For now, just log the route change
    // In a full implementation, this would load different page components
    switch (route) {
      case '#home':
        console.log('Home page loaded');
        break;
      case '#recipes':
        console.log('Recipes page loaded');
        break;
      case '#meal-planner':
        console.log('Meal planner loaded');
        break;
      case '#shopping-list':
        console.log('Shopping list loaded');
        break;
      case '#preferences':
        console.log('Preferences loaded');
        break;
      default:
        console.log('Unknown route');
    }
  }

  navigate(route) {
    window.location.hash = route;
  }
}
