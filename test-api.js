/**
 * API Connection Test Script
 * Run this to verify Spoonacular API is working correctly
 */

import SpoonacularAPI from './src/js/spoonacularAPI.js';

async function testAPIConnection() {
  console.log('🧪 Testing Spoonacular API Connection...');
  console.log('='.repeat(50));

  const api = new SpoonacularAPI();

  // Test 1: Check configuration
  console.log('1️⃣ Configuration Test:');
  const status = api.getStatus();
  console.log('   API Key configured:', status.configured);
  console.log('   API Key (masked):', status.apiKey);
  console.log('   Base URL:', status.baseURL);
  console.log('');

  if (!status.configured) {
    console.error('❌ API key not configured. Please check your .env file.');
    return;
  }

  // Test 2: Simple search
  console.log('2️⃣ API Search Test:');
  try {
    const result = await api.searchRecipes('chicken', { number: 3 });
    console.log('✅ API search successful!');
    console.log(`   Found ${result.totalResults} recipes`);
    console.log(`   Returned ${result.recipes.length} recipes in results`);

    if (result.recipes.length > 0) {
      console.log('   Sample recipe:', result.recipes[0].title);
    }
    console.log('');
  } catch (error) {
    console.error('❌ API search failed:', error.message);
    return;
  }

  // Test 3: Get recipe details
  console.log('3️⃣ Recipe Details Test:');
  try {
    const recipe = await api.getRecipeInformation(715538); // Sample recipe ID
    console.log('✅ Recipe details fetch successful!');
    console.log(`   Recipe: ${recipe.title}`);
    console.log(`   Ready in: ${recipe.readyInMinutes} minutes`);
    console.log(`   Servings: ${recipe.servings}`);
    console.log('');
  } catch (error) {
    console.error('❌ Recipe details fetch failed:', error.message);
  }

  // Test 4: Check cache
  console.log('4️⃣ Cache Test:');
  console.log(`   Cache size: ${api.requestCache.size} entries`);

  console.log('');
  console.log('🎉 API Connection Test Complete!');
}

// Run the test
testAPIConnection().catch(console.error);
