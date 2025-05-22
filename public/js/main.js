document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const errorMessage = document.getElementById('error-message');
  const resultsSection = document.getElementById('results-section');
  const resultsBody = document.getElementById('results-body');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const loading = document.getElementById('loading');

  let currentPage = 0;
  let totalPages = 1;
  let currentQuery = '';
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // 搜尋功能
  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
      errorMessage.style.display = 'block';
      return;
    }
    errorMessage.style.display = 'none';
    currentQuery = query;
    currentPage = 0;
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
      // 使用 total_results 計算總頁數
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
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${page * 20 + index + 1}</td>
          <td>${food.food_name}</td>
          <td>${food.food_description}</td>
          <td>
            <button class="add-btn" 
                    data-id="${food.food_id}" 
                    data-name="${food.food_name}" 
                    data-description="${food.food_description}">
              Add
            </button>
          </td>
        `;
        resultsBody.appendChild(row);
      });
    } else {
      resultsBody.innerHTML = '<tr><td colspan="4">No search results</td></tr>';
    }
    resultsSection.style.display = 'block';
  }

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

  // 添加到收藏
  resultsBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const foodId = e.target.dataset.id;
      const foodName = e.target.dataset.name;
      const foodDescription = e.target.dataset.description;
      favorites.push({ food_id: foodId, food_name: foodName, food_description: foodDescription });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`${foodName} added to favorites`);
    }
  });
});