# 企业微信 OAuth 认证 - 部署指南

## 📋 概述

本方案使用企业微信 OAuth 2.0 实现员工身份认证，确保：
- ✅ 员工无法冒用他人账号
- ✅ 自动获取真实身份
- ✅ 支持海外员工
- ✅ 不依赖手机号

---

## 🏗️ 架构说明

```
┌─────────────┐
│  员工浏览器  │
└──────┬──────┘
       │ 1. 点击"企业微信登录"
       ↓
┌──────────────────┐
│  企微授权页面    │  (open.weixin.qq.com)
└──────┬──────────┘
       │ 2. 用户授权
       │ 3. 跳转到后端回调
       ↓
┌──────────────────┐
│   认证后端      │  (auth-server)
│  - 获取用户ID    │
│  - 查询员工数据库  │
│  - 生成认证token  │
└──────┬──────────┘
       │ 4. 重定向到前端（携带token）
       ↓
┌──────────────────┐
│   前端应用      │  (GitHub Pages)
│  - 验证token    │
│  - 显示对应规则   │
└──────────────────┘
```

---

## 🚀 快速开始

### 1. 获取企业微信配置

联系企业微信管理员，获取以下信息：

```
- Corp ID（企业ID）
- Secret（应用密钥）
- Agent ID（应用ID）
```

**获取方式：**
1. 登录企业微信管理后台
2. 进入"应用管理" → "应用"
3. 创建/选择一个"自建应用"
4. 查看应用详情，获取 Corp ID、Secret、Agent ID
5. 配置"授权回调域名"（部署后端后填写）

### 2. 配置后端

进入 `auth-server` 目录：

```bash
cd auth-server

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的配置
vim .env
```

`.env` 文件内容：

```env
WEWORK_CORP_ID=你的企业微信CorpID
WEWORK_SECRET=你的应用Secret
WEWORK_AGENT_ID=你的应用AgentID
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://worldwidejune.github.io/overseas-sales-assessment-agent
BACKEND_URL=https://你的后端域名.com  # 部署后修改
```

### 3. 维护员工数据

编辑 `server.js` 中的 `employeeDatabase` 对象：

```javascript
const employeeDatabase = {
    '张三': { region: 'na', role: 'direct', name: '张三', wecomId: 'zhangsan' },
    'changwu': { region: 'na', role: 'direct', name: 'changwu', wecomId: 'changwu' }
    // 添加更多员工...
};
```

**数据来源：**
- 从企业通讯录导出员工名单
- 从 HR 系统获取地区和角色信息
- 定期更新（建议每周同步）

### 4. 部署后端

#### 选项 A：部署到 Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd auth-server
vercel
```

部署完成后，复制后端 URL（如 `https://your-backend.vercel.app`），更新 `BACKEND_URL`。

#### 选项 B：部署到 Render

```bash
# 在 https://render.com 创建新服务
# 连接 GitHub 仓库
# 选择根目录为 auth-server
# 配置环境变量
# 部署
```

#### 选项 C：部署到腾讯云/阿里云

```bash
# 使用 PM2 部署
npm install -g pm2
pm2 start server.js --name tci-auth

# 配置 Nginx 反向代理
# 设置 SSL 证书
```

### 5. 配置企业微信回调

部署后端后：

1. 登录企业微信管理后台
2. 进入"应用管理" → 选择你的应用 → "开发管理"
3. 在"授权回调域名"中填入后端域名：
   ```
   your-backend-domain.com
   ```
4. 保存配置

**注意：**
- 不需要填写 `https://`
- 不需要填写路径
- 只填写域名即可

### 6. 更新前端 API 地址

编辑 `overseas-sales-assessment-agent.html`，修改 `API_BASE_URL`：

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' // 本地开发
    : 'https://your-backend-domain.com'; // 生产环境（修改为实际域名）
```

同步到 GitHub：

```bash
# 更新 index.html
cp overseas-sales-assessment-agent.html index.html

