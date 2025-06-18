# 🔍 Kitoweo App - Working Search Terms Analysis

## 📊 Current Mock Recipe Database

The app currently has **8 mock recipes** when API fails or is disabled:

### 🍽️ Available Recipes:

1. **Swahili Pilau** (ID: 1) - Traditional rice dish
2. **Swahili Biryani** (ID: 2) - Layered rice and meat
3. **Mbaazi wa Nazi** (ID: 3) - Pigeon peas in coconut curry
4. **Swahili Chicken Curry** (ID: 4) - Chicken in coconut curry
5. **Kuku wa Nazi** (ID: 5) - Traditional Swahili chicken
6. **Chicken Biriyani** (ID: 6) - Indian-style layered chicken and rice
7. **Simple Pasta Marinara** (ID: 7) - Italian pasta with tomato sauce
8. **Chocolate Chip Cookies** (ID: 8) - Classic American cookies

## ✅ Search Terms That WILL WORK (Mock Data)

### 🏷️ By Recipe Title:

- `pilau` ✅ (finds Swahili Pilau)
- `biryani` ✅ (finds Swahili Biryani & Chicken Biriyani)
- `mbaazi` ✅ (finds Mbaazi wa Nazi)
- `chicken` ✅ (finds 3 chicken recipes)
- `pasta` ✅ (finds Pasta Marinara)
- `cookies` ✅ (finds Chocolate Chip Cookies)
- `swahili` ✅ (finds 4 Swahili recipes)

### 🥘 By Ingredients:

- `rice` ✅ (finds Pilau & both Biryanis)
- `chicken` ✅ (finds 3 chicken recipes)
- `beef` ✅ (finds Pilau)
- `pasta` ✅ (finds Pasta Marinara)
- `chocolate` ✅ (finds Chocolate Chip Cookies)
- `coconut` ✅ (finds Mbaazi, Chicken Curry, Kuku wa Nazi)
- `tomatoes` ✅ (finds Mbaazi & Pasta Marinara)

### 🌶️ By Tags/Cuisine:

- `traditional` ✅ (finds 5 traditional recipes)
- `vegetarian` ✅ (finds Mbaazi & Pasta Marinara)
- `quick` ✅ (finds Pasta Marinara)
- `dessert` ✅ (finds Chocolate Chip Cookies)
- `italian` ✅ (finds Pasta Marinara)
- `indian` ✅ (finds Chicken Biriyani)

### 🥗 By Dietary Info:

- Using "Vegetarian" filter ✅ (finds Mbaazi wa Nazi)
- Using "Gluten-Free" filter ✅ (finds Mbaazi wa Nazi)

## ❌ Search Terms That WON'T WORK (Mock Data)

- `fish` ❌ (No seafood recipes)
- `pizza` ❌ (No pizza recipes)
- `bread` ❌ (No bread recipes)
- `soup` ❌ (No soup recipes)
- `salad` ❌ (No salad recipes)

## 🔧 The Real Issue

When you search for "chicken":

1. 🌐 App tries Spoonacular API first
2. ❌ API call fails (likely due to network/config issue)
3. 🔄 Falls back to mock data
4. 🔍 Searches mock data for "chicken"
5. ✅ NOW FINDS 3 chicken recipes!
6. 📱 Should show results

## 🧪 Test Recommendations

### To test MOCK DATA (current fallback):

- Search: `chicken` or `pasta` or `swahili` or `cookies`
- Should find multiple recipes

### To test API CONNECTION:

- Use browser console: `testAPI()`
- Check settings page for API status
- Search for common terms like `chicken` (should work if API is connected)

## 🎯 Next Steps

1. **Test Current Setup**: Try searching for `chicken` - should now work!
2. **Debug API Connection**: Check why Spoonacular API calls are failing
3. **Improve Error Reporting**: Show when falling back to mock data
4. **Test with Various Terms**: Try `pasta`, `cookies`, `rice` to verify search functionality
