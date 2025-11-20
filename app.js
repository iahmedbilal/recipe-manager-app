(function () {
  "use strict";

  const STORAGE_KEY = "recipes";

  // ---------- State ----------
  let recipes = [];
  let currentRecipeId = null;

  const filters = {
    search: "",
    difficulty: "all",
    maxPrepTime: null,
  };

  // ---------- DOM refs ----------
  const views = {
    home: document.getElementById("homeView"),
    detail: document.getElementById("detailView"),
    form: document.getElementById("formView"),
  };

  const recipeGrid = document.getElementById("recipeGrid");
  const emptyState = document.getElementById("emptyState");

  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const maxPrepTimeFilter = document.getElementById("maxPrepTimeFilter");

  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const backToListFromDetail = document.getElementById("backToListFromDetail");
  const backToListFromForm = document.getElementById("backToListFromForm");

  const detailContainer = document.getElementById("detailContainer");
  const editRecipeBtn = document.getElementById("editRecipeBtn");
  const deleteRecipeBtn = document.getElementById("deleteRecipeBtn");

  const formTitle = document.getElementById("formTitle");
  const recipeForm = document.getElementById("recipeForm");
  const formErrors = document.getElementById("formErrors");
  const resetFormBtn = document.getElementById("resetFormBtn");

  const recipeIdInput = document.getElementById("recipeId");
  const titleInput = document.getElementById("titleInput");
  const difficultyInput = document.getElementById("difficultyInput");
  const prepTimeInput = document.getElementById("prepTimeInput");
  const cookTimeInput = document.getElementById("cookTimeInput");
  const imageUrlInput = document.getElementById("imageUrlInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const ingredientsInput = document.getElementById("ingredientsInput");
  const stepsInput = document.getElementById("stepsInput");

  // ---------- Storage helpers ----------

  function loadRecipesFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedInitialRecipes();
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("recipes is not an array");
      }
      return parsed;
    } catch (err) {
      console.warn("localStorage recipes corrupted, resetting:", err);
      localStorage.removeItem(STORAGE_KEY);
      return seedInitialRecipes();
    }
  }

  function saveRecipesToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ---------- Initial seed ----------
  function seedInitialRecipes() {
    // Ahmed's chicken noodles with your local image
    const initialRecipe = {
      id: generateId(),
      title: "Ahmed's Special Chicken Noodles",
      description:
        "Quick stir-fried chicken noodles with veggies, perfect for weeknights.",
      ingredients: [
        "200 g egg noodles",
        "150 g boneless chicken, thinly sliced",
        "1 small onion, sliced",
        "1/2 capsicum, sliced",
        "1 small carrot, julienned",
        "2 tbsp soy sauce",
        "1 tbsp chilli sauce",
        "2 cloves garlic, minced",
        "1 tbsp oil",
        "Salt & pepper to taste",
      ],
      steps: [
        "Boil noodles according to packet instructions, drain and set aside.",
        "Heat oil in a pan, sauté garlic and onions until translucent.",
        "Add chicken and cook until no longer pink.",
        "Add vegetables and stir-fry on high heat for 2–3 minutes.",
        "Add soy sauce, chilli sauce, salt, and pepper.",
        "Add cooked noodles, toss well on high heat for 1–2 minutes and serve hot.",
      ],
      prepTime: 15,
      cookTime: 15,
      difficulty: "Easy",
      // 🔽 use your local image file
      imageUrl: "noodles.jpg",
      createdAt: new Date().toISOString(),
    };

    const samples = [
      {
        id: generateId(),
        title: "One-Pot Veggie Pasta",
        description: "Creamy one-pot pasta loaded with vegetables.",
        ingredients: [
          "200 g pasta",
          "1 cup mixed vegetables",
          "2 cups water or stock",
          "1/2 cup milk or cream",
          "2 tbsp grated cheese",
          "Salt, pepper, herbs",
        ],
        steps: [
          "Add pasta, vegetables, water, salt and pepper to a pot.",
          "Boil until pasta is cooked and water is mostly absorbed.",
          "Stir in milk/cream and cheese, simmer for 2 minutes.",
          "Adjust seasoning and serve warm.",
        ],
        prepTime: 10,
        cookTime: 20,
        difficulty: "Easy",
        // 🔽 your pasta image
        imageUrl: "pasta.jpg",
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        title: "Paneer Tikka Wrap",
        description: "Grilled paneer stuffed in soft rotis with salad.",
        ingredients: [
          "200 g paneer cubes",
          "4 rotis or tortillas",
          "1/2 cup yogurt",
          "Spices (tikka masala, chilli, turmeric, salt)",
          "Onion & capsicum slices",
          "Green chutney or mayo",
        ],
        steps: [
          "Marinate paneer in yogurt and spices for 20 minutes.",
          "Grill or pan-fry paneer with onions and capsicum.",
          "Warm rotis and spread chutney or mayo.",
          "Fill with paneer mixture, roll and serve.",
        ],
        prepTime: 20,
        cookTime: 15,
        difficulty: "Medium",
        imageUrl:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
        createdAt: new Date().toISOString(),
      },
    ];

    const data = [initialRecipe, ...samples];
    saveRecipesToStorage(data);
    return data;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- View management ----------

  function showView(name) {
    Object.values(views).forEach((v) => v.classList.remove("active"));
    if (views[name]) views[name].classList.add("active");
  }

  // ---------- Rendering: list ----------

  function renderRecipeList() {
    const filtered = applyFilters(recipes);
    recipeGrid.innerHTML = "";

    if (!filtered.length) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    filtered.forEach((recipe) => {
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.dataset.id = recipe.id;

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "recipe-card-image";

      const img = document.createElement("img");
      img.alt = recipe.title;
      img.src =
        recipe.imageUrl ||
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";

      imgWrapper.appendChild(img);

      const body = document.createElement("div");
      body.className = "recipe-card-body";

      const title = document.createElement("h3");
      title.className = "recipe-title";
      title.textContent = recipe.title;

      const meta = document.createElement("div");
      meta.className = "recipe-meta";

      const diff = document.createElement("span");
      diff.className = "badge badge-difficulty";
      diff.textContent = recipe.difficulty;

      const time = document.createElement("span");
      time.className = "badge";
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      time.textContent = `${totalTime} mins total`;

      meta.append(diff, time);

      const desc = document.createElement("p");
      desc.className = "recipe-description";
      desc.textContent = recipe.description;

      body.append(title, meta, desc);

      card.append(imgWrapper, body);

      card.addEventListener("click", () => {
        openRecipeDetail(recipe.id);
      });

      recipeGrid.appendChild(card);
    });
  }

  function applyFilters(list) {
    return list.filter((recipe) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!recipe.title.toLowerCase().includes(q)) return false;
      }

      // Difficulty
      if (filters.difficulty !== "all") {
        if (recipe.difficulty !== filters.difficulty) return false;
      }

      // Max prep time
      if (filters.maxPrepTime != null && !Number.isNaN(filters.maxPrepTime)) {
        if ((recipe.prepTime || 0) > filters.maxPrepTime) return false;
      }

      return true;
    });
  }

  // ---------- Rendering: detail ----------

  function openRecipeDetail(id) {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;

    currentRecipeId = id;

    detailContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "detail-header";

    // Image
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "detail-image-wrapper";
    const img = document.createElement("img");
    img.alt = recipe.title;
    img.src =
      recipe.imageUrl ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";
    imgWrapper.appendChild(img);

    // Title + meta
    const headerContent = document.createElement("div");

    const title = document.createElement("h2");
    title.className = "detail-title";
    title.textContent = recipe.title;

    const meta = document.createElement("div");
    meta.className = "detail-meta";

    const diff = document.createElement("span");
    diff.className = "badge badge-difficulty";
    diff.textContent = recipe.difficulty;

    const prep = document.createElement("span");
    prep.className = "badge";
    prep.textContent = `Prep: ${recipe.prepTime} mins`;

    const cook = document.createElement("span");
    cook.className = "badge";
    cook.textContent = `Cook: ${recipe.cookTime} mins`;

    meta.append(diff, prep, cook);

    const desc = document.createElement("p");
    desc.className = "detail-description";
    desc.textContent = recipe.description;

    headerContent.append(title, meta, desc);

    header.append(imgWrapper, headerContent);

    // Body: ingredients + steps
    const body = document.createElement("div");
    body.className = "detail-body";

    const ingredientsSection = document.createElement("section");
    const ingTitle = document.createElement("h3");
    ingTitle.className = "detail-section-title";
    ingTitle.textContent = "Ingredients";

    const ingList = document.createElement("ul");
    ingList.className = "detail-list";
    recipe.ingredients.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ingList.appendChild(li);
    });

    ingredientsSection.append(ingTitle, ingList);

    const stepsSection = document.createElement("section");
    const stepsTitle = document.createElement("h3");
    stepsTitle.className = "detail-section-title";
    stepsTitle.textContent = "Steps";

    const stepsList = document.createElement("ol");
    stepsList.className = "detail-list";
    recipe.steps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      stepsList.appendChild(li);
    });

    stepsSection.append(stepsTitle, stepsList);

    body.append(ingredientsSection, stepsSection);

    detailContainer.append(header, body);

    showView("detail");
  }

  // ---------- Form handling ----------

  function openAddForm() {
    formTitle.textContent = "Add Recipe";
    recipeIdInput.value = "";
    titleInput.value = "";
    difficultyInput.value = "";
    prepTimeInput.value = "";
    cookTimeInput.value = "";
    imageUrlInput.value = "";
    descriptionInput.value = "";
    ingredientsInput.value = "";
    stepsInput.value = "";
    clearFormErrors();
    showView("form");
  }

  function openEditForm() {
    const recipe = recipes.find((r) => r.id === currentRecipeId);
    if (!recipe) return;

    formTitle.textContent = "Edit Recipe";
    recipeIdInput.value = recipe.id;
    titleInput.value = recipe.title;
    difficultyInput.value = recipe.difficulty;
    prepTimeInput.value = recipe.prepTime;
    cookTimeInput.value = recipe.cookTime;
    imageUrlInput.value = recipe.imageUrl || "";
    descriptionInput.value = recipe.description;
    ingredientsInput.value = recipe.ingredients.join("\n");
    stepsInput.value = recipe.steps.join("\n");
    clearFormErrors();
    showView("form");
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    clearFormErrors();

    const data = getFormData();

    const errors = validateRecipeData(data);
    if (errors.length) {
      showFormErrors(errors);
      return;
    }

    if (data.id) {
      // update
      const index = recipes.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...data };
      }
    } else {
      // create
      const newRecipe = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      recipes.unshift(newRecipe);
    }

    saveRecipesToStorage(recipes);
    renderRecipeList();
    showView("home");
  }

  function getFormData() {
    const ingredients = ingredientsInput.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const steps = stepsInput.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      id: recipeIdInput.value || null,
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      difficulty: difficultyInput.value,
      prepTime: Number(prepTimeInput.value),
      cookTime: Number(cookTimeInput.value),
      imageUrl: imageUrlInput.value.trim() || null,
      ingredients,
      steps,
    };
  }

  function validateRecipeData(data) {
    const errors = [];

    if (!data.title) {
      errors.push("Title is required.");
    }
    if (!data.description) {
      errors.push("Description is required.");
    }
    if (!data.difficulty) {
      errors.push("Difficulty is required.");
    }
    if (Number.isNaN(data.prepTime) || data.prepTime < 0) {
      errors.push("Prep time must be a non-negative number.");
    }
    if (Number.isNaN(data.cookTime) || data.cookTime < 0) {
      errors.push("Cook time must be a non-negative number.");
    }
    if (!data.ingredients.length) {
      errors.push("At least one ingredient is required.");
    }
    if (!data.steps.length) {
      errors.push("At least one step is required.");
    }

    // ✅ allow both absolute URLs AND local image paths
    if (data.imageUrl && !isProbablyUrl(data.imageUrl)) {
      errors.push("Image URL / path does not look valid.");
    }

    return errors;
  }

  function showFormErrors(errors) {
    formErrors.innerHTML = "";
    const list = document.createElement("ul");
    errors.forEach((err) => {
      const li = document.createElement("li");
      li.textContent = err;
      list.appendChild(li);
    });
    formErrors.appendChild(list);
    formErrors.style.display = "block";
  }

  function clearFormErrors() {
    formErrors.style.display = "none";
    formErrors.innerHTML = "";
  }

  // ✅ improved URL checker – supports local files like "noodles.jpg"
  function isProbablyUrl(value) {
    // simple check for common image file paths (local or relative)
    const imageLike = /^[./\w-]+\.(png|jpe?g|gif|webp|avif)$/i;
    if (imageLike.test(value)) return true;

    try {
      // will accept full URLs like https://example.com/img.jpg
      new URL(value, window.location.href);
      return true;
    } catch {
      return false;
    }
  }

  // ---------- Delete ----------

  function deleteCurrentRecipe() {
    if (!currentRecipeId) return;
    const recipe = recipes.find((r) => r.id === currentRecipeId);
    if (!recipe) return;

    const confirmed = window.confirm(
      `Delete recipe "${recipe.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    recipes = recipes.filter((r) => r.id !== currentRecipeId);
    currentRecipeId = null;
    saveRecipesToStorage(recipes);
    renderRecipeList();
    showView("home");
  }

  // ---------- Event listeners ----------

  function attachEvents() {
    addRecipeBtn.addEventListener("click", openAddForm);

    backToListFromDetail.addEventListener("click", () => {
      showView("home");
    });

    backToListFromForm.addEventListener("click", () => {
      showView("home");
    });

    editRecipeBtn.addEventListener("click", openEditForm);
    deleteRecipeBtn.addEventListener("click", deleteCurrentRecipe);

    searchInput.addEventListener("input", (e) => {
      filters.search = e.target.value.trim();
      renderRecipeList();
    });

    difficultyFilter.addEventListener("change", (e) => {
      filters.difficulty = e.target.value;
      renderRecipeList();
    });

    maxPrepTimeFilter.addEventListener("input", (e) => {
      const value = e.target.value;
      filters.maxPrepTime = value === "" ? null : Number(value);
      renderRecipeList();
    });

    recipeForm.addEventListener("submit", handleFormSubmit);

    resetFormBtn.addEventListener("click", () => {
      recipeForm.reset();
      recipeIdInput.value = "";
      clearFormErrors();
    });
  }

  // ---------- Init ----------

  function init() {
    recipes = loadRecipesFromStorage();
    attachEvents();
    renderRecipeList();
    showView("home");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