# 提交
git add .
git commit -m "feat: 集成企业微信 OAuth 认证"
git push
```

---

## 🧪 本地测试

### 启动后端

```bash
cd auth-server
npm start
```

后端运行在：`http://localhost:3000`

### 启动前端

```bash
cd auth-server
node dev-server.js
```

前端运行在：`http://localhost:8080`

### 测试流程

1. 访问 `http://localhost:8080`
2. 点击"企业微信登录"
3. 扫码授权
4. 自动跳转回前端，显示认证信息

**或者使用开发模式：**
1. 输入企微名（如：张三）
2. 点击"验证"
3. 进入系统

---

## 📊 员工数据管理

### 从 Excel 导入

创建一个 Python 脚本 `import_employees.py`：

```python
import pandas as pd
import json

# 读取 Excel
df = pd.read_excel('employees.xlsx')

# 转换为数据库格式
employee_db = {}
for _, row in df.iterrows():
    employee_db[row['企微名']] = {
        'region': row['地区'],
        'role': row['角色'],
        'name': row['姓名'],
        'wecomId': row['企微ID']
    }

# 保存为 JSON
with open('employees.json', 'w', encoding='utf-8') as f:
    json.dump(employee_db, f, ensure_ascii=False, indent=2)

print(f'导入成功，共 {len(employee_db)} 名员工')
```

**Excel 格式示例：**

| 姓名 | 企微名 | 企微ID | 地区 | 角色 |
|------|--------|---------|------|------|
| 张三 | 张三 | zhangsan | na | direct |
| changwu | changwu | changwu | na | direct |

### 定期同步

建议每周同步一次员工数据：

1. HR 导出最新员工名单
2. 运行导入脚本
3. 更新 `server.js` 中的 `employeeDatabase`
4. 重启后端服务

---

## 🔒 安全建议

### 1. 环境变量管理
- ✅ 使用 `.env` 文件（不要提交到 Git）
- ✅ 生产环境使用环境变量（Vercel/Render 配置）
- ❌ 不要在前端代码中硬编码密钥

### 2. Token 安全
- ✅ 当前使用 Base64 简单编码（仅适合测试）
- ✅ 生产环境建议使用 JWT
- ✅ Token 有效期设为 24 小时

### 3. HTTPS
- ✅ 后端必须使用 HTTPS
- ✅ 企业微信回调需要 HTTPS
- ✅ 证书可使用 Let's Encrypt 免费申请

### 4. 日志记录
```javascript
// 添加日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
```

### 5. 限流
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每IP 100次请求
});

app.use('/api/', limiter);
```

---

## 🐛 常见问题

### 1. 授权后跳转失败

**原因：** 回调域名未配置或配置错误

**解决：**
- 检查企业微信后台的"授权回调域名"
- 确保只填写域名，不包含协议和路径
- 确保后端已启动

### 2. "您的账号不在员工数据库中"

**原因：** 员工未添加到 `employeeDatabase`

**解决：**
- 检查 `server.js` 中的员工数据
- 确认企微 ID 格式正确
- 联系 HR 确认员工信息

### 3. Access token 获取失败

**原因：** Corp ID 或 Secret 配置错误

**解决：**
- 检查 `.env` 文件配置
- 确认应用在企业微信后台已启用
- 检查 IP 白名单（如有）

### 4. 前端无法调用后端 API

**原因：** CORS 跨域问题

**解决：**
- 后端已添加 `cors` 中间件
- 确保前端 `API_BASE_URL` 配置正确
- 检查浏览器控制台的 CORS 错误

---

## 📞 技术支持

如有问题，请联系：
- 开发支持：bubu AI Assistant
- 企业微信技术支持：https://work.weixin.qq.com/help

---

## 📅 更新日志

### 2026-04-17
- ✅ 实现企业微信 OAuth 2.0 认证
- ✅ 搭建后端认证服务
- ✅ 前端集成 OAuth 登录
- ✅ 提供开发模式（企微名验证）
- ✅ 支持海外员工
