# Handan Idioms • 邯郸成语之都（中英文网站）

一个静态网站（无需后端、无需构建工具），面向欧美受众介绍河北邯郸与成语文化：中英文切换、移动端与PC自适应、成语卡片与小测验。

## 本地预览（推荐）

在 `D:\ai_idot` 目录下运行：

```powershell
node server.mjs
```

然后用浏览器打开：

`http://localhost:5173/`

> 也可以直接双击打开 `index.html`，但部分浏览器对 `import` 模块会限制本地文件访问，因此更建议用本地服务器。

如果 5173 端口被占用，可以临时换端口：

```powershell
$env:PORT=8080
node server.mjs
```

## 主要功能

- 中英文一键切换（自动记忆语言偏好）
- “成语导览”卡片：含义、典故、现代用法、主题标签
- 弹窗详情 + 一键复制
- 朗读按钮（使用浏览器 `SpeechSynthesis`，设备支持时可播放中文）
- 小测验（帮助记忆成语含义）
- 移动端优先的响应式设计

## 内容修改

- 成语内容：`assets/content.js`
- 文案翻译：`assets/i18n.js`
- 样式：`assets/styles.css`
- 交互逻辑：`assets/app.js`

## Supabase Google 登录（服务器端）

本项目已增加基于 Supabase 的 Google 登录（走服务器端回调 + `exchangeCodeForSession` 写入 Cookie）。

### 1) 配置环境变量

复制 `.env.example` 为 `.env`，并填写：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

（可选）如果你线上域名不是通过当前请求自动推断出来的，可以显式设置：

- `SUPABASE_REDIRECT_TO`（例如：`https://your-domain.com/auth/callback`）

### 2) Supabase 控制台设置

- Auth → Providers → 启用 Google，并配置 Client ID / Secret
- Auth → URL Configuration
  - Site URL：你的站点域名（本地可用 `http://localhost:5173`）
  - Redirect URLs：添加 `http://localhost:5173/auth/callback`（以及你的线上回调 URL）

### 3) 使用

- 页面右上角点击“登录”会跳转到 Google 授权
- 登录完成后会回到站点，右上角会显示邮箱，并可“退出”
