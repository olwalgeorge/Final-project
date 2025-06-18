/**
 * API Settings and Status Component
 * Allows users to configure API settings and view usage
 */

import { qs, createElement } from './utils.js';

export default class APISettings {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  async renderAPISettings(container) {
    const settingsContainer = typeof container === 'string' ? qs(container) : container;
    
    // Get current API status
    const apiStatus = await this.dataSource.getAPIStatus();
    
    settingsContainer.innerHTML = `
      <div class="api-settings">
        <div class="settings-header">
          <h2>API Settings & Status</h2>
          <p class="text-secondary">Configure your recipe data sources and view API usage</p>
        </div>        <div class="settings-content">
          <div class="api-status-card">
            <h3>🔗 Spoonacular API Configuration</h3>
            <div class="status-indicator ${apiStatus.status}">
              <span class="status-dot"></span>
              <span class="status-text">${this.getStatusText(apiStatus)}</span>
            </div>
            
            <div class="api-config-info">
              <h4>📁 Environment Configuration</h4>
              <div class="config-details">
                <div class="config-item">
                  <strong>API Key Status:</strong> 
                  <span class="${apiStatus.configured ? 'text-success' : 'text-warning'}">
                    ${apiStatus.configured ? '✅ Configured' : '⚠️ Not Set'}
                  </span>
                </div>
                <div class="config-item">
                  <strong>Environment File:</strong> 
                  <code>.env</code>
                </div>
                <div class="config-item">
                  <strong>Variable Name:</strong> 
                  <code>VITE_SPOONACULAR_API_KEY</code>
                </div>
              </div>

              ${!apiStatus.configured ? `
                <div class="setup-instructions">
                  <h4>🚀 Quick Setup Guide:</h4>
                  <ol class="setup-steps">
                    <li>
                      <strong>Get API Key:</strong> 
                      Visit <a href="https://spoonacular.com/food-api/console#Dashboard" target="_blank" rel="noopener">
                        Spoonacular Console
                      </a> and create a free account
                    </li>
                    <li>
                      <strong>Create .env file:</strong> 
                      In your project root directory, create a file named <code>.env</code>
                    </li>
                    <li>
                      <strong>Add your API key:</strong> 
                      <div class="code-example">
                        <code>VITE_SPOONACULAR_API_KEY=your_api_key_here</code>
                      </div>
                    </li>
                    <li>
                      <strong>Restart server:</strong> 
                      Stop and restart your development server to load the new environment variables
                    </li>
                  </ol>
                </div>
              ` : ''}
            </div>
            
            ${apiStatus.usage ? `
              <div class="api-usage">
                <h4>📊 API Usage</h4>
                <div class="usage-stats">
                  <div class="usage-item">
                    <span class="usage-label">Requests Used:</span>
                    <span class="usage-value">${apiStatus.usage.used || 'N/A'}</span>
                  </div>
                  <div class="usage-item">
                    <span class="usage-label">Requests Remaining:</span>
                    <span class="usage-value">${apiStatus.usage.remaining || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ` : ''}

            ${apiStatus.error ? `
              <div class="error-message">
                <strong>Error:</strong> ${apiStatus.error}
              </div>
            ` : ''}
          </div>

          <div class="settings-controls">
            <h3>Data Source Settings</h3>
            
            <div class="setting-item">
              <label class="setting-label">
                <input 
                  type="checkbox" 
                  id="use-api-toggle" 
                  ${this.dataSource.useAPI ? 'checked' : ''}
                >
                <span>Use Spoonacular API</span>
              </label>
              <p class="setting-description">
                When enabled, recipes will be fetched from Spoonacular API. 
                When disabled, only local mock data will be used.
              </p>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <input 
                  type="checkbox" 
                  id="fallback-toggle" 
                  ${this.dataSource.mockDataFallback ? 'checked' : ''}
                >
                <span>Enable Mock Data Fallback</span>
              </label>
              <p class="setting-description">
                When enabled, the app will use mock data if the API fails or is unavailable.
              </p>
            </div>

            <div class="settings-actions">
              <button class="btn btn-secondary" id="clear-cache-btn">Clear API Cache</button>
              <button class="btn btn-primary" id="test-api-btn">Test API Connection</button>
            </div>
          </div>

          <div class="api-info">
            <h3>About Spoonacular API</h3>
            <p>
              The Spoonacular Food API provides access to over 5,000 recipes, ingredient information, 
              and nutrition data. This app uses the API to provide real recipe data and search functionality.
            </p>
            <div class="api-features">
              <div class="feature-item">
                <span class="feature-icon">🔍</span>
                <span>Advanced Recipe Search</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🥗</span>
                <span>Detailed Ingredients & Nutrition</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🍽️</span>
                <span>Meal Planning Support</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Recipe Analytics & Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachSettingsEvents(settingsContainer);
  }

  attachSettingsEvents(container) {
    const useApiToggle = qs('#use-api-toggle', container);
    const fallbackToggle = qs('#fallback-toggle', container);
    const clearCacheBtn = qs('#clear-cache-btn', container);
    const testApiBtn = qs('#test-api-btn', container);

    // API toggle
    useApiToggle.addEventListener('change', (e) => {
      this.dataSource.setUseAPI(e.target.checked);
      this.showMessage(
        e.target.checked ? 
        'Spoonacular API enabled' : 
        'Spoonacular API disabled - using mock data only'
      );
    });

    // Fallback toggle
    fallbackToggle.addEventListener('change', (e) => {
      this.dataSource.mockDataFallback = e.target.checked;
      this.showMessage(
        e.target.checked ? 
        'Mock data fallback enabled' : 
        'Mock data fallback disabled'
      );
    });

    // Clear cache
    clearCacheBtn.addEventListener('click', () => {
      this.dataSource.clearCache();
      this.showMessage('API cache cleared successfully');
    });

    // Test API connection
    testApiBtn.addEventListener('click', async () => {
      const button = testApiBtn;
      const originalText = button.textContent;
      
      button.textContent = 'Testing...';
      button.disabled = true;

      try {
        // Test API by fetching a random recipe
        await this.dataSource.spoonacularAPI.getRandomRecipes(1);
        this.showMessage('API connection test successful!', 'success');
      } catch (error) {
        this.showMessage(`API connection test failed: ${error.message}`, 'error');
      }

      button.textContent = originalText;
      button.disabled = false;
    });
  }

  getStatusText(apiStatus) {
    switch (apiStatus.status) {
      case 'active':
        return 'Connected';
      case 'disabled':
        return 'Disabled - Using Mock Data';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  }

  showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageEl = createElement('div', `api-message api-message-${type}`);
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (messageEl.parentNode) {
            document.body.removeChild(messageEl);
          }
        }, 300);
      }
    }, 3000);
  }
}
