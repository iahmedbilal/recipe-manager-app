

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

  const recipeIdInput = document.getElementById("recipeId");
  const titleInput = document.getElementById("titleInput");
  const difficultyInput = document.getElementById("difficultyInput");
  const prepTimeInput = document.getElementById("prepTimeInput");
  const cookTimeInput = document.getElementById("cookTimeInput");
  const imageUrlInput = document.getElementById("imageUrlInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const ingredientsInput = document.getElementById("ingredientsInput");
  const stepsInput = document.getElementById("stepsInput");
  const resetFormBtn = document.getElementById("resetFormBtn");

  function loadRecipesFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedInitialRecipes();
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("recipes not array");
      return parsed;
    } catch (err) {
      console.warn("corrupted localStorage recipes, resetting:", err);
      localStorage.removeItem(STORAGE_KEY);
      return seedInitialRecipes();
    }
  }

  function saveRecipesToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ---------- Initial seed ----------
  function seedInitialRecipes() {
    const initialRecipe = {
      id: generateId(),
      title: "Ahmed's Special Chicken Noodles",
      description:
        "Quick stir-fried chicken noodles with veggies, perfect for weeknights.",
      ingredients: [
        "160–200 g fresh egg noodles or 120–150 g dried egg noodles (about 1½ cups dried).",
        "250 g boneless chicken (breast or thigh), thinly sliced.",
        "2 tablespoons light soy sauce (for cooking).",
        "1 teaspoon dark soy sauce (optional — for color).",
        "1½ tablespoons oyster sauce.",
        "1 teaspoon sesame oil.",
        "1 teaspoon sugar (or honey).",
        "2 teaspoons cornflour (cornstarch) — for marinade.",
        "2 tablespoons water (for slurry) + extra for marinade.",
        "2–3 tablespoons vegetable oil (or peanut oil) for stir-frying.",
        "2 cloves garlic, thinly sliced or minced.",
        "1 teaspoon fresh ginger, minced (optional but recommended).",
        "1 small onion, thinly sliced (or 2 spring onions — use white part for cooking).",
        "1 small carrot, julienned or thinly sliced.",
        "1 cup shredded cabbage (napa or regular) or ½ bell pepper thinly sliced.",
        "½ cup bean sprouts (optional).",
        "2 spring onions (scallions), sliced on diagonal (green parts for garnish).",
        "Salt and white or black pepper, to taste.",
        "Lime wedge or toasted sesame seeds for finishing (optional).",
      ],

      steps: [
        "Take 250 g boneless chicken and slice it into thin, even strips so it cooks quickly and stays tender.",
        "In a bowl, add 1 tbsp light soy sauce, 1 tsp sesame oil, 2 tsp cornflour, 1 tsp sugar, and 1 tbsp water, then mix well to create a smooth marinade.",
        "Add the sliced chicken to the marinade, coat all pieces properly, and let it rest for at least 10 minutes while you prepare other ingredients.",
        "If using dried noodles, boil them in salted water for 3–5 minutes or until just cooked (al dente), then drain immediately.",
        "Rinse the boiled noodles under cold water to stop the cooking process and prevent sticking, then toss with 1 tsp oil to keep them loose.",
        "If using fresh noodles, gently loosen them with your hands without breaking them.",
        "Prepare the vegetables by slicing 1 carrot into thin julienne strips, shredding 1 cup of cabbage, and thinly slicing 1 small onion or the white part of 2 spring onions.",
        "Chop the green parts of the spring onions into small diagonal pieces and keep them aside for garnishing at the end.",
        "In a small bowl, mix 1 tbsp light soy sauce, 1½ tbsp oyster sauce, ½ tsp dark soy sauce (optional), 1 tsp sugar, and 2 tbsp water to form the stir-fry sauce.",
        "Keep an additional 1–2 tbsp water nearby to adjust consistency later if needed.",
        "Heat a wok or large pan on high flame and add 1–1½ tbsp oil, letting it become hot until slightly smoking.",
        "Add the marinated chicken to the hot wok, spreading it out so each piece sears properly, and leave it untouched for 20–30 seconds.",
        "Stir-fry the chicken for 2–3 minutes until it turns white, lightly browns on the edges, and is fully cooked, then remove and keep aside.",
        "Add another 1 tbsp oil to the same hot wok and let it heat for a few seconds.",
        "Add minced garlic (2 cloves) and minced ginger (1 tsp) and stir quickly for 10–15 seconds until fragrant but not burnt.",
        "Add the sliced onion or spring onion whites and stir-fry for about 1 minute to soften slightly.",
        "Add the julienned carrot and continue stir-frying for another 1–2 minutes until the carrot becomes slightly tender but still crisp.",
        "Add the shredded cabbage and (optional) bean sprouts, stir-frying for 30–60 seconds to keep them crunchy.",
        "Return the cooked chicken into the wok and mix everything together.",
        "Add the boiled (or fresh) noodles into the wok, placing them on top of the chicken and vegetables.",
        "Pour the prepared stir-fry sauce evenly over the noodles to help distribute flavor throughout.",
        "Using tongs or two spatulas, gently toss the noodles, chicken, and vegetables together for 1–2 minutes until everything is evenly coated.",
        "If the noodles look dry or clumpy, sprinkle 1–2 tbsp water and toss again to loosen them up.",
        "Taste and adjust seasoning by adding a little more soy sauce for salt or a pinch of sugar if you want a slight sweetness.",
        "Add black pepper or white pepper according to your taste and stir well.",
        "Add the chopped spring onion green parts and toss lightly to combine without overcooking them.",
        "Turn off the heat and transfer the noodles to serving plates while still hot.",
        "Optionally, squeeze a little lime on top or sprinkle toasted sesame seeds for extra flavor before serving.",
      ],
      prepTime: 15,
      cookTime: 15,
      difficulty: "Easy",
      imageUrl: "images/noodles.jpg", // ✔ Your noodles photo
      createdAt: new Date().toISOString(),
    };

    const samples = [
      {
        id: generateId(),
        title: "One-Pot Veggie Pasta",
        description: "Creamy one-pot pasta loaded with vegetables.",
        ingredients: [
          "200 g pasta (penne or any short pasta)",
          "1 cup mixed vegetables (carrot, capsicum, peas, corn)",
          "1 medium onion, finely chopped",
          "2 cloves garlic, minced",
          "2 cups water or vegetable stock",
          "1/2 cup milk or fresh cream",
          "2 tbsp grated cheese",
          "1 tbsp butter or olive oil",
          "1/2 tsp black pepper",
          "1/2 tsp red chili flakes (optional)",
          "Salt to taste",
          "1/2 tsp oregano or mixed herbs",
        ],
        steps: [
          "Heat butter or olive oil in a pot on medium flame.",
          "Add chopped onions and minced garlic; sauté until soft and fragrant.",
          "Add all mixed vegetables and stir-fry for 1–2 minutes.",
          "Add the pasta into the pot and mix well.",
          "Pour in 2 cups water or vegetable stock and add salt to taste.",
          "Cover the pot and cook on medium heat until the pasta becomes soft.",
          "Once the water reduces, add milk or cream and stir gently.",
          "Add black pepper, chili flakes, and oregano.",
          "Mix in the grated cheese and cook for another 1–2 minutes until creamy.",
          "Turn off the heat and let it sit for 1 minute before serving.",
          "Serve hot and enjoy your one-pot creamy veggie pasta!",
        ],
        prepTime: 10,
        cookTime: 20,
        difficulty: "Easy",
        imageUrl: "images/pasta.jpg", // ✔ Your pasta photo
        createdAt: new Date().toISOString(),
      },

      {
        id: generateId(),
        title: "Chicken Biryani",
        description:
          "A flavorful layered chicken biryani cooked with aromatic rice and spices.",
        ingredients: [
          "500 g chicken (bone-in or boneless)",
          "2 cups basmati rice (soak 20–30 mins)",
          "2 large onions, thinly sliced",
          "1 medium tomato, chopped",
          "1/2 cup yogurt",
          "2 tbsp ginger-garlic paste",
          "3–4 green chilies, slit",
          "1/2 cup chopped coriander leaves",
          "1/2 cup mint leaves",
          "1 tbsp biryani masala",
          "1 tsp turmeric powder",
          "1 tsp red chilli powder",
          "4 tbsp oil or ghee",
          "Whole spices: 1 bay leaf, 4 cloves, 4 cardamom, 1 cinnamon stick, 1 star anise",
          "3 cups water",
          "Saffron milk (optional): 2 tbsp warm milk + few saffron strands",
          "Salt to taste",
        ],
        steps: [
          "Wash and soak basmati rice for 20–30 minutes.",
          "Heat oil or ghee in a large pot and fry the whole spices for 30 seconds.",
          "Add sliced onions and cook until golden brown.",
          "Add ginger-garlic paste and sauté until the raw smell disappears.",
          "Add chicken pieces and cook for 5–7 minutes until lightly browned.",
          "Add chopped tomatoes, turmeric, red chilli powder, biryani masala, and salt.",
          "Cook until tomatoes turn soft and chicken releases moisture.",
          "Add yogurt, mint leaves, and coriander leaves; cook for 5 minutes on medium heat.",
          "Add 3 cups water and let the chicken cook until about 70–80% done.",
          "In another pot, boil water and cook the soaked rice until 70% done, then drain completely.",
          "Spread the half-cooked rice evenly on top of the chicken masala to form layers.",
          "Sprinkle saffron milk (if using), some fried onions, and a few mint and coriander leaves on top.",
          "Cover the pot tightly with a lid (you can seal edges with dough for better dum) and cook on low flame for 15–20 minutes.",
          "Turn off the heat and let the biryani rest for another 10 minutes.",
          "Gently fluff up the biryani from the sides and serve hot with raita or salad.",
        ],
        prepTime: 20,
        cookTime: 40,
        difficulty: "Hard",
        imageUrl: "images/biryani.jpg",
        createdAt: new Date().toISOString(),
      },

      {
        id: generateId(),
        title: "Cheese Omelette",
        description: "A soft, fluffy omelette filled with melted cheese.",
        ingredients: [
          "2–3 eggs",
          "3–4 tbsp grated cheese (cheddar, mozzarella, or processed cheese)",
          "1 tbsp butter or oil",
          "1/4 cup finely chopped onions",
          "1 green chili, finely chopped (optional)",
          "2 tbsp chopped coriander leaves",
          "Salt to taste",
          "Black pepper to taste",
        ],
        steps: [
          "Crack the eggs into a bowl, add salt and black pepper, and whisk well until slightly frothy.",
          "Heat butter or oil in a small non-stick pan over medium heat.",
          "Add chopped onions and green chilli, and sauté for 1–2 minutes until they soften slightly.",
          "Pour the whisked eggs into the pan and tilt the pan to spread the mixture evenly.",
          "Reduce the flame to low and cook until the omelette is almost set on top but still slightly soft.",
          "Sprinkle grated cheese evenly on one half of the omelette and add chopped coriander leaves.",
          "Gently fold the other half of the omelette over the cheese using a spatula.",
          "Cook for another 1–2 minutes on low heat until the cheese melts inside.",
          "Slide the omelette onto a plate and serve hot with toast or ketchup.",
        ],
        prepTime: 5,
        cookTime: 5,
        difficulty: "Easy",
        imageUrl: "images/omelette.jpg",
        createdAt: new Date().toISOString(),
      },

      {
        id: generateId(),
        title: "Paneer Tikka Wrap",
        description: "Grilled paneer stuffed in soft rotis with salad.",
        ingredients: [
          "200 g paneer cubes",
          "4 rotis",
          "1/2 cup yogurt",
          "Spices",
          "Onion & capsicum",
        ],
        steps: [
          "Marinate paneer.",
          "Grill with onions & capsicum.",
          "Warm rotis.",
          "Fill and roll.",
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

  // ---------- View ----------
  function showView(name) {
    Object.values(views).forEach((v) => v.classList.remove("active"));
    views[name].classList.add("active");
  }

  // ---------- Render list ----------
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
      img.src =
        recipe.imageUrl ||
        "https://images.unsplash.com/photo-1513104890138-7c749659a591";
      img.alt = recipe.title;
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
      time.textContent = `${recipe.prepTime + recipe.cookTime} mins total`;

      meta.append(diff, time);

      const desc = document.createElement("p");
      desc.className = "recipe-description";
      desc.textContent = recipe.description;

      body.append(title, meta, desc);
      card.append(imgWrapper, body);

      card.addEventListener("click", () => openRecipeDetail(recipe.id));

      recipeGrid.appendChild(card);
    });
  }

  function applyFilters(list) {
    return list.filter((recipe) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!recipe.title.toLowerCase().includes(q)) return false;
      }

      if (filters.difficulty !== "all") {
        if (recipe.difficulty !== filters.difficulty) return false;
      }

      if (filters.maxPrepTime != null) {
        if (recipe.prepTime > filters.maxPrepTime) return false;
      }

      return true;
    });
  }

  // ---------- Detail view ----------
  function openRecipeDetail(id) {
    const recipe = recipes.find((r) => r.id === id);
    currentRecipeId = id;

    detailContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "detail-header";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "detail-image-wrapper";

    const img = document.createElement("img");
    img.src =
      recipe.imageUrl ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591";
    img.alt = recipe.title;

    imgWrapper.appendChild(img);

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

    const body = document.createElement("div");
    body.className = "detail-body";

    const ingTitle = document.createElement("h3");
    ingTitle.className = "detail-section-title";
    ingTitle.textContent = "Ingredients";

    const ingList = document.createElement("ul");
    ingList.className = "detail-list";
    recipe.ingredients.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = i;
      ingList.appendChild(li);
    });

    const ingredientsSection = document.createElement("section");
    ingredientsSection.append(ingTitle, ingList);

    const stepsTitle = document.createElement("h3");
    stepsTitle.className = "detail-section-title";
    stepsTitle.textContent = "Steps";

    const stepsList = document.createElement("ol");
    stepsList.className = "detail-list";
    recipe.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      stepsList.appendChild(li);
    });

    const stepsSection = document.createElement("section");
    stepsSection.append(stepsTitle, stepsList);

    body.append(ingredientsSection, stepsSection);
    detailContainer.append(header, body);

    showView("detail");
  }

  // ---------- Form ----------
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

  function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const data = getFormData();

    const errors = validateRecipeData(data);
    if (errors.length) {
      showFormErrors(errors);
      return;
    }

    if (data.id) {
      const index = recipes.findIndex((r) => r.id === data.id);
      recipes[index] = { ...recipes[index], ...data };
    } else {
      recipes.unshift({
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    saveRecipesToStorage(recipes);
    renderRecipeList();
    showView("home");
  }

  function getFormData() {
    const ingredients = ingredientsInput.value
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    const steps = stepsInput.value
      .split("\n")
      .map((a) => a.trim())
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

    if (!data.title) errors.push("Title is required.");
    if (!data.description) errors.push("Description is required.");
    if (!data.difficulty) errors.push("Difficulty is required.");
    if (isNaN(data.prepTime)) errors.push("Prep time invalid.");
    if (isNaN(data.cookTime)) errors.push("Cook time invalid.");
    if (!data.ingredients.length)
      errors.push("At least one ingredient required.");
    if (!data.steps.length) errors.push("At least one step required.");

    return errors;
  }

  function showFormErrors(errors) {
    formErrors.innerHTML = "";
    const ul = document.createElement("ul");
    errors.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = e;
      ul.appendChild(li);
    });
    formErrors.appendChild(ul);
    formErrors.style.display = "block";
  }

  function clearFormErrors() {
    formErrors.style.display = "none";
    formErrors.innerHTML = "";
  }

  // ---------- Delete ----------
  function deleteCurrentRecipe() {
    const confirmed = confirm("Delete this recipe?");
    if (!confirmed) return;

    recipes = recipes.filter((r) => r.id !== currentRecipeId);
    saveRecipesToStorage(recipes);
    showView("home");
    renderRecipeList();
  }

  // ---------- Events ----------
  function attachEvents() {
    addRecipeBtn.addEventListener("click", openAddForm);

    backToListFromDetail.addEventListener("click", () => showView("home"));
    backToListFromForm.addEventListener("click", () => showView("home"));

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
      filters.maxPrepTime = e.target.value ? Number(e.target.value) : null;
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
