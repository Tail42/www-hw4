const express = require('express');
const axios = require('axios');
const config = require('../config/config');

const router = express.Router();

// 取得 Access Token
async function getAccessToken() {
  try {
    console.log('正在請求 Access Token...');
    const response = await axios.post(
      config.fatSecret.tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'basic'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        auth: {
          username: config.fatSecret.clientId,
          password: config.fatSecret.clientSecret
        }
      }
    );
    console.log('Access Token 請求成功:', response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('無法獲取 Access Token:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('無法獲取 Access Token');
  }
}

// 搜尋食物
router.get('/search', async (req, res) => {
  const { query, page = 0, max_results = 20 } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query cannot be empty' });
  }

  try {
    const accessToken = await getAccessToken();
    console.log('正在搜尋食物:', { query, page, max_results });
    const response = await axios.get(config.fatSecret.apiUrl, {
      params: {
        method: 'foods.search',
        format: 'json',
        search_expression: query,
        page_number: page,
        max_results: max_results
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('搜尋成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('搜尋失敗:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    const errorMessage = error.response?.data?.error?.message || error.message;
    res.status(500).json({
      error: 'Search failed',
      details: errorMessage
    });
  }
});

// 取得食物詳細資訊
router.get('/food/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(config.fatSecret.apiUrl, {
      params: {
        method: 'food.get',
        format: 'json',
        food_id: id
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('食物詳情成功:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('獲取食物詳情失敗:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    const errorMessage = error.response?.data?.error?.message || error.message;
    res.status(500).json({
      error: 'Failed to get food details',
      details: errorMessage
    });
  }
});

module.exports = router;