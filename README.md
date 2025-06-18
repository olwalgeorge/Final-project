# 🍳 Kitoweo Recipe App

A modern recipe finder and meal planning web application built with Vanilla JavaScript and Vite.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key (Required for Live Recipe Data)

1. **Get your FREE Spoonacular API key:**
   - Visit [Spoonacular API Console](https://spoonacular.com/food-api/console#Dashboard)
   - Create a free account
   - Copy your API key

2. **Create environment file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

3. **Add your API key to `.env`:**
   ```env
   VITE_SPOONACULAR_API_KEY=your_api_key_here
   ```

### 3. Start Development Server
```bash
npm run dev
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SPOONACULAR_API_KEY` | Your Spoonacular API key | Yes (for live data) |
| `VITE_SPOONACULAR_BASE_URL` | API base URL | No (has default) |

## 📊 Data Sources

The app supports two data sources:

- **🌐 Spoonacular API**: Live recipe data with thousands of recipes (requires API key)
- **💾 Mock Data**: Sample African/Swahili recipes for demo purposes (no API key needed)

You can switch between data sources in the Settings page.

## 🛡️ Security

- API keys are stored in environment variables (`.env` file)
- The `.env` file is gitignored to prevent accidental commits
- Never commit API keys to version control

## 🏗️ Project Structure

```
src/
├── js/
│   ├── spoonacularAPI.js    # API integration
│   ├── recipeData.js        # Data management
│   ├── mealPlanner.js       # Meal planning features
│   └── utils.js             # Utility functions
├── css/
│   └── style.css            # Styling
└── main.js                  # Application entry point
```

## 🔑 API Limits (Free Tier)

- 150 requests per day
- 1 request per second
- All recipe endpoints available

💡 **Tip**: Use mock data during development to save API calls!

## 🧪 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 License

This project is for educational purposes as part of WDD330 coursework.
