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
    type: "all",
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
  const typeFilter = document.getElementById("typeFilter");

  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const backToListFromDetail = document.getElementById("backToListFromDetail");
  const backToListFromForm = document.getElementById("backToListFromForm");

  const detailContainer = document.getElementById("detailContainer");
  const editRecipeBtn = document.getElementById("editRecipeBtn");
  const deleteRecipeBtn = document.getElementById("deleteRecipeBtn");

  // NEW: Export & Share buttons
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const shareRecipeBtn = document.getElementById("shareRecipeBtn");

  const formTitle = document.getElementById("formTitle");
  const recipeForm = document.getElementById("recipeForm");
  const formErrors = document.getElementById("formErrors");

  const recipeIdInput = document.getElementById("recipeId");
  const titleInput = document.getElementById("titleInput");
  const difficultyInput = document.getElementById("difficultyInput");
  const typeInput = document.getElementById("typeInput");
  const prepTimeInput = document.getElementById("prepTimeInput");
  const cookTimeInput = document.getElementById("cookTimeInput");
  const imageUrlInput = document.getElementById("imageUrlInput");
  const videoUrlInput = document.getElementById("videoUrlInput"); // NEW
  const descriptionInput = document.getElementById("descriptionInput");
  const ingredientsInput = document.getElementById("ingredientsInput");
  const stepsInput = document.getElementById("stepsInput");
  const resetFormBtn = document.getElementById("resetFormBtn");

  // ---------- Helpers for rating/reviews + video ----------

  function normalizeRecipe(recipe) {
    const normalizedType =
      recipe.type === "Veg" || recipe.type === "Non-Veg" ? recipe.type : "Veg";

    return {
      ...recipe,
      type: normalizedType,
      reviews: Array.isArray(recipe.reviews) ? recipe.reviews : [],
      ratingCount:
        typeof recipe.ratingCount === "number" ? recipe.ratingCount : 0,
      rating: typeof recipe.rating === "number" ? recipe.rating : 0,
      videoUrl: recipe.videoUrl || null,
    };
  }

  function normalizeRecipes(list) {
    return list.map(normalizeRecipe);
  }

  // Helper: build embeddable YouTube URL from watch / short link
  function getYouTubeEmbedUrl(rawUrl) {
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      const host = url.hostname.replace("www.", "");
      let videoId = null;

      if (host === "youtube.com" || host === "m.youtube.com") {
        videoId = url.searchParams.get("v");
      } else if (host === "youtu.be") {
        videoId = url.pathname.slice(1);
      }

      if (!videoId) return null;
      return "https://www.youtube.com/embed/" + videoId;
    } catch (e) {
      return null;
    }
  }

  // ---------- Storage ----------
  function loadRecipesFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedInitialRecipes();
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("recipes not array");
      return normalizeRecipes(parsed);
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
      type: "Non-Veg",
      imageUrl: "images/noodles.jpg",
      videoUrl: `https://youtu.be/AthGc8rDtHc?si=dqWUBMjOqGleLDda`,
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
        type: "Veg",
        imageUrl: "images/pasta.jpg",
        videoUrl: `https://youtu.be/l4PQzpYFm04?si=9BdqtsEfg2ZCZT0c`,
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
          "Cover the pot tightly with a lid and cook on low flame for 15–20 minutes.",
          "Turn off the heat and let the biryani rest for another 10 minutes.",
          "Gently fluff up the biryani from the sides and serve hot with raita or salad.",
        ],
        prepTime: 20,
        cookTime: 40,
        difficulty: "Hard",
        type: "Non-Veg",
        imageUrl: "images/biryani.jpg",
        videoUrl: `https://youtu.be/EiVoWp5b93s?si=Gbi2Miu707YCyPs8`,
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
        type: "Non-Veg",
        imageUrl: "images/omelette.jpg",
        videoUrl: `https://youtu.be/RsKonQWs8z8?si=uilLtmN2MSQg4m_5`,
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
          "Spices (red chilli powder, turmeric, garam masala)",
          "1 onion, sliced",
          "1 capsicum, sliced",
        ],
        steps: [
          "Mix yogurt with spices to make a marinade.",
          "Add paneer cubes and coat well; rest 15–20 mins.",
          "Grill or pan-fry paneer with onions and capsicum until slightly charred.",
          "Warm the rotis on a tawa.",
          "Place the paneer mixture in the centre of each roti.",
          "Roll tightly into a wrap and serve hot.",
        ],
        prepTime: 20,
        cookTime: 15,
        difficulty: "Medium",
        type: "Veg",
        imageUrl:
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
        videoUrl: `https://youtu.be/rre7unozEJk?si=lSLRw_xj2XDMHT5x`,
        createdAt: new Date().toISOString(),
      },
    ];

    const data = normalizeRecipes([initialRecipe, ...samples]);
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
    const filtered = applyFilters(recipes.slice());

    // Sort by rating (highest first), then newest
    filtered.sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      if (bRating !== aRating) return bRating - aRating;
      const aDate = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bDate = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bDate - aDate;
    });

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

      const typeBadge = document.createElement("span");
      typeBadge.className = "badge";
      typeBadge.textContent = recipe.type || "Type";

      const time = document.createElement("span");
      time.className = "badge";
      time.textContent = `${recipe.prepTime + recipe.cookTime} mins total`;

      const ratingBadge = document.createElement("span");
      ratingBadge.className = "badge";
      if (recipe.ratingCount > 0) {
        ratingBadge.textContent = `⭐ ${recipe.rating.toFixed(1)} (${
          recipe.ratingCount
        })`;
      } else {
        ratingBadge.textContent = "No ratings";
      }

      meta.append(diff, typeBadge, time, ratingBadge);

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

      if (filters.type !== "all") {
        if (recipe.type !== filters.type) return false;
      }

      return true;
    });
  }

  // ---------- Detail view ----------
  function openRecipeDetail(id) {
    const recipe = normalizeRecipe(recipes.find((r) => r.id === id));
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

    const typeBadge = document.createElement("span");
    typeBadge.className = "badge";
    typeBadge.textContent = recipe.type || "Type";

    const prep = document.createElement("span");
    prep.className = "badge";
    prep.textContent = `Prep: ${recipe.prepTime} mins`;

    const cook = document.createElement("span");
    cook.className = "badge";
    cook.textContent = `Cook: ${recipe.cookTime} mins`;

    const ratingMeta = document.createElement("span");
    ratingMeta.className = "badge";
    if (recipe.ratingCount > 0) {
      ratingMeta.textContent = `⭐ ${recipe.rating.toFixed(1)} (${
        recipe.ratingCount
      })`;
    } else {
      ratingMeta.textContent = "No ratings yet";
    }

    meta.append(diff, typeBadge, prep, cook, ratingMeta);

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

    // ---- Rating & Reviews section ----
    const reviewSection = document.createElement("section");

    const reviewTitle = document.createElement("h3");
    reviewTitle.className = "detail-section-title";
    reviewTitle.textContent = "Rating & Reviews";

    const ratingSummary = document.createElement("p");
    ratingSummary.className = "detail-description";
    if (recipe.ratingCount > 0) {
      ratingSummary.textContent = `Average rating: ${recipe.rating.toFixed(
        1
      )} / 5 (${recipe.ratingCount} rating${
        recipe.ratingCount > 1 ? "s" : ""
      })`;
    } else {
      ratingSummary.textContent =
        "No ratings yet. Be the first to rate this recipe!";
    }

    let selectedRating = 0;
    const ratingField = document.createElement("div");
    ratingField.className = "field-group";
    const ratingLabel = document.createElement("label");
    ratingLabel.textContent = "Your rating:";
    const starsWrapper = document.createElement("div");

    const starButtons = [];
    function updateStarUI() {
      starButtons.forEach((btn) => {
        const value = Number(btn.dataset.value);
        if (value <= selectedRating) {
          btn.style.color = "var(--accent-soft)";
        } else {
          btn.style.color = "var(--text-muted)";
        }
      });
    }

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost";
      btn.dataset.value = String(i);
      btn.textContent = "★";
      btn.addEventListener("click", () => {
        selectedRating = i;
        updateStarUI();
      });
      starButtons.push(btn);
      starsWrapper.appendChild(btn);
    }
    updateStarUI();

    ratingField.append(ratingLabel, starsWrapper);

    const reviewField = document.createElement("div");
    reviewField.className = "field-group";
    const reviewLabel = document.createElement("label");
    reviewLabel.textContent = "Your review (optional):";
    const reviewInput = document.createElement("textarea");
    reviewInput.rows = 3;
    reviewField.append(reviewLabel, reviewInput);

    const reviewActions = document.createElement("div");
    reviewActions.className = "form-actions";
    const submitReviewBtn = document.createElement("button");
    submitReviewBtn.type = "button";
    submitReviewBtn.className = "btn btn-primary";
    submitReviewBtn.textContent = "Submit review";
    reviewActions.appendChild(submitReviewBtn);

    submitReviewBtn.addEventListener("click", () => {
      if (!selectedRating) {
        alert("Please select a rating between 1 and 5 stars.");
        return;
      }
      const text = reviewInput.value.trim();
      addReview(recipe.id, selectedRating, text);
    });

    // Existing reviews
    let reviewsBlock;
    if (recipe.reviews && recipe.reviews.length) {
      const reviewsTitle = document.createElement("h4");
      reviewsTitle.className = "detail-section-title";
      reviewsTitle.textContent = "What others say";

      const reviewsList = document.createElement("ul");
      reviewsList.className = "detail-list";

      recipe.reviews.forEach((rev) => {
        const li = document.createElement("li");
        const stars = "★".repeat(rev.rating || 0).padEnd(5, "☆");
        const text = rev.text ? ` – ${rev.text}` : "";
        li.textContent = `${stars}${text}`;
        reviewsList.appendChild(li);
      });

      reviewsBlock = document.createElement("div");
      reviewsBlock.append(reviewsTitle, reviewsList);
    } else {
      const noReviews = document.createElement("p");
      noReviews.className = "detail-description";
      noReviews.textContent = "No reviews yet.";
      reviewsBlock = noReviews;
    }

    reviewSection.append(
      reviewTitle,
      ratingSummary,
      ratingField,
      reviewField,
      reviewActions,
      reviewsBlock
    );

    // NEW: Cooking Video section (if videoUrl set)
    let videoSection = null;
    if (recipe.videoUrl) {
      videoSection = document.createElement("section");

      const videoTitle = document.createElement("h3");
      videoTitle.className = "detail-section-title";
      videoTitle.textContent = "Cooking Video";

      const embedUrl = getYouTubeEmbedUrl(recipe.videoUrl);

      if (embedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = embedUrl;
        iframe.width = "100%";
        iframe.height = "260";
        iframe.loading = "lazy";
        iframe.style.border = "0";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        videoSection.append(videoTitle, iframe);
      } else {
        const link = document.createElement("a");
        link.href = recipe.videoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Watch cooking video";
        videoSection.append(videoTitle, link);
      }
    }

    body.append(ingredientsSection, stepsSection, reviewSection);
    if (videoSection) {
      body.append(videoSection);
    }

    detailContainer.append(header, body);

    showView("detail");
  }

  // ---------- Rating / Review logic ----------
  function addReview(recipeId, ratingValue, text) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const currentRating = recipe.rating || 0;
    const currentCount = recipe.ratingCount || 0;

    const newCount = currentCount + 1;
    const newTotal = currentRating * currentCount + ratingValue;
    const newAverage = newTotal / newCount;

    const newReview = {
      id: generateId(),
      rating: ratingValue,
      text,
      createdAt: new Date().toISOString(),
    };

    recipe.rating = Number(newAverage.toFixed(2));
    recipe.ratingCount = newCount;
    recipe.reviews = [newReview].concat(
      Array.isArray(recipe.reviews) ? recipe.reviews : []
    );

    saveRecipesToStorage(recipes);
    renderRecipeList();
    openRecipeDetail(recipeId);
  }

  // ---------- Export to PDF ----------
  function exportCurrentRecipeAsPdf() {
    if (!currentRecipeId) return;
    const recipe = normalizeRecipe(
      recipes.find((r) => r.id === currentRecipeId)
    );
    if (!recipe) return;

    const ingredientsHtml = (recipe.ingredients || [])
      .map((i) => `<li>${i}</li>`)
      .join("");
    const stepsHtml = (recipe.steps || []).map((s) => `<li>${s}</li>`).join("");

    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to export the recipe.");
      return;
    }

    const doc = win.document;
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${recipe.title} - Recipe</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px;
      color: #111827;
      line-height: 1.5;
    }
    h1 {
      margin-top: 0;
      font-size: 1.8rem;
    }
    .meta {
      margin: 8px 0 16px;
      font-size: 0.9rem;
      color: #4b5563;
    }
    h2 {
      font-size: 1.1rem;
      margin-top: 18px;
      margin-bottom: 6px;
    }
    ul, ol {
      margin-top: 4px;
      padding-left: 18px;
    }
    .section {
      margin-bottom: 12px;
    }
    .rating {
      margin-top: 4px;
      font-size: 0.9rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>${recipe.title}</h1>
  <div class="meta">
    Type: ${recipe.type} · Difficulty: ${recipe.difficulty} · Prep: ${
      recipe.prepTime
    } mins · Cook: ${recipe.cookTime} mins
  </div>
  <div class="section">
    <h2>Description</h2>
    <p>${recipe.description}</p>
  </div>
  <div class="section">
    <h2>Ingredients</h2>
    <ul>${ingredientsHtml}</ul>
  </div>
  <div class="section">
    <h2>Steps</h2>
    <ol>${stepsHtml}</ol>
  </div>
  <div class="section rating">
    ${
      recipe.ratingCount > 0
        ? `Average rating: ${recipe.rating.toFixed(1)} / 5 (${
            recipe.ratingCount
          } rating${recipe.ratingCount > 1 ? "s" : ""})`
        : "No ratings yet."
    }
  </div>
</body>
</html>`);

    doc.close();
    win.focus();
    win.print(); // user can choose "Save as PDF"
  }

  // ---------- Share recipe ----------
  function shareCurrentRecipe() {
    if (!currentRecipeId) return;
    const recipe = normalizeRecipe(
      recipes.find((r) => r.id === currentRecipeId)
    );
    if (!recipe) return;

    const baseText = `${recipe.title}

${recipe.description}

Prep: ${recipe.prepTime} mins · Cook: ${recipe.cookTime} mins`;

    const shareData = {
      title: recipe.title,
      text: baseText,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // user cancelled share – silently ignore
      });
    } else {
      const fallbackText = `${baseText}

${window.location.href}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(fallbackText)
          .then(() => {
            alert(
              "Recipe details copied to clipboard. You can paste and share it anywhere!"
            );
          })
          .catch(() => {
            alert("Here is the recipe you can share:\n\n" + fallbackText);
          });
      } else {
        alert("Here is the recipe you can share:\n\n" + fallbackText);
      }
    }
  }

  // ---------- Form ----------
  function openAddForm() {
    formTitle.textContent = "Add Recipe";
    recipeIdInput.value = "";
    titleInput.value = "";
    difficultyInput.value = "";
    typeInput.value = "";
    prepTimeInput.value = "";
    cookTimeInput.value = "";
    imageUrlInput.value = "";
    videoUrlInput.value = ""; // NEW
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
    typeInput.value = recipe.type || "";
    prepTimeInput.value = recipe.prepTime;
    cookTimeInput.value = recipe.cookTime;
    imageUrlInput.value = recipe.imageUrl || "";
    videoUrlInput.value = recipe.videoUrl || ""; // NEW
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
      recipes[index] = {
        ...recipes[index],
        ...data,
      };
    } else {
      recipes.unshift({
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        rating: 0,
        ratingCount: 0,
        reviews: [],
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
      type: typeInput.value,
      prepTime: Number(prepTimeInput.value),
      cookTime: Number(cookTimeInput.value),
      imageUrl: imageUrlInput.value.trim() || null,
      videoUrl: videoUrlInput.value.trim() || null, // NEW
      ingredients,
      steps,
    };
  }

  function validateRecipeData(data) {
    const errors = [];

    if (!data.title) errors.push("Title is required.");
    if (!data.description) errors.push("Description is required.");
    if (!data.difficulty) errors.push("Difficulty is required.");
    if (!data.type) errors.push("Type is required.");
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
    if (!currentRecipeId) return;
    const confirmed = confirm("Delete this recipe?");
    if (!confirmed) return;

    recipes = recipes.filter((r) => r.id !== currentRecipeId);
    saveRecipesToStorage(recipes);
    currentRecipeId = null;
    renderRecipeList();
    showView("home");
  }

  // ---------- Events ----------
  function attachEvents() {
    addRecipeBtn.addEventListener("click", openAddForm);

    backToListFromDetail.addEventListener("click", () => showView("home"));
    backToListFromForm.addEventListener("click", () => showView("home"));

    editRecipeBtn.addEventListener("click", openEditForm);
    deleteRecipeBtn.addEventListener("click", deleteCurrentRecipe);

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", exportCurrentRecipeAsPdf);
    }
    if (shareRecipeBtn) {
      shareRecipeBtn.addEventListener("click", shareCurrentRecipe);
    }

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

    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        filters.type = e.target.value;
        renderRecipeList();
      });
    }

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
