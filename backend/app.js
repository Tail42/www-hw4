const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// 中間件
app.use(cors({
    origin: 'http://wwweb2025.csie.io:50519',
    methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use('/hw4', express.static(path.join(__dirname, '../public'))); // 靜態檔案路徑以 /hw4 為前綴

// 路由
app.use('/hw4/api', apiRoutes); // API 路由以 /hw4/api 為前綴
app.get('/hw4/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '伺服器內部錯誤' });
});

// 啟動伺服器，監聽 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`伺服器運行在 http://0.0.0.0:${PORT}`);
});