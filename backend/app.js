const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// 中間件
app.use(cors({
    origin: '*', // 允許所有來源，方便測試；可根據需要限制為特定域名
    methods: ['GET', 'POST'], // 限制為作業所需的 HTTP 方法
}));
app.use(express.json()); // 解析 JSON 請求主體
app.use(express.static(path.join(__dirname, '../public'))); // 提供 /public 目錄中的靜態檔案

// 路由
app.use('/api', apiRoutes); // API 路由，處理 FatSecret API 請求

// 處理單頁應用（SPA）的所有其他路由，返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error(err.stack); // 記錄錯誤到控制台
    res.status(500).json({ error: '伺服器內部錯誤，請稍後再試' });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
});