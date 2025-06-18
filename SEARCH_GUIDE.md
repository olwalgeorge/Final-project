# 🔍 Recipe Search Test Guide

## Search Terms to Test

### ✅ **Guaranteed to Work (Mock Data + API)**

#### 🥘 **Main Dishes**

- `pilau` - Traditional Swahili rice dish
- `biryani` - Fragrant layered rice
- `ugali` - Kenyan staple
- `nyama` - Meat dishes
- `samosa` - Fried pastries
- `chapati` - Flatbread

#### 🥩 **Proteins**

- `chicken` - Multiple chicken recipes
- `beef` - Beef stew and dishes
- `fish` - Tilapia and other fish
- `goat` - Traditional goat meat

#### 🌾 **Ingredients**

- `rice` - Pilau, biryani dishes
- `coconut` - Coconut-based recipes
- `lentils` - Bean and lentil dishes
- `maize` - Corn-based foods
- `tomato` - Various dishes
- `onion` - Common ingredient

#### 🍞 **Breads & Snacks**

- `mandazi` - Sweet fried bread
- `bhajia` - Potato fritters
- `kachori` - Stuffed pastry

#### 🥤 **Beverages**

- `chai` - Spiced tea
- `juice` - Fresh fruit juices

#### 🍰 **Desserts**

- `halwa` - Sweet dessert
- `cake` - Various cakes

### 🌐 **API-Only Terms (When API is Working)**

#### 🍝 **International Cuisine**

- `pasta` - Italian dishes
- `pizza` - Various pizzas
- `burger` - American classics
- `sushi` - Japanese cuisine
- `curry` - Indian/Thai dishes
- `tacos` - Mexican food

#### 🥗 **Diet-Specific**

- `vegetarian` - Plant-based meals
- `vegan` - No animal products
- `keto` - Low-carb options
- `gluten-free` - Wheat-free options

#### 🍲 **Meal Types**

- `breakfast` - Morning meals
- `lunch` - Midday options
- `dinner` - Evening dishes
- `dessert` - Sweet treats
- `snack` - Light bites

## 🧪 **Testing Strategy**

### 1. **Quick Tests**

Try these for immediate results:

- `chicken` (should work with both API and mock)
- `rice` (guaranteed in mock data)
- `coconut` (Swahili specialty)

### 2. **Fallback Tests**

If API fails, these will work with mock data:

- `pilau`
- `mandazi`
- `ugali`

### 3. **API-Only Tests**

These require working API:

- `italian`
- `vegetarian`
- `quick` (under 30 min)

## 🔧 **Troubleshooting**

### If No Results Found:

1. **Check API Status**: Go to Settings page
2. **Try Mock Data Terms**: Use Swahili/African recipe names
3. **Check Console**: Open browser developer tools
4. **Test API**: Type `testAPI()` in console

### Common Issues:

- **API Quota Exceeded**: Switch to mock data in settings
- **API Key Invalid**: Check .env file
- **No Mock Matches**: Try Swahili cuisine terms

## 💡 **Pro Tips**

1. **Start with "chicken"** - Most reliable test
2. **Use lowercase** - Better matching
3. **Try partial words** - "chic" might match "chicken"
4. **Check categories** - Use meal type filters
5. **Empty search** - Shows all available recipes
