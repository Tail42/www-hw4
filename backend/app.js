const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// 中間件
app.use(cors({
    origin: 'http://wwweb2025.csie.io:50519', // 限制為您的域名
    methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // 提供 /public 目錄

// 路由
app.use('/hw4/api', apiRoutes); // API 路由前綴為 /hw4/api
app.get('/hw4/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html')); // 所有 /hw4/* 請求返回 index.html
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '伺服器內部錯誤' });
});

// 啟動伺服器
const PORT = process.env.PORT || 50519; // 使用端口 50519
app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
});