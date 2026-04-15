# GitHub Pages 配置指南

## 快速配置步骤

### 1. 访问仓库设置
- 打开浏览器,访问: https://github.com/worldwidejune/overseas-sales-assessment-agent/settings/pages

### 2. 配置 Pages 设置
在 "Build and deployment" 部分:
- **Source**: 选择 "Deploy from a branch"
- **Branch**: 选择 `main`
- **Folder**: 选择 `/ (root)`
- 点击 **Save** 按钮

### 3. 等待部署
- GitHub会自动开始部署(通常需要1-3分钟)
- 页面顶部会显示 "Your site is live at..." 的提示
- 你的网站地址将是: `https://worldwidejune.github.io/overseas-sales-assessment-agent/`

### 4. 访问网站
部署完成后,点击显示的链接即可访问你的海外销售考核Agent!

---

## 更新网站

当你修改了代码后,执行以下命令即可更新网站:

```bash
cd /Users/june/Desktop/workbuddy/海外销售考核
git add .
git commit -m "更新说明"
git push
```

GitHub会自动检测到更新并重新部署(通常1-2分钟后生效)。

---

## 自定义域名(可选)

如果你想使用自己的域名:

1. 在仓库的 Pages 设置中,找到 "Custom domain"
2. 输入你的域名(例如: `sales-assessment.yourdomain.com`)
3. 按照GitHub的提示配置DNS记录

---

## 注意事项

- GitHub Pages 支持静态HTML网站,完美支持你的单页应用
- 所有资源都通过CDN加载,访问速度快
- 完全免费(公开仓库)
- 支持HTTPS加密访问
