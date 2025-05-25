const express = require('express');
const OAuth = require('oauth').OAuth;
const config = require('../config/config');

const router = express.Router();

const oa = new OAuth(
  null, // request token URL (not needed)
  null, // access token URL (not needed)
  config.fatSecret.consumerKey,
  config.fatSecret.consumerSecret,
  '1.0',
  null,
  'HMAC-SHA1'
);

// 搜尋食物
router.get('/search', async (req, res) => {
  const { query, page = 0, max_results = 20 } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query cannot be empty' });
  }

  const url = `${config.fatSecret.apiUrl}?method=foods.search&format=json&search_expression=${encodeURIComponent(query)}&page_number=${page}&max_results=${max_results}`;

  try {
    console.log('正在搜尋食物:', { query, page, max_results });
    oa.get(url, null, null, (err, data) => {
      if (err) {
        console.error('搜尋失敗:', {
          status: err.statusCode,
          data: err.data,
          message: err.message
        });
        return res.status(500).json({
          error: 'Search failed',
          details: err.data || err.message
        });
      }
      console.log('搜尋成功:', data);
      res.json(JSON.parse(data));
    });
  } catch (error) {
    console.error('搜尋失敗:', {
      message: error.message
    });
    res.status(500).json({
      error: 'Search failed',
      details: error.message
    });
  }
});

// 取得食物詳細資訊
router.get('/food/:id', async (req, res) => {
  const { id } = req.params;
  const url = `${config.fatSecret.apiUrl}?method=food.get.v2&format=json&food_id=${id}`;

  try {
    console.log('正在獲取食物詳情:', { id });
    oa.get(url, null, null, (err, data) => {
      if (err) {
        console.error('獲取食物詳情失敗:', {
          status: err.statusCode,
          data: err.data,
          message: err.message
        });
        return res.status(500).json({
          error: 'Failed to get food details',
          details: err.data || err.message
        });
      }
      console.log('食物詳情成功:', data);
      res.json(JSON.parse(data));
    });
  } catch (error) {
    console.error('獲取食物詳情失敗:', {
      message: error.message
    });
    res.status(500).json({
      error: 'Failed to get food details',
      details: error.message
    });
  }
});

module.exports = router;