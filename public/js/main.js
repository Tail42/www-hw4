document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const errorMessage = document.getElementById('error-message');
  const mainContent = document.getElementById('main-content');
  const resultsSection = document.getElementById('results-section');
  const resultsBody = document.getElementById('results-body');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const loading = document.getElementById('loading');
  const foodDetails = document.getElementById('food-details');
  const backBtn = document.getElementById('back-btn');
  const foodName = document.getElementById('food-name');
  const banner = document.querySelector('.banner');
  const servingSelect = document.getElementById('serving-select');
  const caloriesDisplay = document.getElementById('calories');
  const favoriteBtn = document.getElementById('favorite-btn');
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesBody = document.getElementById('favorites-body');
  const favoritesBackBtn = document.getElementById('favorites-back-btn');
  const favoriteNutrition = document.getElementById('favorite-nutrition');
  const favoriteNutritionBody = document.getElementById('favorite-nutrition-body');
  const favoriteFoodName = document.getElementById('favorite-food-name');
  const progressBar = document.getElementById('progress-bar');

  let currentPage = 0;
  let totalPages = 1;
  let currentQuery = '';
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  let chartInstance = null; // 詳細頁面圖表

  // 搜尋功能
  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
      errorMessage.classList.add('show');
      return;
    }
    errorMessage.classList.remove('show');
    currentQuery = query;
    currentPage = 0;
    showMainContent();
    await searchFoods(query, currentPage);
  });

  // 搜尋食物
  async function searchFoods(query, page) {
    loading.style.display = 'block';
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&page=${page}&max_results=20`);
      const data = await response.json();
      console.log('API Response:', data);
      if (data.error) {
        alert(`Search failed: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        return;
      }
      displayResults(data.foods?.food || [], page);
      const totalResults = parseInt(data.foods?.total_results) || 20;
      totalPages = Math.ceil(totalResults / 20) || 1;
      console.log('Total results:', totalResults, 'Total pages:', totalPages);
      updatePagination(page);
    } catch (error) {
      alert(`Search failed: ${error.message}`);
      console.error('Search error:', error);
    } finally {
      loading.style.display = 'none';
    }
  }

  // 顯示搜尋結果
  function displayResults(foods, page) {
    resultsBody.innerHTML = '';
    if (foods && foods.length > 0) {
      foods.forEach((food, index) => {
        const isFavorite = favorites.some(fav => fav.food_id === food.food_id);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${page * 20 + index + 1}</td>
          <td>${food.food_name}</td>
          <td>${food.food_description}</td>
          <td>
            <button class="${isFavorite ? 'remove-btn' : 'add-btn'}" 
                    data-id="${food.food_id}" 
                    data-name="${food.food_name}" 
                    data-description="${food.food_description}">
              ${isFavorite ? 'Remove' : 'Add'}
            </button>
          </td>
        `;
        row.addEventListener('click', async (e) => {
          if (e.target.classList.contains('add-btn') || e.target.classList.contains('remove-btn')) return;
          await showFoodDetails(food.food_id, food.food_name);
        });
        resultsBody.appendChild(row);
      });
    } else {
      resultsBody.innerHTML = '<tr><td colspan="4">No search results</td></tr>';
    }
    resultsSection.style.display = 'block';
  }

  // 顯示食物詳細頁面
  async function showFoodDetails(foodId, name) {
    loading.style.display = 'block';
    try {
      const response = await fetch(`/api/food/${foodId}`);
      const data = await response.json();
      console.log('Food Details Response:', data);
      if (data.error) {
        alert(`Failed to load nutrition data: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        return;
      }
      const servings = data.food?.servings?.serving;
      if (!servings || servings.length === 0) {
        alert('No nutrition data available for this food.');
        return;
      }

      // 設置食物名稱
      foodName.textContent = name;

      // 填充下拉選單
      servingSelect.innerHTML = '';
      servings.forEach((serving, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = serving.serving_description;
        servingSelect.appendChild(option);
      });

      // 渲染營養數據
      renderNutritionData(servings, 0);

      // 監聽份量選擇
      servingSelect.removeEventListener('change', handleServingChange);
      servingSelect.addEventListener('change', handleServingChange);
      function handleServingChange() {
        const selectedIndex = parseInt(servingSelect.value);
        renderNutritionData(servings, selectedIndex);
      }

      // 切換到詳細頁面
      mainContent.style.display = 'none';
      banner.style.display = 'none';
      foodDetails.style.display = 'block';
      favoritesSection.style.display = 'none';
      favoriteNutrition.style.display = 'none';
    } catch (error) {
      alert(`Failed to load nutrition data: ${error.message}`);
      console.error('Nutrition error:', error);
    } finally {
      loading.style.display = 'none';
    }
  }

  // 顯示收藏列表
  function showFavoritesList() {
    mainContent.style.display = 'none';
    foodDetails.style.display = 'none';
    favoritesSection.style.display = 'block';
    favoriteNutrition.style.display = 'none';

    favoritesBody.innerHTML = '';
    if (favorites.length > 0) {
      favorites.forEach((food) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${food.food_id}</td>
          <td>${food.food_name}</td>
          <td>${food.food_description}</td>
          <td>
            <button class="delete-btn" data-id="${food.food_id}">Delete</button>
          </td>
        `;
        row.addEventListener('click', async (e) => {
          if (e.target.classList.contains('delete-btn')) return;
          await showFavoriteNutrition(food.food_id, food.food_name);
        });
        favoritesBody.appendChild(row);
      });
    } else {
      favoritesBody.innerHTML = '<tr><td colspan="4">No favorites added</td></tr>';
    }
  }

  // 顯示收藏食物的營養數據（表格）
  async function showFavoriteNutrition(foodId, name) {
    progressBar.style.display = 'block';
    progressBar.classList.add('active');
    favoriteNutrition.style.display = 'none';
    favoriteFoodName.textContent = '';
    try {
      const response = await fetch(`/api/food/${foodId}`);
      const data = await response.json();
      console.log('Favorite Nutrition Response:', data);
      if (data.error) {
        alert(`Failed to load nutrition data: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        return;
      }
      const servings = data.food?.servings?.serving;
      if (!servings || servings.length === 0) {
        alert('No nutrition data available for this food.');
        return;
      }

      // 設置食物名稱
      favoriteFoodName.textContent = name;

      // 渲染營養表格
      favoriteNutritionBody.innerHTML = '';
      servings.forEach((serving) => {
        const calories = parseFloat(serving.calories) || 0;
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${serving.serving_description}</td>
          <td>${calories.toFixed(0)}</td>
        `;
        favoriteNutritionBody.appendChild(row);
      });

      // 顯示營養表格
      favoriteNutrition.style.display = 'block';
    } catch (error) {
      alert(`Failed to load nutrition data: ${error.message}`);
      console.error('Nutrition error:', error);
    } finally {
      progressBar.classList.remove('active');
      setTimeout(() => {
        progressBar.style.display = 'none';
      }, 300); // 等待淡出動畫（0.3 秒）
    }
  }

  // 渲染營養數據（詳細頁面，圓形圖）
  function renderNutritionData(servings, index) {
    const serving = servings[index];
    const fat = parseFloat(serving.fat) || 0;
    const carb = parseFloat(serving.carbohydrate) || 0;
    const protein = parseFloat(serving.protein) || 0;
    const calories = parseFloat(serving.calories) || 0;
    const total = fat + carb + protein;

    if (total === 0) {
      alert('No valid nutrition data available.');
      return;
    }

    // 更新卡路里
    caloriesDisplay.textContent = `Calories: ${calories.toFixed(0)} kcal`;

    // 更新圖例
    const legend = document.querySelector('#pie-chart .legend');
    legend.innerHTML = `
      <div><span style="background-color: #ff6b6b;"></span>Fat: ${fat.toFixed(1)}g</div>
      <div><span style="background-color: #4ecdc4;"></span>Carbohydrate: ${carb.toFixed(1)}g</div>
      <div><span style="background-color: #45b7d1;"></span>Protein: ${protein.toFixed(1)}g</div>
    `;

    // 更新 Chart.js 圓形圖
    if (chartInstance) {
      chartInstance.destroy();
    }
    const ctx = document.getElementById('nutrition-chart').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Fat', 'Carbohydrate', 'Protein'],
        datasets: [{
          data: [fat, carb, protein],
          backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}g`;
              }
            }
          }
        }
      }
    });
  }

  // 顯示主內容
  function showMainContent() {
    mainContent.style.display = 'block';
    banner.style.display = 'flex';
    foodDetails.style.display = 'none';
    favoritesSection.style.display = 'none';
    favoriteNutrition.style.display = 'none';
    errorMessage.classList.remove('show');
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (currentQuery) {
      searchFoods(currentQuery, currentPage);
    }
  }

  // 返回鍵（詳細頁面）
  backBtn.addEventListener('click', () => {
    showMainContent();
  });

  // 返回鍵（收藏列表）
  favoritesBackBtn.addEventListener('click', () => {
    showMainContent();
  });

  // 顯示收藏列表
  favoriteBtn.addEventListener('click', () => {
    showFavoritesList();
  });

  // 更新分頁
  function updatePagination(page) {
    pageInfo.textContent = `Page ${page + 1} of ${totalPages}`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  // 分頁事件
  prevBtn.addEventListener('click', async () => {
    if (currentPage > 0) {
      currentPage--;
      console.log('Navigating to previous page:', currentPage);
      await searchFoods(currentQuery, currentPage);
    }
  });

  nextBtn.addEventListener('click', async () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      console.log('Navigating to next page:', currentPage);
      await searchFoods(currentQuery, currentPage);
    }
  });

  // 添加/移除收藏
  resultsBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const foodId = e.target.dataset.id;
      const foodName = e.target.dataset.name;
      const foodDescription = e.target.dataset.description;
      favorites.push({ food_id: foodId, food_name: foodName, food_description: foodDescription });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`${foodName} added to favorites`);
      e.target.classList.remove('add-btn');
      e.target.classList.add('remove-btn');
      e.target.textContent = 'Remove';
    } else if (e.target.classList.contains('remove-btn')) {
      const foodId = e.target.dataset.id;
      favorites = favorites.filter(fav => fav.food_id !== foodId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`Food removed from favorites`);
      e.target.classList.remove('remove-btn');
      e.target.classList.add('add-btn');
      e.target.textContent = 'Add';
    }
  });

  // 刪除收藏
  favoritesBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const foodId = e.target.dataset.id;
      favorites = favorites.filter(fav => fav.food_id !== foodId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      showFavoritesList();
    }
  });
});