const express = require('express');
const path = require('path');

const app = express();

// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`本地开发服务器运行在 http://localhost:${PORT}`);
});
