# 部署说明

站点部署在 GitHub Pages：**https://leverly.github.io/bj-math-site/**

## 当前部署方式

- 仓库：`leverly/bj-math-site`（公开）
- 分支：`main`，根目录
- 类型：Legacy branch build（无 CI，直接发布仓库里的 HTML）
- `.nojekyll` 存在，避免 Jekyll 忽略 `_` 开头的路径

**产物已提交到仓库**，所以推送即部署，无需额外步骤。

## 更新流程

```bash
cd bj-math-site
node build-site.mjs        # 重新生成页面与分片
node tools/validate.mjs    # 校验（必须 0 错误）
git add -A
git commit -m "说明这次改了什么"
git push
```

推送后约 30–60 秒 Pages 自动重建。验证：

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://leverly.github.io/bj-math-site/
```

## 哪些文件进仓库

| 进 | 不进 |
|---|---|
| `src/` 数据源 | `node_modules/`（50 MB） |
| `assets/` 运行时 | `build-report.json`（每次构建都变） |
| `tools/` 渲染器与校验 | `tools/fig-preview.html`（调试产物） |
| 根目录 `*.html`（构建产物） | `.DS_Store` |
| `dist/data/`（分片） | |
| `method/` `map/`（子页面） | |

产物必须提交，因为 Pages 是 legacy branch build，不会自己跑构建。

## 为什么不改成 Actions 构建

三条理由：

1. **Pages 构建环境要装 `mathjax-full`**（约 50 MB 依赖），每次构建多 30–60 秒，且依赖 npm registry 可用。
2. **公式与图形是构建期渲染的**，产物是确定的。源码没变时重建结果完全一样，提交产物没有信息损失。
3. 与英语站（`bj-zk-english-site`）保持一致的部署方式，减少维护面。

如果以后内容量增长到仓库超过 1 GB，再考虑 Actions + 只提交源码。当前仓库约 2 MB。

## 本地预览

直接双击 `index.html` 即可（`file://` 协议下所有功能可用，这是设计约束之一）。

或用本地服务器（更接近线上环境）：

```bash
python3 -m http.server 8152
# 打开 http://127.0.0.1:8152/
```

## 首次部署做了什么（备查）

`gh` CLI 未安装，用 keychain 里的 token 调 GitHub API：

```bash
# 建仓库
curl -X POST -H "Authorization: token $TOKEN" \
  https://api.github.com/user/repos \
  -d '{"name":"bj-math-site","private":false}'

# 开启 Pages
curl -X POST -H "Authorization: token $TOKEN" \
  https://api.github.com/repos/leverly/bj-math-site/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

token 从 macOS keychain 取（`git credential-osxkeychain get`），不在仓库里。

## 常见问题

**推送后线上没变**
Pages 构建有延迟，等 1 分钟再刷。用 `curl` 看 HTTP 头里的 `last-modified` 确认是新版本。浏览器可能缓存了 `assets/*.css?v=hash`——hash 变了 URL 就变，不会读到旧缓存。

**页面 404 但本地正常**
检查文件名大小写。Pages 在 Linux 上跑，文件系统区分大小写；macOS 不区分，本地测不出这类问题。

**公式不显示**
分片里的字形 `<defs>` 没注入。drill/concept 页靠 `loadAll()` 把 `CH[id].defs` 塞进 body，若那段代码被改动要重测。用 `document.querySelectorAll('.math-defs').length` 检查。
