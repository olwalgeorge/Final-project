(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();function o(r,e=document){return e.querySelector(r)}function m(r,e="",t={}){const a=document.createElement(r);return e&&(a.className=e),Object.entries(t).forEach(([i,s])=>{a.setAttribute(i,s)}),a}function b(r){return JSON.parse(localStorage.getItem(r))}function k(r,e){localStorage.setItem(r,JSON.stringify(e))}function h(r,e=!0,t=3e3){const a=m("div","alert");a.innerHTML=`<p>${r}</p><span class="alert-close">&times;</span>`;let i=o(".alert-container");i||(i=m("div","alert-container"),document.body.appendChild(i)),i.appendChild(a),setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},t),o(".alert-close",a).addEventListener("click",()=>{a.parentNode.removeChild(a)}),e&&window.scrollTo(0,0)}class w{constructor(){this.baseURL="https://api.spoonacular.com",this.apiKey="cf391869434d447cb81153143b2ae0e3",this.requestCache=new Map,this.cacheTTL=5*60*1e3,this.apiKey||(console.warn("🔑 Spoonacular API key not found!"),console.warn("📁 Please create a .env file with: VITE_SPOONACULAR_API_KEY=your_api_key_here"),console.warn("📖 Get your API key from: https://spoonacular.com/food-api/console#Dashboard"))}isConfigured(){return!!this.apiKey&&this.apiKey!=="your_api_key_here"}getStatus(){return{configured:this.isConfigured(),apiKey:this.apiKey?`${this.apiKey.substring(0,8)}...`:"Not set",baseURL:this.baseURL,cacheSize:this.requestCache.size}}async makeRequest(e,t={}){if(!this.isConfigured())throw new Error("Spoonacular API key not configured. Please check your .env file.");const a=new URLSearchParams({apiKey:this.apiKey,...t}),i=`${this.baseURL}${e}?${a}`,s=this.getFromCache(i);if(s)return s;try{console.log(`🌐 Making Spoonacular API request: ${e}`);const n=await fetch(i);if(!n.ok)throw n.status===402?new Error("🚫 API quota exceeded. Please try again later or upgrade your plan."):n.status===401?new Error("🔑 Invalid API key. Please check your .env configuration."):n.status===403?new Error("🚫 Access forbidden. Please check your API key permissions."):new Error(`❌ API request failed: ${n.status} ${n.statusText}`);const c=await n.json();return this.setCache(i,c),c}catch(n){throw console.error("Spoonacular API Error:",n),n}}async searchRecipes(e="",t={}){console.log("🌐 SpoonacularAPI.searchRecipes called:",{query:e,options:t});const a={query:e,number:t.number||12,offset:t.offset||0,addRecipeInformation:!0,addRecipeNutrition:!1,fillIngredients:!1,instructionsRequired:!0,sort:t.sort||"popularity"};t.diet&&(a.diet=t.diet),t.cuisine&&(a.cuisine=t.cuisine),t.type&&(a.type=t.type),t.maxReadyTime&&(a.maxReadyTime=t.maxReadyTime),t.excludeIngredients&&(a.excludeIngredients=t.excludeIngredients);try{console.log("📡 Making API request with params:",a);const i=await this.makeRequest("/recipes/complexSearch",a);console.log("📥 Raw API response:",i);const s={recipes:i.results.map(n=>this.normalizeRecipe(n)),totalResults:i.totalResults,offset:i.offset,number:i.number};return console.log("🔄 Normalized result:",s),s}catch(i){throw console.error("Error searching recipes:",i),i}}async getRecipeDetails(e){try{const t={includeNutrition:!0},a=await this.makeRequest(`/recipes/${e}/information`,t);return this.normalizeDetailedRecipe(a)}catch(t){throw console.error("Error fetching recipe details:",t),t}}async getRandomRecipes(e=6,t=""){try{const a={number:e,"include-tags":t};return(await this.makeRequest("/recipes/random",a)).recipes.map(s=>this.normalizeDetailedRecipe(s))}catch(a){throw console.error("Error fetching random recipes:",a),a}}async getRecipesByIds(e){try{const t={ids:e.join(","),includeNutrition:!1};return(await this.makeRequest("/recipes/informationBulk",t)).map(i=>this.normalizeDetailedRecipe(i))}catch(t){throw console.error("Error fetching recipes by IDs:",t),t}}async searchByIngredients(e,t=12){try{const a={ingredients:e.join(","),number:t,ranking:1,ignorePantry:!0},s=(await this.makeRequest("/recipes/findByIngredients",a)).map(n=>n.id);return s.length>0?await this.getRecipesByIds(s):[]}catch(a){throw console.error("Error searching by ingredients:",a),a}}async getRecipeNutrition(e){try{const t=await this.makeRequest(`/recipes/${e}/nutritionWidget.json`);return this.normalizeNutrition(t)}catch(t){throw console.error("Error fetching recipe nutrition:",t),t}}normalizeRecipe(e){var t,a,i,s;return{id:e.id,title:e.title,description:e.summary?this.stripHtml(e.summary).substring(0,150)+"...":"Delicious recipe from Spoonacular",cookingTime:e.readyInMinutes||30,servings:e.servings||4,calories:((i=(a=(t=e.nutrition)==null?void 0:t.nutrients)==null?void 0:a.find(n=>n.name==="Calories"))==null?void 0:i.amount)||0,difficulty:this.getDifficultyFromTime(e.readyInMinutes),tags:e.dishTypes||[],dietaryInfo:this.extractDietaryInfo(e),ingredients:[],instructions:[],image:e.image||`https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(e.title)}`,category:this.categorizeRecipe(e.dishTypes),cuisine:((s=e.cuisines)==null?void 0:s[0])||"international",rating:e.spoonacularScore?Math.round(e.spoonacularScore/20):4,source:"spoonacular",sourceUrl:e.sourceUrl,creditsText:e.creditsText}}normalizeDetailedRecipe(e){return{...this.normalizeRecipe(e),ingredients:this.normalizeIngredients(e.extendedIngredients||[]),instructions:this.normalizeInstructions(e.analyzedInstructions||[]),nutrition:e.nutrition?this.normalizeNutrition(e.nutrition):null,winePairing:e.winePairing,tips:e.tips||[]}}normalizeIngredients(e){return e.map(t=>{var a,i;return{name:t.name||t.original,amount:(i=(a=t.measures)==null?void 0:a.metric)!=null&&i.amount?`${t.measures.metric.amount} ${t.measures.metric.unitLong}`:t.original,category:t.aisle||"other",image:t.image?`https://spoonacular.com/cdn/ingredients_100x100/${t.image}`:null}})}normalizeInstructions(e){var a;return e.length?(((a=e[0])==null?void 0:a.steps)||[]).map(i=>i.step):[]}normalizeNutrition(e){var a,i,s,n,c,p;if(!e.nutrients)return null;const t=e.nutrients.reduce((l,u)=>(l[u.name.toLowerCase()]={amount:u.amount,unit:u.unit,percentOfDailyNeeds:u.percentOfDailyNeeds},l),{});return{calories:((a=t.calories)==null?void 0:a.amount)||0,protein:((i=t.protein)==null?void 0:i.amount)||0,carbs:((s=t.carbohydrates)==null?void 0:s.amount)||0,fat:((n=t.fat)==null?void 0:n.amount)||0,fiber:((c=t.fiber)==null?void 0:c.amount)||0,sugar:((p=t.sugar)==null?void 0:p.amount)||0,nutrients:t}}extractDietaryInfo(e){const t=[];return e.vegetarian&&t.push("vegetarian"),e.vegan&&t.push("vegan"),e.glutenFree&&t.push("gluten-free"),e.dairyFree&&t.push("dairy-free"),e.veryHealthy&&t.push("healthy"),e.cheap&&t.push("budget-friendly"),e.veryPopular&&t.push("popular"),e.sustainable&&t.push("sustainable"),e.ketogenic&&t.push("keto"),e.whole30&&t.push("whole30"),t}categorizeRecipe(e=[]){const t={breakfast:["breakfast","brunch","morning meal"],lunch:["lunch","salad","soup","sandwich"],dinner:["dinner","main course","main dish"],dessert:["dessert","sweet","cake","cookie","ice cream"],snack:["snack","appetizer","side dish","fingerfood"]};for(const[a,i]of Object.entries(t))if(e.some(s=>i.some(n=>s.toLowerCase().includes(n))))return a;return"dinner"}getDifficultyFromTime(e){return!e||e<=30?"easy":e<=60?"intermediate":"advanced"}stripHtml(e){const t=document.createElement("div");return t.innerHTML=e,t.textContent||t.innerText||""}getFromCache(e){const t=this.requestCache.get(e);return t&&Date.now()-t.timestamp<this.cacheTTL?(console.log("Using cached data for:",e),t.data):null}setCache(e,t){if(this.requestCache.set(e,{data:t,timestamp:Date.now()}),this.requestCache.size>100){const a=this.requestCache.keys().next().value;this.requestCache.delete(a)}}clearCache(){this.requestCache.clear()}async getAPIUsage(){try{return await this.makeRequest("/recipes/quota")}catch(e){return console.warn("Could not fetch API usage:",e),null}}}class P{constructor(){this.spoonacularAPI=new w,this.useAPI=!0,this.mockDataFallback=!0,this.initializeMockData()}setUseAPI(e){this.useAPI=e}async searchRecipes(e="",t={}){var a;if(console.log("🔍 RecipeDataSource.searchRecipes called:",{query:e,options:t,useAPI:this.useAPI}),this.useAPI)try{console.log("🌐 Searching recipes via Spoonacular API...");const i=await this.spoonacularAPI.searchRecipes(e,{number:t.number||12,diet:t.diet,cuisine:t.cuisine,type:t.type,maxReadyTime:t.maxReadyTime,sort:t.sort});return console.log("✅ API search result:",i),console.log("📊 Recipes found:",((a=i.recipes)==null?void 0:a.length)||0),i.recipes}catch(i){throw console.error("❌ Spoonacular API search failed:",i),console.error("❌ Full error details:",i.stack),i}return this.searchMockRecipes(e,t)}async getAllRecipes(){if(this.useAPI)try{return console.log("Fetching popular recipes via Spoonacular API..."),(await this.spoonacularAPI.searchRecipes("",{number:24,sort:"popularity"})).recipes}catch(e){if(console.error("Spoonacular API failed:",e),this.mockDataFallback)return console.log("Falling back to mock data..."),this.mockRecipes;throw e}return this.mockRecipes}async getFeaturedRecipes(e=3){if(this.useAPI)try{return console.log("Fetching featured recipes via Spoonacular API..."),await this.spoonacularAPI.getRandomRecipes(e,"healthy,popular")}catch(t){if(console.error("Spoonacular API failed:",t),this.mockDataFallback)return console.log("Falling back to mock data..."),this.mockRecipes.slice(0,e);throw t}return this.mockRecipes.slice(0,e)}async getRecipeById(e){if(this.useAPI&&typeof e=="number"&&e>1e3)try{return console.log(`Fetching recipe ${e} via Spoonacular API...`),await this.spoonacularAPI.getRecipeDetails(e)}catch(t){if(console.error("Spoonacular API failed:",t),this.mockDataFallback)return console.log("Falling back to mock data..."),this.mockRecipes.find(a=>a.id==e);throw t}return this.mockRecipes.find(t=>t.id==e)}async searchByIngredients(e){if(this.useAPI)try{return console.log("Searching by ingredients via Spoonacular API..."),await this.spoonacularAPI.searchByIngredients(e)}catch(t){if(console.error("Spoonacular API failed:",t),this.mockDataFallback)return console.log("Falling back to mock data..."),this.searchMockByIngredients(e);throw t}return this.searchMockByIngredients(e)}getCategories(){return[{id:"breakfast",name:"Breakfast",icon:"🍳"},{id:"lunch",name:"Lunch",icon:"🥗"},{id:"dinner",name:"Dinner",icon:"🍽️"},{id:"dessert",name:"Desserts",icon:"🍰"},{id:"snack",name:"Snacks",icon:"🥨"},{id:"drink",name:"Drinks",icon:"🥤"}]}searchMockRecipes(e="",t={}){let a=[...this.mockRecipes];if(e){const i=e.toLowerCase();a=a.filter(s=>s.title.toLowerCase().includes(i)||s.description.toLowerCase().includes(i)||s.tags.some(n=>n.toLowerCase().includes(i))||s.ingredients.some(n=>n.name.toLowerCase().includes(i)))}return t.dietaryInfo&&t.dietaryInfo.length>0&&(a=a.filter(i=>t.dietaryInfo.some(s=>i.dietaryInfo.includes(s.toLowerCase())))),t.category&&(a=a.filter(i=>i.category===t.category.toLowerCase())),a}searchMockByIngredients(e){const t=e.map(a=>a.toLowerCase());return this.mockRecipes.filter(a=>t.some(i=>a.ingredients.some(s=>s.name.toLowerCase().includes(i))))}async getAPIStatus(){const e=this.spoonacularAPI.getStatus();if(!this.useAPI)return{status:"disabled",configured:e.configured,usingMockData:!0,message:"Using mock data only"};if(!e.configured)return{status:"not-configured",configured:!1,usingMockData:this.mockDataFallback,message:"API key not configured. Check your .env file."};try{return await this.spoonacularAPI.searchRecipes("test",{number:1}),{status:"active",configured:!0,usingMockData:!1,message:"API is working correctly",apiKey:e.apiKey,cacheSize:e.cacheSize}}catch(t){return{status:"error",configured:e.configured,usingMockData:this.mockDataFallback,error:t.message,message:`API error: ${t.message}`}}}initializeMockData(){this.mockRecipes=[{id:1,title:"Swahili Pilau",description:"Traditional aromatic rice dish with meat and spices",cookingTime:45,servings:4,calories:420,difficulty:"intermediate",tags:["traditional","swahili","rice"],dietaryInfo:[],ingredients:[{name:"Basmati rice",amount:"2 cups",category:"grains"},{name:"Beef",amount:"500g",category:"meat"},{name:"Onions",amount:"2 large",category:"vegetables"},{name:"Garlic",amount:"4 cloves",category:"aromatics"},{name:"Ginger",amount:"1 inch piece",category:"aromatics"},{name:"Pilau masala",amount:"2 tbsp",category:"spices"}],instructions:["Soak rice for 30 minutes","Brown the meat with whole spices","Add onions and cook until golden","Add rice and stock, simmer for 20 minutes"],image:"/images/recipes/swahili-pilau.jpg",mealType:["lunch","dinner"],cuisine:"swahili"},{id:2,title:"Swahili Biryani",description:"Fragrant layered rice dish with tender meat and aromatic spices",cookingTime:60,servings:6,calories:480,difficulty:"advanced",tags:["traditional","swahili","rice","layered"],dietaryInfo:[],ingredients:[{name:"Basmati rice",amount:"3 cups",category:"grains"},{name:"Mutton/Goat meat",amount:"750g",category:"meat"},{name:"Yogurt",amount:"1 cup",category:"dairy"},{name:"Fried onions",amount:"1 cup",category:"vegetables"},{name:"Saffron",amount:"1/2 tsp",category:"spices"},{name:"Biryani masala",amount:"2 tbsp",category:"spices"}],instructions:["Marinate meat in yogurt and spices","Partially cook rice with whole spices","Layer meat and rice alternately","Cook on low heat for 45 minutes"],image:"/images/recipes/swahili-biryani.jpg",mealType:["lunch","dinner"],cuisine:"swahili"},{id:3,title:"Mbaazi wa Nazi",description:"Pigeon peas cooked in rich coconut curry sauce",cookingTime:40,servings:4,calories:350,difficulty:"beginner",tags:["traditional","vegetarian","coconut"],dietaryInfo:["vegetarian","gluten-free"],ingredients:[{name:"Pigeon peas",amount:"2 cups",category:"legumes"},{name:"Coconut milk",amount:"400ml",category:"dairy"},{name:"Onions",amount:"1 large",category:"vegetables"},{name:"Tomatoes",amount:"2 medium",category:"vegetables"},{name:"Curry powder",amount:"1 tbsp",category:"spices"},{name:"Coriander",amount:"1/4 cup",category:"herbs"}],instructions:["Soak pigeon peas overnight","Cook peas until tender","Prepare coconut curry base","Combine and simmer for 15 minutes"],image:"/images/recipes/mbaazi-wa-nazi.jpg",mealType:["lunch","dinner"],cuisine:"swahili"},{id:4,title:"Swahili Chicken Curry",description:"Tender chicken pieces in aromatic coconut curry sauce",cookingTime:35,servings:4,calories:380,difficulty:"intermediate",tags:["traditional","swahili","curry","chicken"],dietaryInfo:["gluten-free"],ingredients:[{name:"Chicken",amount:"1 kg",category:"meat"},{name:"Coconut milk",amount:"400ml",category:"dairy"},{name:"Onions",amount:"2 medium",category:"vegetables"},{name:"Tomatoes",amount:"3 medium",category:"vegetables"},{name:"Curry powder",amount:"2 tbsp",category:"spices"},{name:"Ginger",amount:"1 inch piece",category:"aromatics"}],instructions:["Cut chicken into pieces","Sauté onions until golden","Add chicken and brown","Add coconut milk and simmer for 25 minutes"],image:"/images/recipes/swahili-chicken-curry.jpg",mealType:["lunch","dinner"],cuisine:"swahili"},{id:5,title:"Kuku wa Nazi",description:"Traditional Swahili chicken cooked in coconut milk",cookingTime:40,servings:6,calories:420,difficulty:"beginner",tags:["traditional","swahili","coconut","chicken"],dietaryInfo:["gluten-free"],ingredients:[{name:"Chicken pieces",amount:"1.5 kg",category:"meat"},{name:"Coconut milk",amount:"500ml",category:"dairy"},{name:"Onions",amount:"1 large",category:"vegetables"},{name:"Garlic",amount:"4 cloves",category:"aromatics"},{name:"Green chilies",amount:"2 pieces",category:"spices"},{name:"Coriander",amount:"1/4 cup",category:"herbs"}],instructions:["Marinate chicken with spices","Cook onions until soft","Add chicken and cook until tender","Pour coconut milk and simmer"],image:"/images/recipes/kuku-wa-nazi.jpg",mealType:["lunch","dinner"],cuisine:"swahili"},{id:6,title:"Chicken Biriyani",description:"Layered chicken and rice dish with aromatic spices",cookingTime:75,servings:8,calories:520,difficulty:"advanced",tags:["traditional","chicken","rice","layered"],dietaryInfo:[],ingredients:[{name:"Chicken",amount:"1 kg",category:"meat"},{name:"Basmati rice",amount:"3 cups",category:"grains"},{name:"Yogurt",amount:"1 cup",category:"dairy"},{name:"Fried onions",amount:"1 cup",category:"vegetables"},{name:"Saffron",amount:"1/2 tsp",category:"spices"},{name:"Garam masala",amount:"2 tbsp",category:"spices"}],instructions:["Marinate chicken in yogurt and spices","Cook rice with whole spices until 70% done","Layer chicken and rice alternately","Cook on low heat for 45 minutes"],image:"/images/recipes/chicken-biryani.jpg",mealType:["lunch","dinner"],cuisine:"indian"},{id:7,title:"Simple Pasta Marinara",description:"Classic Italian pasta with fresh tomato sauce",cookingTime:25,servings:4,calories:320,difficulty:"beginner",tags:["italian","pasta","vegetarian","quick"],dietaryInfo:["vegetarian"],ingredients:[{name:"Pasta",amount:"400g",category:"grains"},{name:"Tomatoes",amount:"6 large",category:"vegetables"},{name:"Garlic",amount:"4 cloves",category:"aromatics"},{name:"Basil",amount:"1/4 cup",category:"herbs"},{name:"Olive oil",amount:"3 tbsp",category:"oils"},{name:"Parmesan cheese",amount:"1/2 cup",category:"dairy"}],instructions:["Cook pasta according to package directions","Sauté garlic in olive oil","Add tomatoes and simmer for 15 minutes","Toss with pasta and fresh basil"],image:"/images/recipes/pasta-marinara.jpg",mealType:["lunch","dinner"],cuisine:"italian"},{id:8,title:"Chocolate Chip Cookies",description:"Soft and chewy homemade chocolate chip cookies",cookingTime:30,servings:24,calories:180,difficulty:"beginner",tags:["dessert","cookies","chocolate","baking"],dietaryInfo:["vegetarian"],ingredients:[{name:"Flour",amount:"2 cups",category:"grains"},{name:"Butter",amount:"1 cup",category:"dairy"},{name:"Brown sugar",amount:"3/4 cup",category:"sweeteners"},{name:"Eggs",amount:"2 large",category:"dairy"},{name:"Chocolate chips",amount:"2 cups",category:"chocolate"},{name:"Vanilla extract",amount:"2 tsp",category:"flavorings"}],instructions:["Cream butter and sugars","Add eggs and vanilla","Mix in flour gradually","Fold in chocolate chips and bake for 12 minutes"],image:"/images/recipes/chocolate-chip-cookies.jpg",mealType:["dessert"],cuisine:"american"}]}async getAllRecipes(){return await this.delay(500),this.mockRecipes}async getRecipeById(e){return await this.delay(300),this.mockRecipes.find(t=>t.id===parseInt(e))}async searchRecipes(e,t={}){await this.delay(400);let a=[...this.mockRecipes];if(e){const i=e.toLowerCase();a=a.filter(s=>s.title.toLowerCase().includes(i)||s.description.toLowerCase().includes(i)||s.tags.some(n=>n.toLowerCase().includes(i))||s.cuisine.toLowerCase().includes(i))}return t.dietaryInfo&&t.dietaryInfo.length>0&&(a=a.filter(i=>t.dietaryInfo.some(s=>i.dietaryInfo.includes(s)))),t.mealType&&(a=a.filter(i=>i.mealType.includes(t.mealType))),t.maxCookingTime&&(a=a.filter(i=>i.cookingTime<=t.maxCookingTime)),t.maxCalories&&(a=a.filter(i=>i.calories<=t.maxCalories)),a}async getFeaturedRecipes(e=3){return await this.delay(300),this.mockRecipes.slice(0,e)}async getRecipesByCategory(e){return await this.delay(300),this.mockRecipes.filter(t=>t.mealType.includes(e.toLowerCase()))}delay(e){return new Promise(t=>setTimeout(t,e))}async createRecipe(e){}clearCache(){this.spoonacularAPI&&this.spoonacularAPI.clearCache()}async getRecipesByCategory(e,t=12){if(this.useAPI)try{return console.log(`Fetching ${e} recipes via Spoonacular API...`),(await this.spoonacularAPI.searchRecipes("",{type:e,number:t,sort:"popularity"})).recipes}catch(a){if(console.error("Spoonacular API failed:",a),this.mockDataFallback)return console.log("Falling back to mock data..."),this.mockRecipes.filter(i=>i.category===e.toLowerCase()).slice(0,t);throw a}return this.mockRecipes.filter(a=>a.category===e.toLowerCase()).slice(0,t)}async getRecipeNutrition(e){if(this.useAPI&&typeof e=="number"&&e>1e3)try{return await this.spoonacularAPI.getRecipeNutrition(e)}catch(t){return console.error("Failed to fetch nutrition:",t),null}return{calories:350,protein:25,carbs:40,fat:15,fiber:8,sugar:12}}async createRecipe(e){console.log("Creating recipe:",e)}async updateRecipe(e,t){console.log("Updating recipe:",e,t)}async deleteRecipe(e){console.log("Deleting recipe:",e)}}class R{constructor(e){this.dataSource=e}async renderRecipeList(e,t){const a=typeof t=="string"?o(t):t;if(!e||e.length===0){a.innerHTML='<p class="no-recipes">No recipes found</p>';return}const i=e.map(s=>this.createRecipeCard(s));a.innerHTML="",i.forEach(s=>a.appendChild(s))}createRecipeCard(e){const t=m("div","recipe-card");return t.setAttribute("data-recipe-id",e.id),t.innerHTML=`      <div class="recipe-image">
        <img src="${e.image}" alt="${e.title}" loading="lazy">
        <button class="favorite-btn" data-recipe-id="${e.id}">
          <span class="heart-icon">♡</span>
        </button>
      </div>
      <div class="recipe-content">
        <h3 class="recipe-title">${e.title}</h3>
        <p class="recipe-description">${e.description}</p>
        <div class="recipe-meta">
          <div class="meta-item">
            <span class="icon">⏱</span>
            <span>${e.cookingTime} min</span>
          </div>
          <div class="meta-item">
            <span class="icon">🔥</span>
            <span>${e.calories} cal</span>
          </div>
          <div class="meta-item">
            <span class="icon">👥</span>
            <span>${e.servings} servings</span>
          </div>
        </div>
        <div class="recipe-tags">
          ${e.tags.map(a=>`<span class="tag">${a}</span>`).join("")}
          ${e.dietaryInfo.map(a=>`<span class="diet-tag">${a}</span>`).join("")}
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary view-recipe-btn" data-recipe-id="${e.id}">
            View Recipe
          </button>
          <button class="btn btn-secondary add-to-plan-btn" data-recipe-id="${e.id}">
            Add to Plan
          </button>
        </div>
      </div>
    `,this.attachCardEventListeners(t),t}attachCardEventListeners(e){o(".view-recipe-btn",e).addEventListener("click",s=>{const n=s.target.getAttribute("data-recipe-id");this.viewRecipe(n)}),o(".add-to-plan-btn",e).addEventListener("click",s=>{const n=s.target.getAttribute("data-recipe-id");this.addToMealPlan(n)}),o(".favorite-btn",e).addEventListener("click",s=>{s.stopPropagation();const n=s.target.closest(".favorite-btn").getAttribute("data-recipe-id");this.toggleFavorite(n,s.target.closest(".favorite-btn"))}),e.addEventListener("click",s=>{if(!s.target.closest("button")){const n=e.getAttribute("data-recipe-id");this.viewRecipe(n)}})}async renderRecipeDetail(e,t){try{const a=await this.dataSource.getRecipeById(e);if(!a)throw new Error("Recipe not found");const i=typeof t=="string"?o(t):t;i.innerHTML=this.createRecipeDetailHTML(a),this.attachDetailEventListeners(i,a)}catch(a){h("Error loading recipe details: "+a.message)}}createRecipeDetailHTML(e){return`
      <div class="recipe-detail">        <div class="recipe-hero">
          <img src="${e.image}" alt="${e.title}" class="hero-image">
          <div class="hero-overlay">
            <div class="hero-content">
              <h1 class="recipe-title">${e.title}</h1>
              <p class="recipe-description">${e.description}</p>
              <div class="recipe-meta">
                <div class="meta-item">
                  <span class="icon">⏱</span>
                  <span>${e.cookingTime} min</span>
                </div>
                <div class="meta-item">
                  <span class="icon">👥</span>
                  <span>${e.servings} servings</span>
                </div>
                <div class="meta-item">
                  <span class="icon">🔥</span>
                  <span>${e.calories} cal</span>
                </div>
              </div>
            </div>
          </div>
          <div class="recipe-actions-hero">
            <button class="btn-icon favorite-btn" data-recipe-id="${e.id}">♡</button>
            <button class="btn-icon share-btn">📤</button>
            <button class="btn-icon plan-btn" data-recipe-id="${e.id}">📅</button>
          </div>
        </div>
        
        <div class="recipe-content">
          <div class="recipe-tabs">
            <button class="tab-btn active" data-tab="ingredients">Ingredients</button>
            <button class="tab-btn" data-tab="instructions">Instructions</button>
            <button class="tab-btn" data-tab="nutrition">Nutrition</button>
          </div>
          
          <div class="tab-content">
            <div class="tab-pane active" id="ingredients-tab">
              <div class="ingredients-section">
                <div class="servings-adjuster">
                  <label>Servings:</label>
                  <div class="quantity-controls">
                    <button class="qty-btn minus">-</button>
                    <input type="number" value="${e.servings}" min="1" max="20" class="servings-input">
                    <button class="qty-btn plus">+</button>
                  </div>
                </div>
                <div class="ingredients-list">
                  ${this.groupIngredientsByCategory(e.ingredients)}
                </div>
                <button class="btn btn-primary add-to-shopping-btn">
                  Add to Shopping List
                </button>
              </div>
            </div>
            
            <div class="tab-pane" id="instructions-tab">
              <div class="instructions-list">
                ${e.instructions.map((t,a)=>`
                  <div class="instruction-step">
                    <div class="step-number">${a+1}</div>
                    <div class="step-content">${t}</div>
                  </div>
                `).join("")}
              </div>
            </div>
            
            <div class="tab-pane" id="nutrition-tab">
              <div class="nutrition-info">
                <div class="nutrition-item">
                  <span class="label">Calories</span>
                  <span class="value">${e.calories}</span>
                </div>
                <!-- Add more nutrition info as available -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `}groupIngredientsByCategory(e){const t=e.reduce((a,i)=>{const s=i.category||"other";return a[s]||(a[s]=[]),a[s].push(i),a},{});return Object.entries(t).map(([a,i])=>`
      <div class="ingredient-category">
        <h4 class="category-title">${this.formatCategoryName(a)}</h4>
        <ul class="ingredient-items">
          ${i.map(s=>`
            <li class="ingredient-item">
              <input type="checkbox" class="ingredient-checkbox">
              <span class="ingredient-text">${s.amount} ${s.name}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("")}formatCategoryName(e){return e.charAt(0).toUpperCase()+e.slice(1)}attachDetailEventListeners(e,t){const a=e.querySelectorAll(".tab-btn"),i=e.querySelectorAll(".tab-pane");a.forEach(l=>{l.addEventListener("click",()=>{const u=l.getAttribute("data-tab");a.forEach(g=>g.classList.remove("active")),i.forEach(g=>g.classList.remove("active")),l.classList.add("active"),o(`#${u}-tab`,e).classList.add("active")})});const s=o(".qty-btn.minus",e),n=o(".qty-btn.plus",e),c=o(".servings-input",e);s.addEventListener("click",()=>{const l=parseInt(c.value);l>1&&(c.value=l-1,this.updateIngredientQuantities(e,t,l-1))}),n.addEventListener("click",()=>{const l=parseInt(c.value);l<20&&(c.value=l+1,this.updateIngredientQuantities(e,t,l+1))});const p=o(".favorite-btn",e);p&&p.addEventListener("click",()=>{this.toggleFavorite(t.id,p)})}updateIngredientQuantities(e,t,a){a/t.servings}viewRecipe(e){window.location.hash=`#recipe/${e}`}addToMealPlan(e){h("Recipe added to meal plan!")}toggleFavorite(e,t){const a=o(".heart-icon",t),i=a.textContent==="♥";a.textContent=i?"♡":"♥",t.classList.toggle("favorited",!i),h(i?"Removed from favorites":"Added to favorites")}}class I{constructor(){this.routes={},this.currentRoute="",this.defaultRoute="home"}init(){this.addRoute("home",()=>this.loadHomePage()),this.addRoute("recipes",()=>this.loadRecipesPage()),this.addRoute("recipe/:id",e=>this.loadRecipeDetail(e.id)),this.addRoute("meal-planner",()=>this.loadMealPlannerPage()),this.addRoute("shopping-list",()=>this.loadShoppingListPage()),this.addRoute("preferences",()=>this.loadPreferencesPage()),window.addEventListener("hashchange",()=>this.handleRouteChange()),this.handleRouteChange()}addRoute(e,t){this.routes[e]=t}handleRouteChange(){const e=window.location.hash.slice(1)||this.defaultRoute,[t,...a]=e.split("/"),i=this.parseQueryParams(e);this.currentRoute=t,this.navigate(t,a,i)}navigate(e,t=[],a={}){if(this.routes[e]){this.routes[e]({params:t,queryParams:a});return}for(const[i,s]of Object.entries(this.routes))if(i.includes(":")){const n=this.matchParameterizedRoute(i,e,t);if(n){s({...n,queryParams:a});return}}console.warn(`Route not found: ${e}`),this.routes[this.defaultRoute]({params:[],queryParams:{}})}matchParameterizedRoute(e,t,a){const i=e.split("/"),s=[t,...a];if(i.length!==s.length)return null;const n={};for(let c=0;c<i.length;c++){const p=i[c],l=s[c];if(p.startsWith(":")){const u=p.slice(1);n[u]=l}else if(p!==l)return null}return n}parseQueryParams(e){const t=e.indexOf("?");if(t===-1)return{};const a=e.slice(t+1),i={};return a.split("&").forEach(s=>{const[n,c]=s.split("=");n&&(i[decodeURIComponent(n)]=decodeURIComponent(c||""))}),i}loadHomePage(){console.log("Router: Loading home page")}loadRecipesPage(){console.log("Router: Loading recipes page")}loadRecipeDetail(e){console.log("Router: Loading recipe detail for:",e)}loadMealPlannerPage(){console.log("Router: Loading meal planner")}loadShoppingListPage(){console.log("Router: Loading shopping list")}loadPreferencesPage(){console.log("Router: Loading preferences")}goTo(e){window.location.hash=e}}class C{constructor(e){this.dataSource=e,this.currentWeek=this.getCurrentWeek(),this.mealPlan=this.loadMealPlan()}getCurrentWeek(){const e=new Date,t=new Date(e);t.setDate(e.getDate()-e.getDay()+1);const a=[];for(let i=0;i<7;i++){const s=new Date(t);s.setDate(t.getDate()+i),a.push(s)}return a}loadMealPlan(){return b("mealPlan")||this.createEmptyMealPlan()}createEmptyMealPlan(){const e={};return this.currentWeek.forEach(t=>{const a=this.formatDateKey(t);e[a]={breakfast:null,lunch:null,dinner:null,snacks:[]}}),e}formatDateKey(e){return e.toISOString().split("T")[0]}formatDisplayDate(e){return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}saveMealPlan(){k("mealPlan",this.mealPlan)}async renderMealPlanner(e){const t=typeof e=="string"?o(e):e;t.innerHTML=`
      <div class="meal-planner">
        <div class="planner-header">
          <div class="week-navigation">
            <button class="btn btn-ghost prev-week-btn" id="prev-week">
              ← Previous Week
            </button>
            <h2 class="current-week-display">${this.getWeekDisplayText()}</h2>
            <button class="btn btn-ghost next-week-btn" id="next-week">
              Next Week →
            </button>
          </div>
          <div class="planner-actions">
            <button class="btn btn-secondary clear-week-btn">Clear Week</button>
            <button class="btn btn-primary generate-shopping-btn">Generate Shopping List</button>
          </div>
        </div>
        
        <div class="meal-calendar">
          ${this.renderWeekView()}
        </div>
        
        <div class="quick-add-section">
          <h3>Quick Add Recipes</h3>
          <div class="quick-recipes" id="quick-recipes">
            <!-- Quick add recipes will be loaded here -->
          </div>
        </div>
      </div>
    `,await this.loadQuickAddRecipes(),this.attachMealPlannerEvents(t)}renderWeekView(){const e=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],t=["breakfast","lunch","dinner"];return`
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="time-slot"></div>
          ${this.currentWeek.map((a,i)=>`
            <div class="day-header">
              <div class="day-name">${e[i]}</div>
              <div class="day-date">${a.getDate()}</div>
            </div>
          `).join("")}
        </div>
        
        ${t.map(a=>`
          <div class="meal-row">
            <div class="meal-label">
              <h4>${this.capitalizeFirst(a)}</h4>
            </div>
            ${this.currentWeek.map(i=>{var c;const s=this.formatDateKey(i),n=(c=this.mealPlan[s])==null?void 0:c[a];return`
                <div class="meal-slot" 
                     data-date="${s}" 
                     data-meal-type="${a}">
                  ${n?this.renderMealItem(n):this.renderEmptySlot()}
                </div>
              `}).join("")}
          </div>
        `).join("")}
      </div>
    `}renderMealItem(e){return`
      <div class="meal-item">
        <div class="meal-content">
          <h5>${e.title}</h5>
          <div class="meal-meta">
            <span>⏱ ${e.cookingTime} min</span>
            <span>👥 ${e.servings}</span>
          </div>
        </div>
        <div class="meal-actions">
          <button class="btn-icon view-recipe-btn" data-recipe-id="${e.id}" title="View Recipe">
            👁
          </button>
          <button class="btn-icon remove-meal-btn" title="Remove">
            ✕
          </button>
        </div>
      </div>
    `}renderEmptySlot(){return`
      <div class="empty-meal-slot">
        <button class="add-meal-btn">
          <span class="add-icon">+</span>
          <span class="add-text">Add Meal</span>
        </button>
      </div>
    `}async loadQuickAddRecipes(){try{const e=await this.dataSource.getFeaturedRecipes(6),t=o("#quick-recipes");t.innerHTML=e.map(a=>`
        <div class="quick-recipe-card" data-recipe-id="${a.id}">
          <img src="${a.image}" alt="${a.title}" class="quick-recipe-image">
          <div class="quick-recipe-info">
            <h5>${a.title}</h5>
            <div class="quick-recipe-meta">
              <span>⏱ ${a.cookingTime}m</span>
              <span>🔥 ${a.calories} cal</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary add-to-plan-btn" data-recipe-id="${a.id}">
            Add to Plan
          </button>
        </div>
      `).join("")}catch(e){console.error("Error loading quick add recipes:",e)}}attachMealPlannerEvents(e){const t=o("#prev-week",e),a=o("#next-week",e);t.addEventListener("click",()=>this.navigateWeek(-1)),a.addEventListener("click",()=>this.navigateWeek(1)),o(".clear-week-btn",e).addEventListener("click",()=>this.clearWeek()),o(".generate-shopping-btn",e).addEventListener("click",()=>this.generateShoppingList()),e.addEventListener("click",n=>{if(n.target.closest(".add-meal-btn"))this.handleAddMeal(n.target.closest(".meal-slot"));else if(n.target.closest(".remove-meal-btn"))this.handleRemoveMeal(n.target.closest(".meal-slot"));else if(n.target.closest(".view-recipe-btn")){const c=n.target.closest(".view-recipe-btn").getAttribute("data-recipe-id");this.viewRecipe(c)}else if(n.target.closest(".add-to-plan-btn")){const c=n.target.closest(".add-to-plan-btn").getAttribute("data-recipe-id");this.showMealPlanModal(c)}})}navigateWeek(e){const t=e*7;this.currentWeek=this.currentWeek.map(a=>{const i=new Date(a);return i.setDate(a.getDate()+t),i}),this.mealPlan={...this.mealPlan,...this.createEmptyMealPlan()},this.renderMealPlanner(".meal-planner-container")}clearWeek(){confirm("Are you sure you want to clear all meals for this week?")&&(this.currentWeek.forEach(e=>{const t=this.formatDateKey(e);this.mealPlan[t]={breakfast:null,lunch:null,dinner:null,snacks:[]}}),this.saveMealPlan(),this.renderMealPlanner(".meal-planner-container"),h("Week cleared successfully!"))}async handleAddMeal(e){const t=e.getAttribute("data-date"),a=e.getAttribute("data-meal-type");await this.showRecipeSelectionModal(t,a)}handleRemoveMeal(e){const t=e.getAttribute("data-date"),a=e.getAttribute("data-meal-type");confirm("Remove this meal from your plan?")&&this.removeMealFromPlan(t,a)}addMealToPlan(e,t,a){this.mealPlan[e]||(this.mealPlan[e]={breakfast:null,lunch:null,dinner:null,snacks:[]}),this.mealPlan[e][t]=a,this.saveMealPlan(),this.renderMealPlanner(".meal-planner-container"),h(`${a.title} added to ${t}!`)}removeMealFromPlan(e,t){this.mealPlan[e]&&(this.mealPlan[e][t]=null,this.saveMealPlan(),this.renderMealPlanner(".meal-planner-container"),h("Meal removed from plan"))}showMealPlanModal(e){this.showDateMealTypeModal(e)}viewRecipe(e){window.location.hash=`#recipe/${e}`}generateShoppingList(){const e=this.extractIngredientsFromWeek();if(e.length===0){h("No meals planned for this week. Add some recipes to generate a shopping list.");return}console.log("Shopping list ingredients:",e),h("Shopping list generated! (Check console for details)"),window.location.hash="#shopping-list"}extractIngredientsFromWeek(){const e=[];return this.currentWeek.forEach(t=>{const a=this.formatDateKey(t),i=this.mealPlan[a];i&&["breakfast","lunch","dinner"].forEach(s=>{const n=i[s];n&&n.ingredients&&e.push(...n.ingredients)})}),this.consolidateIngredients(e)}consolidateIngredients(e){const t={};return e.forEach(a=>{const i=a.name.toLowerCase();t[i]?t[i].amount+=` + ${a.amount}`:t[i]={...a}}),Object.values(t)}getWeekDisplayText(){const e=this.currentWeek[0],t=this.currentWeek[6];return`${e.toLocaleDateString("en-US",{month:"short",day:"numeric"})} - ${t.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}capitalizeFirst(e){return e.charAt(0).toUpperCase()+e.slice(1)}async showRecipeSelectionModal(e,t){const a=m("div","recipe-selection-modal");a.innerHTML=`
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Select Recipe for ${this.capitalizeFirst(t)}</h3>
            <button class="modal-close" id="modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="recipe-search-container">
              <input 
                type="text" 
                id="recipe-search-input" 
                class="search-input" 
                placeholder="Search for recipes..."
                autocomplete="off"
              >
            </div>
            <div class="recipe-results" id="recipe-results">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading recipes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(a),await this.loadModalRecipes(),this.attachModalEvents(a,e,t)}async loadModalRecipes(e=""){try{const t=o("#recipe-results");let a;e?a=await this.dataSource.searchRecipes(e):a=await this.dataSource.getAllRecipes(),a=a.slice(0,12),t.innerHTML=`
        <div class="modal-recipe-grid">
          ${a.map(i=>`
            <div class="modal-recipe-card" data-recipe-id="${i.id}">
              <div class="recipe-image-small">
                <img src="${i.image}" alt="${i.title}" loading="lazy">
              </div>
              <div class="recipe-info-small">
                <h5>${i.title}</h5>
                <div class="recipe-meta-small">
                  <span>⏱ ${i.cookingTime}m</span>
                  <span>🔥 ${i.calories} cal</span>
                </div>
                <button class="btn btn-sm btn-primary select-recipe-btn" data-recipe-id="${i.id}">
                  Select
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `}catch(t){console.error("Error loading modal recipes:",t),o("#recipe-results").innerHTML=`
        <div class="error-state">
          <p>Error loading recipes. Please try again.</p>
        </div>
      `}}attachModalEvents(e,t,a){const i=o("#modal-overlay",e),s=o("#modal-close",e),n=o("#recipe-search-input",e),c=()=>{document.body.removeChild(e)};s.addEventListener("click",c),i.addEventListener("click",u=>{u.target===i&&c()});const p=u=>{u.key==="Escape"&&(c(),document.removeEventListener("keydown",p))};document.addEventListener("keydown",p);let l;n.addEventListener("input",u=>{clearTimeout(l),l=setTimeout(()=>{this.loadModalRecipes(u.target.value.trim())},300)}),e.addEventListener("click",async u=>{if(u.target.closest(".select-recipe-btn")){const g=u.target.closest(".select-recipe-btn").getAttribute("data-recipe-id"),f=await this.dataSource.getRecipeById(g);f&&(this.addMealToPlan(t,a,f),c())}})}async showDateMealTypeModal(e){const t=await this.dataSource.getRecipeById(e);if(!t)return;const a=m("div","date-meal-modal");a.innerHTML=`
      <div class="modal-overlay" id="date-modal-overlay">
        <div class="modal-content modal-content-small">
          <div class="modal-header">
            <h3>Add "${t.title}" to Meal Plan</h3>
            <button class="modal-close" id="date-modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select Date:</label>
              <select class="form-input" id="date-select">
                ${this.currentWeek.map(l=>{const u=this.formatDateKey(l),g=this.formatDisplayDate(l);return`<option value="${u}">${g}</option>`}).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Select Meal:</label>
              <select class="form-input" id="meal-type-select">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="cancel-add">Cancel</button>
              <button class="btn btn-primary" id="confirm-add">Add to Plan</button>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(a);const i=o("#date-modal-overlay",a),s=o("#date-modal-close",a),n=o("#cancel-add",a),c=o("#confirm-add",a),p=()=>{document.body.removeChild(a)};[s,n].forEach(l=>{l.addEventListener("click",p)}),i.addEventListener("click",l=>{l.target===i&&p()}),c.addEventListener("click",()=>{const l=o("#date-select",a).value,u=o("#meal-type-select",a).value;this.addMealToPlan(l,u,t),p()})}}class S{constructor(e){this.dataSource=e}async renderAPISettings(e){const t=typeof e=="string"?o(e):e,a=await this.dataSource.getAPIStatus();t.innerHTML=`
      <div class="api-settings">
        <div class="settings-header">
          <h2>API Settings & Status</h2>
          <p class="text-secondary">Configure your recipe data sources and view API usage</p>
        </div>        <div class="settings-content">
          <div class="api-status-card">
            <h3>🔗 Spoonacular API Configuration</h3>
            <div class="status-indicator ${a.status}">
              <span class="status-dot"></span>
              <span class="status-text">${this.getStatusText(a)}</span>
            </div>
            
            <div class="api-config-info">
              <h4>📁 Environment Configuration</h4>
              <div class="config-details">
                <div class="config-item">
                  <strong>API Key Status:</strong> 
                  <span class="${a.configured?"text-success":"text-warning"}">
                    ${a.configured?"✅ Configured":"⚠️ Not Set"}
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

              ${a.configured?"":`
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
              `}
            </div>
            
            ${a.usage?`
              <div class="api-usage">
                <h4>📊 API Usage</h4>
                <div class="usage-stats">
                  <div class="usage-item">
                    <span class="usage-label">Requests Used:</span>
                    <span class="usage-value">${a.usage.used||"N/A"}</span>
                  </div>
                  <div class="usage-item">
                    <span class="usage-label">Requests Remaining:</span>
                    <span class="usage-value">${a.usage.remaining||"N/A"}</span>
                  </div>
                </div>
              </div>
            `:""}

            ${a.error?`
              <div class="error-message">
                <strong>Error:</strong> ${a.error}
              </div>
            `:""}
          </div>

          <div class="settings-controls">
            <h3>Data Source Settings</h3>
            
            <div class="setting-item">
              <label class="setting-label">
                <input 
                  type="checkbox" 
                  id="use-api-toggle" 
                  ${this.dataSource.useAPI?"checked":""}
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
                  ${this.dataSource.mockDataFallback?"checked":""}
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
    `,this.attachSettingsEvents(t)}attachSettingsEvents(e){const t=o("#use-api-toggle",e),a=o("#fallback-toggle",e),i=o("#clear-cache-btn",e),s=o("#test-api-btn",e);t.addEventListener("change",n=>{this.dataSource.setUseAPI(n.target.checked),this.showMessage(n.target.checked?"Spoonacular API enabled":"Spoonacular API disabled - using mock data only")}),a.addEventListener("change",n=>{this.dataSource.mockDataFallback=n.target.checked,this.showMessage(n.target.checked?"Mock data fallback enabled":"Mock data fallback disabled")}),i.addEventListener("click",()=>{this.dataSource.clearCache(),this.showMessage("API cache cleared successfully")}),s.addEventListener("click",async()=>{const n=s,c=n.textContent;n.textContent="Testing...",n.disabled=!0;try{await this.dataSource.spoonacularAPI.getRandomRecipes(1),this.showMessage("API connection test successful!","success")}catch(p){this.showMessage(`API connection test failed: ${p.message}`,"error")}n.textContent=c,n.disabled=!1})}getStatusText(e){switch(e.status){case"active":return"Connected";case"disabled":return"Disabled - Using Mock Data";case"error":return"Connection Error";default:return"Unknown"}}showMessage(e,t="info"){const a=m("div",`api-message api-message-${t}`);a.textContent=e,a.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${t==="error"?"#ff4444":t==="success"?"#44ff44":"#4444ff"};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `,document.body.appendChild(a),setTimeout(()=>{a.parentNode&&(a.style.animation="slideOutRight 0.3s ease-in",setTimeout(()=>{a.parentNode&&document.body.removeChild(a)},300))},3e3)}}function A(){return`
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="navbar-brand">
            <a href="#home" class="brand-link">
              <span class="brand-icon">🍽️</span>
              <span class="brand-name">Kitoweo</span>
            </a>
          </div>
          
          <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div class="navbar-menu" id="navbar-menu">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a href="#home" class="nav-link" data-page="home">
                  <span class="nav-icon">🏠</span>
                  <span class="nav-text">Home</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#recipes" class="nav-link" data-page="recipes">
                  <span class="nav-icon">🍳</span>
                  <span class="nav-text">Recipes</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#meal-planner" class="nav-link" data-page="meal-planner">
                  <span class="nav-icon">📅</span>
                  <span class="nav-text">Meal Plan</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#shopping-list" class="nav-link" data-page="shopping-list">
                  <span class="nav-icon">🛒</span>
                  <span class="nav-text">Shopping</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#preferences" class="nav-link" data-page="preferences">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  `}function $(){const r=document.getElementById("mobile-menu-toggle"),e=document.getElementById("navbar-menu");r&&e&&r.addEventListener("click",()=>{e.classList.toggle("active"),r.classList.toggle("active")});const t=window.location.hash.slice(1)||"home";document.querySelectorAll(".nav-link").forEach(i=>{i.getAttribute("data-page")===t?i.classList.add("active"):i.classList.remove("active")}),document.addEventListener("click",i=>{!i.target.closest(".navbar")&&e.classList.contains("active")&&(e.classList.remove("active"),r.classList.remove("active"))})}function L(){return`
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
              © ${new Date().getFullYear()} Kitoweo Recipe App. Built with ❤️ for food lovers.
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
  `}function T(){console.log("Footer initialized")}function E(r="Loading..."){return`
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-message">${r}</p>
      </div>
    </div>
  `}function M(){return`
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text skeleton-short"></div>
        <div class="skeleton-meta">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
    </div>
  `}function D(r=6){return`
    <div class="skeleton-grid">
      ${Array(r).fill(0).map(()=>M()).join("")}
    </div>
  `}class x{constructor(){this.currentPage=null,this.isLoading=!1}renderPage(e,t=""){const a=document.getElementById("app");if(!a){console.error("App container not found");return}a.innerHTML=`
      ${A()}
      <main class="main-content ${t}" id="main-content">
        ${e}
      </main>
      ${L()}
    `,this.initializeComponents()}updateContent(e,t=""){const a=document.getElementById("main-content");if(!a){console.error("Main content container not found");return}a.innerHTML=e,a.className=`main-content ${t}`,this.initializeContentComponents()}showLoading(e="Loading..."){if(this.isLoading)return;this.isLoading=!0;const t=document.getElementById("main-content");t&&(t.innerHTML=E(e))}hideLoading(){this.isLoading=!1}initializeComponents(){this.initializeHeader(),this.initializeFooter(),this.initializeContentComponents()}initializeHeader(){try{$()}catch(e){console.error("Error initializing header:",e)}}initializeFooter(){try{T()}catch(e){console.error("Error initializing footer:",e)}}initializeContentComponents(){}setTitle(e){document.title=e?`${e} - Kitoweo Recipe App`:"Kitoweo Recipe App"}setMetaDescription(e){let t=document.querySelector('meta[name="description"]');t||(t=document.createElement("meta"),t.name="description",document.head.appendChild(t)),t.content=e}addPageStyles(e){const t=document.getElementById("page-styles");t&&t.remove();const a=document.createElement("style");a.id="page-styles",a.textContent=e,document.head.appendChild(a)}removePageStyles(){const e=document.getElementById("page-styles");e&&e.remove()}scrollToTop(e=!0){window.scrollTo({top:0,behavior:e?"smooth":"auto"})}getCurrentRoute(){return window.location.hash.slice(1)||"home"}navigateTo(e){window.location.hash=e}}const d=new x;function F(r){const e=r.image||"/images/placeholders/recipe-placeholder.svg",t=r.difficulty?`difficulty-${r.difficulty}`:"";return`
    <div class="recipe-card" data-recipe-id="${r.id}">
      <div class="recipe-card-image">
        <img src="${e}" 
             alt="${r.title}" 
             loading="lazy"
             onerror="this.src='/images/placeholders/recipe-placeholder.svg'">
        <div class="recipe-card-badges">
          ${r.difficulty?`<span class="badge ${t}">${r.difficulty}</span>`:""}
          ${r.dietaryInfo&&r.dietaryInfo.length>0?r.dietaryInfo.slice(0,2).map(a=>`<span class="badge badge-diet">${a}</span>`).join(""):""}
        </div>
        <button class="recipe-card-favorite" data-recipe-id="${r.id}" aria-label="Add to favorites">
          <span class="favorite-icon">🤍</span>
        </button>
      </div>
      
      <div class="recipe-card-content">
        <h3 class="recipe-card-title">${r.title}</h3>
        <p class="recipe-card-description">${r.description}</p>
        
        <div class="recipe-card-meta">
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span class="meta-text">${r.cookingTime}m</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span class="meta-text">${r.servings}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🔥</span>
            <span class="meta-text">${r.calories}</span>
          </div>
          ${r.rating?`
          <div class="meta-item">
            <span class="meta-icon">⭐</span>
            <span class="meta-text">${r.rating}/5</span>
          </div>
          `:""}
        </div>
        
        <div class="recipe-card-tags">
          ${r.tags&&r.tags.length>0?r.tags.slice(0,3).map(a=>`<span class="tag">#${a}</span>`).join(""):""}
        </div>
        
        <div class="recipe-card-actions">
          <button class="btn btn-primary btn-sm view-recipe" data-recipe-id="${r.id}">
            👁️ View Recipe
          </button>
          <button class="btn btn-secondary btn-sm add-to-plan" data-recipe-id="${r.id}">
            📅 Add to Plan
          </button>
        </div>
      </div>
    </div>
  `}function B(r,e=3){return!r||r.length===0?`
      <div class="empty-recipes">
        <div class="empty-content">
          <div class="empty-icon">🔍</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search criteria or browse all recipes.</p>
          <a href="#recipes" class="btn btn-primary">Browse All Recipes</a>
        </div>
      </div>
    `:`
    <div class="recipes-grid grid-${e}">
      ${r.map(t=>F(t)).join("")}
    </div>
  `}function y(){document.addEventListener("click",r=>{if(r.target.matches(".view-recipe")||r.target.closest(".view-recipe")){const t=(r.target.matches(".view-recipe")?r.target:r.target.closest(".view-recipe")).getAttribute("data-recipe-id");t&&(window.location.hash=`recipe/${t}`)}}),document.addEventListener("click",r=>{const e=r.target.closest(".recipe-card");if(e&&!r.target.closest("button")){const t=e.getAttribute("data-recipe-id");t&&(window.location.hash=`recipe/${t}`)}}),document.addEventListener("click",r=>{if(r.target.matches(".recipe-card-favorite")||r.target.closest(".recipe-card-favorite")){r.stopPropagation();const e=r.target.matches(".recipe-card-favorite")?r.target:r.target.closest(".recipe-card-favorite"),t=e.querySelector(".favorite-icon"),a=e.getAttribute("data-recipe-id");t.textContent==="🤍"?(t.textContent="❤️",console.log(`Added recipe ${a} to favorites`)):(t.textContent="🤍",console.log(`Removed recipe ${a} from favorites`))}}),document.addEventListener("click",r=>{if(r.target.matches(".add-to-plan")||r.target.closest(".add-to-plan")){r.stopPropagation();const e=r.target.matches(".add-to-plan")?r.target:r.target.closest(".add-to-plan"),t=e.getAttribute("data-recipe-id");console.log(`Added recipe ${t} to meal plan`);const a=e.textContent;e.textContent="✅ Added!",e.disabled=!0,setTimeout(()=>{e.textContent=a,e.disabled=!1},2e3)}})}class z{constructor(){this.cache=new Map,this.cacheTimeout=5*60*1e3}async loadJSON(e){const t=e,a=this.cache.get(t);if(a&&Date.now()-a.timestamp<this.cacheTimeout)return a.data;try{const i=await fetch(e);if(!i.ok)throw new Error(`Failed to load ${e}: ${i.status}`);const s=await i.json();return this.cache.set(t,{data:s,timestamp:Date.now()}),s}catch(i){throw console.error("Error loading JSON:",i),i}}async loadMockData(){return await this.loadJSON("/data/mockData.json")}async loadCategories(){return await this.loadJSON("/data/categories.json")}async loadCuisines(){return await this.loadJSON("/data/cuisines.json")}async loadDietaryOptions(){return await this.loadJSON("/data/dietary.json")}async loadConfig(){return await this.loadJSON("/data/config.json")}async loadAllData(){try{const[e,t,a,i,s]=await Promise.all([this.loadMockData(),this.loadCategories(),this.loadCuisines(),this.loadDietaryOptions(),this.loadConfig()]);return{recipes:e.recipes||[],categories:t.categories||[],cuisines:a.cuisines||[],dietary:i.dietary||[],config:s}}catch(e){throw console.error("Error loading all data:",e),e}}clearCache(){this.cache.clear()}getCacheSize(){return this.cache.size}}const v=new z;class N{constructor(e){this.dataSource=e}createHomePage(){return`
      <section class="hero">
        <div class="container">
          <div class="hero-content text-center">
            <h1 class="hero-title">Find & Plan Your Perfect Meals</h1>
            <p class="hero-description">
              Discover recipes that match your preferences, plan your meals for the week, 
              and generate shopping lists in seconds.
            </p>
            <div class="hero-actions">
              <a href="#recipes" class="btn btn-primary btn-lg">
                🔍 Explore Recipes
              </a>
              <a href="#meal-planner" class="btn btn-secondary btn-lg">
                📅 Start Meal Planning
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-filters">
        <div class="container">
          <h2 class="section-title">Quick Filters</h2>
          <div class="filter-grid">
            <button class="filter-card active" data-filter="all">
              <span class="filter-icon">🍽️</span>
              <span class="filter-name">All Recipes</span>
            </button>
            <button class="filter-card" data-filter="vegetarian">
              <span class="filter-icon">🥬</span>
              <span class="filter-name">Vegetarian</span>
            </button>
            <button class="filter-card" data-filter="quick">
              <span class="filter-icon">⚡</span>
              <span class="filter-name">Quick Meals</span>
            </button>
            <button class="filter-card" data-filter="healthy">
              <span class="filter-icon">💚</span>
              <span class="filter-name">Healthy</span>
            </button>
          </div>
        </div>
      </section>

      <section class="featured-recipes">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Featured Recipes</h2>
            <a href="#recipes" class="section-link">View All →</a>
          </div>
          <div id="featured-recipes-container">
            ${D(6)}
          </div>
        </div>
      </section>

      <section class="categories-section">
        <div class="container">
          <h2 class="section-title">Browse by Category</h2>
          <div id="categories-grid" class="categories-grid">
            <!-- Categories will be loaded here -->
          </div>
        </div>
      </section>

      <section class="cuisines-section">
        <div class="container">
          <h2 class="section-title">Explore Cuisines</h2>
          <div id="cuisines-grid" class="cuisines-grid">
            <!-- Cuisines will be loaded here -->
          </div>
        </div>
      </section>

      <section class="app-features">
        <div class="container">
          <h2 class="section-title">Why Choose Kitoweo?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <h3 class="feature-title">Smart Search</h3>
              <p class="feature-description">
                Find recipes by ingredients, diet, cooking time, or cuisine with our intelligent search.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3 class="feature-title">Meal Planning</h3>
              <p class="feature-description">
                Plan your weekly meals with drag-and-drop calendar and auto-generate shopping lists.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛒</div>
              <h3 class="feature-title">Shopping Lists</h3>
              <p class="feature-description">
                Automatically create organized shopping lists from your meal plans and recipes.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3 class="feature-title">Mobile Friendly</h3>
              <p class="feature-description">
                Access your recipes and meal plans anywhere with our responsive mobile design.
              </p>
            </div>
          </div>
        </div>
      </section>
    `}async loadFeaturedRecipes(){try{const e=await this.dataSource.getFeaturedRecipes(6),t=document.getElementById("featured-recipes-container");t&&(t.innerHTML=B(e,3))}catch(e){console.error("Error loading featured recipes:",e);const t=document.getElementById("featured-recipes-container");t&&(t.innerHTML=`
          <div class="error-message">
            <p>Unable to load featured recipes. Please try again later.</p>
          </div>
        `)}}async loadCategories(){try{const t=(await v.loadCategories()).categories,a=document.getElementById("categories-grid");a&&t&&(a.innerHTML=t.map(i=>`
          <div class="category-card" data-category="${i.id}" title="${i.description||""}">
            <div class="category-icon" style="color: ${i.color}">${i.icon}</div>
            <h3 class="category-name">${i.name}</h3>
          </div>
        `).join(""))}catch(e){console.error("Error loading categories:",e);try{const a=(await v.loadMockData()).categories,i=document.getElementById("categories-grid");i&&a&&(i.innerHTML=a.map(s=>`
            <div class="category-card" data-category="${s.id}">
              <div class="category-icon" style="color: ${s.color}">${s.icon}</div>
              <h3 class="category-name">${s.name}</h3>
            </div>
          `).join(""))}catch(t){console.error("Error loading categories fallback:",t)}}}async loadCuisines(){try{const t=(await v.loadCuisines()).cuisines,a=document.getElementById("cuisines-grid");a&&t&&(a.innerHTML=t.map(i=>`
          <div class="cuisine-card" data-cuisine="${i.id}" title="${i.description||""}">
            <div class="cuisine-flag">${i.flag}</div>
            <h3 class="cuisine-name">${i.name}</h3>
          </div>
        `).join(""))}catch(e){console.error("Error loading cuisines:",e);try{const a=(await v.loadMockData()).cuisines,i=document.getElementById("cuisines-grid");i&&a&&(i.innerHTML=a.map(s=>`
            <div class="cuisine-card" data-cuisine="${s.id}">
              <div class="cuisine-flag">${s.flag}</div>
              <h3 class="cuisine-name">${s.name}</h3>
            </div>
          `).join(""))}catch(t){console.error("Error loading cuisines fallback:",t)}}}initializeHomePage(){y();const e=document.querySelectorAll(".filter-card");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(i=>i.classList.remove("active")),t.classList.add("active");const a=t.getAttribute("data-filter");this.handleQuickFilter(a)})}),document.addEventListener("click",t=>{const a=t.target.closest(".category-card");if(a){const i=a.getAttribute("data-category");window.location.hash=`recipes?category=${i}`}}),document.addEventListener("click",t=>{const a=t.target.closest(".cuisine-card");if(a){const i=a.getAttribute("data-cuisine");window.location.hash=`recipes?cuisine=${i}`}}),this.loadFeaturedRecipes(),this.loadCategories(),this.loadCuisines()}handleQuickFilter(e){switch(e){case"all":window.location.hash="recipes";break;case"vegetarian":window.location.hash="recipes?diet=vegetarian";break;case"quick":window.location.hash="recipes?time=quick";break;case"healthy":window.location.hash="recipes?tags=healthy";break;default:window.location.hash="recipes"}}}class q{constructor(){this.dataSource=new P,this.recipe=new R(this.dataSource),this.router=new I,this.mealPlanner=new C(this.dataSource),this.apiSettings=new S(this.dataSource),this.homePage=new N(this.dataSource),this.init()}async init(){try{console.log("🚀 Initializing Kitoweo Recipe App..."),this.setupRouting();const e=d.getCurrentRoute();await this.handleRoute(e),console.log("✅ Kitoweo app initialized successfully")}catch(e){console.error("❌ Error initializing app:",e),this.showErrorPage(e)}}setupRouting(){window.addEventListener("hashchange",()=>{const e=d.getCurrentRoute();this.handleRoute(e)}),window.addEventListener("load",()=>{const e=d.getCurrentRoute();this.handleRoute(e)})}async handleRoute(e){console.log(`📍 Navigating to route: ${e}`);try{d.showLoading("Loading page...");const[t,...a]=e.split("/"),i=this.parseQueryParams(e);switch(t){case"home":case"":await this.loadHomePage();break;case"recipes":await this.loadRecipesPage(i);break;case"recipe":await this.loadRecipeDetail(a[0]);break;case"meal-planner":await this.loadMealPlannerPage();break;case"shopping-list":await this.loadShoppingListPage();break;case"preferences":await this.loadPreferencesPage();break;default:await this.load404Page()}d.hideLoading(),d.scrollToTop()}catch(t){console.error("❌ Error handling route:",t),this.showErrorPage(t)}}parseQueryParams(e){const t={},a=e.split("?")[1];return a&&a.split("&").forEach(i=>{const[s,n]=i.split("=");t[decodeURIComponent(s)]=decodeURIComponent(n||"")}),t}async loadHomePage(){try{d.setTitle("Home"),d.setMetaDescription("Find amazing recipes, plan your meals, and make cooking enjoyable with Kitoweo Recipe App.");const e=this.homePage.createHomePage();d.renderPage(e,"home-page"),this.homePage.initializeHomePage()}catch(e){throw console.error("Error loading home page:",e),e}}async loadRecipesPage(e={}){try{d.setTitle("Recipes"),d.setMetaDescription("Browse and search through thousands of delicious recipes from around the world.");const t=this.createRecipesPageHTML();d.renderPage(t,"recipes-page"),await this.initializeRecipesPage(),Object.keys(e).length>0?await this.applyFiltersFromParams(e):await this.loadRecipes()}catch(t){throw console.error("Error loading recipes page:",t),t}}createRecipesPageHTML(){return`
      <section class="recipes-hero">
        <div class="container">
          <div class="hero-content text-center">
            <h1>Discover Amazing Recipes</h1>
            <p class="text-secondary">Search through thousands of delicious recipes and find your next favorite meal</p>
          </div>
        </div>
      </section>

      <section class="search-section">
        <div class="container">
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <input 
                type="text" 
                id="recipe-search" 
                class="search-input" 
                placeholder="Search for recipes, ingredients, or cuisines..."
                autocomplete="off"
              >
              <button class="search-btn" id="search-btn">
                <span class="search-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="filters-section">
        <div class="container">
          <div class="filters-container">
            <div class="filter-group">
              <h3>Meal Type</h3>
              <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all" data-type="meal">All</button>
                <button class="filter-btn" data-filter="breakfast" data-type="meal">Breakfast</button>
                <button class="filter-btn" data-filter="lunch" data-type="meal">Lunch</button>
                <button class="filter-btn" data-filter="dinner" data-type="meal">Dinner</button>
                <button class="filter-btn" data-filter="dessert" data-type="meal">Dessert</button>
                <button class="filter-btn" data-filter="snack" data-type="meal">Snacks</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Diet</h3>
              <div class="filter-buttons">
                <button class="filter-btn" data-filter="vegetarian" data-type="diet">Vegetarian</button>
                <button class="filter-btn" data-filter="vegan" data-type="diet">Vegan</button>
                <button class="filter-btn" data-filter="gluten-free" data-type="diet">Gluten-Free</button>
                <button class="filter-btn" data-filter="keto" data-type="diet">Keto</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Cooking Time</h3>
              <div class="filter-buttons">
                <button class="filter-btn" data-filter="quick" data-type="time">Under 30 min</button>
                <button class="filter-btn" data-filter="medium" data-type="time">30-60 min</button>
                <button class="filter-btn" data-filter="long" data-type="time">Over 60 min</button>
              </div>
            </div>

            <div class="filter-group">
              <h3>Sort By</h3>
              <select id="sort-select" class="sort-select">
                <option value="relevance">Relevance</option>
                <option value="time">Cooking Time</option>
                <option value="calories">Calories</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="results-section">
        <div class="container">
          <div class="results-header">
            <h2 id="results-title">All Recipes</h2>
            <div class="results-meta">
              <span id="results-count">Loading...</span>
            </div>
          </div>
          <div id="recipes-grid" class="recipes-grid">
            <!-- Recipes will be loaded here -->
          </div>
        </div>
      </section>
    `}async loadRecipeDetail(e){try{d.setTitle("Recipe Details");const t=`
        <div class="container">
          <h1>Recipe Detail</h1>
          <p>Recipe ID: ${e}</p>
          <p>Dynamic recipe detail implementation coming from modular components!</p>
          <a href="#recipes" class="btn btn-primary">Back to Recipes</a>
        </div>
      `;d.renderPage(t,"recipe-detail-page")}catch(t){throw console.error("Error loading recipe detail:",t),t}}async loadMealPlannerPage(){d.setTitle("Meal Planner"),d.renderPage(`
      <div class="container">
        <h1>Meal Planner</h1>
        <p>Meal planning functionality (existing implementation)</p>
      </div>
    `,"meal-planner-page")}async loadShoppingListPage(){d.setTitle("Shopping List"),d.renderPage(`
      <div class="container">
        <h1>Shopping List</h1>
        <p>Shopping list functionality (existing implementation)</p>
      </div>
    `,"shopping-list-page")}async loadPreferencesPage(){d.setTitle("Settings"),d.renderPage(`
      <div class="container">
        <h1>Settings</h1>
        <p>Settings and preferences (existing implementation)</p>
      </div>
    `,"preferences-page")}async load404Page(){d.setTitle("Page Not Found"),d.renderPage(`
      <div class="container text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#home" class="btn btn-primary">Go Home</a>
      </div>
    `,"error-page")}showErrorPage(e){d.setTitle("Error");const t=`
      <div class="container text-center">
        <h1>Something went wrong</h1>
        <p>We're sorry, but something went wrong. Please try again.</p>
        <pre class="error-details">${e.message}</pre>
        <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
      </div>
    `;d.renderPage(t,"error-page")}async initializeRecipesPage(){y()}async loadRecipes(){console.log("Loading recipes...")}async applyFiltersFromParams(e){console.log("Applying filters:",e)}}document.addEventListener("DOMContentLoaded",()=>{const r=new q;window.kitoweoApp=r,console.log("🍳 Kitoweo Recipe App loaded with modular architecture!"),console.log("💡 New features: Partial views, JSON data, dynamic loading"),console.log('💡 Access app instance via "window.kitoweoApp"')});
