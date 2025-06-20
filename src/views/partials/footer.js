/**
 * Footer Partial Component
 * Reusable footer for all pages
 */

export function createFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="brand-logo">
              <span class="brand-icon">🍽️</span>
              <span class="brand-name">Kitoweo</span>
            </div>
            <p class="footer-description">
              Discover amazing recipes, plan your meals, and make cooking enjoyable with our comprehensive recipe platform.
            </p>
          </div>
          
          <div class="footer-links">
            <div class="footer-section">
              <h3 class="footer-title">Features</h3>
              <ul class="footer-list">
                <li><a href="#recipes" class="footer-link">Recipe Search</a></li>
                <li><a href="#meal-planner" class="footer-link">Meal Planning</a></li>
                <li><a href="#shopping-list" class="footer-link">Shopping Lists</a></li>
                <li><a href="#preferences" class="footer-link">Settings</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3 class="footer-title">Categories</h3>
              <ul class="footer-list">
                <li><a href="#recipes?category=breakfast" class="footer-link">Breakfast</a></li>
                <li><a href="#recipes?category=lunch" class="footer-link">Lunch</a></li>
                <li><a href="#recipes?category=dinner" class="footer-link">Dinner</a></li>
                <li><a href="#recipes?category=dessert" class="footer-link">Desserts</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3 class="footer-title">Support</h3>
              <ul class="footer-list">
                <li><a href="#help" class="footer-link">Help Center</a></li>
                <li><a href="#contact" class="footer-link">Contact Us</a></li>
                <li><a href="#privacy" class="footer-link">Privacy Policy</a></li>
                <li><a href="#terms" class="footer-link">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">
              © ${currentYear} Kitoweo Recipe App. Built with ❤️ for food lovers.
            </p>
            <div class="footer-social">
              <span class="social-text">Follow us:</span>
              <a href="#" class="social-link" aria-label="Facebook">📘</a>
              <a href="#" class="social-link" aria-label="Twitter">🐦</a>
              <a href="#" class="social-link" aria-label="Instagram">📷</a>
              <a href="#" class="social-link" aria-label="YouTube">📺</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function initializeFooter() {
  // Add any footer-specific interactions here
  console.log('Footer initialized');
}
