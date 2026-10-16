# 个人主页

基于 Vue 3、Pinia、Vite 的个人主页，支持站点链接、天气、可选音乐播放器及离线 PWA。

## 本地开发

使用 Node.js 22 或更高版本、pnpm 10.11.0。

```sh
corepack enable
corepack prepare pnpm@10.11.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

默认地址为 `http://127.0.0.1:3000`。默认站点配置来自 `.env.example`，无需额外文件即可构建。
需要覆盖配置时，复制 `.env.example` 为 `.env.local`，只填写要修改的值。`.env`、`.env.local` 不提交到 Git。
部署平台设置的同名 `VITE_*` 变量优先。

```sh
pnpm lint          # 只检查，不改写文件
pnpm lint:fix      # 自动修复可修复的检查项
pnpm test          # 日期、接口、天气代理和工具函数回归测试
pnpm build         # 校验配置、构建、检查首屏与离线资源
pnpm preview
pnpm check         # 完整检查，CI 使用同一命令
```

## 配置

- `src/assets/siteLinks.json`：站点入口；空链接自动隐藏。
- `src/assets/socialLinks.json`：社交入口；空链接自动隐藏。
- `.env.example`：公开站点默认信息、图标、建站日期及音乐设置。这里的值会进入浏览器，不能放密钥。
- 图标使用 `/images/icon/...`；建站日期使用 `YYYY-MM-DD` 或 `YYYY`。
- 音乐需同时配置 HTTPS `VITE_SONG_API` 和 `VITE_SONG_ID`；同时留空时关闭音乐，不加载播放器代码。
- 可通过音乐面板打开歌单。加载失败时支持重试；保存的音量为零时保持静音。
- 设置与音乐弹窗支持 Escape 关闭和键盘焦点限制。界面尊重系统的减少动画设置。

## EdgeOne 天气代理

`edge-functions/api/weather.js` 提供 `GET /api/weather`，Key 仅保留在函数运行环境。
在 EdgeOne 项目的**服务端运行时环境变量**中配置：

| 变量           | 说明                                                           |
| -------------- | -------------------------------------------------------------- |
| `WEATHER_KEY`  | 高德 Web 服务 Key；不要使用 `VITE_` 前缀                       |
| `WEATHER_CITY` | 可选的六位城市行政区划代码；不设置时使用 `context.request.eo.clientIp` 查询访客城市 |

删除旧的 `VITE_WEATHER_KEY` 部署变量；构建会拒绝把它编译进客户端。
如果旧 Key 曾提交到仓库，应在高德控制台撤销并重新生成。删除当前文件不会删除 Git 历史中的旧值。

函数未部署、Key 未配置或主接口失败时，浏览器自动尝试备用天气服务；全部失败仅显示“天气暂不可用”，不阻塞页面。
普通 `pnpm dev` 只启动 Vite，函数路由会使用此回退；本地代理逻辑由单元测试验证。
部署后可检查 `/api/weather`：已配置时返回精简天气 JSON；未配置时返回 503，响应不包含密钥或上游 URL。
若返回 `Visitor location is unavailable`，表示平台未提供访客 IP，可配置 `WEATHER_CITY` 指定城市（如上海 `310000`）；函数不会根据边缘节点出口 IP 或客户端传入的 IP 请求头推断位置。

`edgeone.json` 使用固定 pnpm 版本和锁文件安装，Node.js 22 构建，输出目录为 `dist`。
GitHub Actions 在推送和 PR 时运行配置校验、ESLint、回归测试及构建检查。

## 离线与性能

首页立即显示，壁纸独立加载，失败或超时回退到本地默认图；纯色底始终可用。
PWA 预缓存默认壁纸、字体和图标。设置和音乐代码使用异步分包；构建检查防止它们重新进入首屏预加载。
天气响应使用 `private, no-store`，不通过 Service Worker 缓存访客天气数据。

保留原作者 imsyy 的版权与来源信息。
