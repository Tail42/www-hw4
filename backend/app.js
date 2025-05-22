const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 提供靜態檔案

// 路由
app.use('/api', apiRoutes);

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
});