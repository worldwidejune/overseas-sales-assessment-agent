# TCI 海外销售考核 Agent

> 基于企业微信 OAuth 认证的智能问答系统，为海外销售员工提供实时考核规则查询

## ✨ 功能特性

### 🔐 企业微信 OAuth 认证
- ✅ 安全的员工身份验证
- ✅ 支持海外员工（无需手机号）
- ✅ 自动获取真实身份，防止冒用
- ✅ 开发模式支持企微名快速登录

### 💬 智能问答
- 📊 查询考核规则和计算公式
- 📖 解读各类考核指标
- 🌏 根据员工所在地区自动过滤规则
- 🎯 支持 10+ 类考核问题

### 🌏 地区支持
- 🇺🇸 北美地区（季度发放、三段式计算）
- 🌍 非北美地区（年度发放、简单计算）
- 🇨🇳 中国大陆（统一规则）

---

## 🚀 快速开始

### 在线访问

> **GitHub Pages 部署版本：**
> https://worldwidejune.github.io/overseas-sales-assessment-agent/

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/worldwidejune/overseas-sales-assessment-agent.git
cd overseas-sales-assessment-agent

# 安装后端依赖
cd auth-server
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入企业微信配置

# 启动后端
npm start
# 后端运行在 http://localhost:3000

# 启动前端（另一个终端）
cd ..
node auth-server/dev-server.js
# 前端运行在 http://localhost:8080
```

---

## 📋 部署指南

### 完整部署（推荐）

查看详细部署文档：**[OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)**

**快速步骤：**

1. **获取企业微信配置**
   - Corp ID
   - Secret
   - Agent ID

2. **配置后端**
   ```bash
   cd auth-server
   cp .env.example .env
   # 编辑 .env 填入配置
   npm install
   ```

3. **维护员工数据**
   - 编辑 `server.js` 中的 `employeeDatabase`
   - 或使用 Excel 批量导入

4. **部署后端**
   - Vercel（推荐）
   - Render
   - 腾讯云/阿里云

5. **配置回调域名**
   - 在企业微信后台填入后端域名

6. **更新前端**
   - 修改 `API_BASE_URL` 为实际后端地址
   - 同步到 GitHub Pages

### 快速部署（仅前端）

如果没有企业微信认证，可以仅使用开发模式：

```bash
# 修改 index.html，保留企微名验证
# 删除 OAuth 相关代码
# 部署到 GitHub Pages
```

---

## 📁 项目结构

```
海外销售考核/
├── overseas-sales-assessment-agent.html    # 前端主页面
├── index.html                           # GitHub Pages 入口
├── auth-server/                         # 后端认证服务
│   ├── server.js                        # 企业微信 OAuth 认证服务
│   ├── dev-server.js                    # 本地开发服务器
│   ├── package.json                     # 后端依赖
│   └── .env.example                   # 环境变量模板
├── OAUTH_SETUP_GUIDE.md                # 部署指南
└── README.md                           # 项目说明
```

---

## 🎯 使用说明

### 员工登录

1. **企业微信登录（推荐）**
   - 点击"企业微信登录"按钮
   - 扫码授权
   - 自动登录并显示对应地区规则

2. **开发模式登录**
   - 输入企微名
   - 点击"验证"
   - 进入系统（仅用于测试）

### 问答使用

登录后，可以直接提问：

```
"销售考核公式是什么？"
"奖金怎么计算？"
"起付线是多少？"
"试用期考核规则？"
"离职如何结算？"
```

系统会根据员工所在地区自动返回对应规则。

---

## 🔒 安全特性

- ✅ 企业微信 OAuth 2.0 认证
- ✅ 员工数据库白名单
- ✅ Token 有效期限制（24小时）
- ✅ HTTPS 加密传输（生产环境）
- ✅ 请求日志记录

---

## 📊 员工数据管理

### 格式

```javascript
const employeeDatabase = {
    '张三': {
        region: 'na',           // 地区：na（北美）/ non_na（非北美）
        role: 'direct',        // 角色：direct（直客）/ channel（渠道）/ leader（基干）
        name: '张三',          // 姓名
        wecomId: 'zhangsan'    // 企微ID
    }
};
```

### 维护建议

- **同步频率**：每周一次
- **数据来源**：HR 系统导出
- **批量导入**：使用 Python 脚本（见部署指南）

---

## 🛠️ 技术栈

### 前端
- HTML5 + CSS3
- Tailwind CSS（UI 框架）
- 原生 JavaScript（无框架）

### 后端
- Node.js + Express
- 企业微信 OAuth 2.0
- RESTful API

### 部署
- 前端：GitHub Pages
- 后端：Vercel / Render / 云服务器

---

## 📞 技术支持

- **部署问题**：查看 [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
- **使用问题**：联系 HR 或考核负责人
- **开发支持**：提交 Issue

---

## 📄 许可证

内部使用，版权归 TCI 所有。

---

## 🤝 贡献

如有改进建议，欢迎提交 Pull Request。

---

**版本**：v2.0.0
**最后更新**：2026-04-17
