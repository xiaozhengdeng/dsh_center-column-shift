<p align="center">
  <a href="#english">English</a> | <a href="#chinese">中文</a>
</p>

<a id="english"></a>

# dsh_center-column-shift

**Center Column Shift** — a browser (client) plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) that lets you shift the whole conversation column left/right with a draggable handle.

## What it does

DeepSeek Harness renders a three-column frame: `sidebar | conversation | details`. This plugin adds a small floating handle (`⇔ 移动内容`) into the frame-wide `shell.overlay` layer, vertically aligned with the "Full access" chip. Dragging it applies a `translateX()` transform to the entire conversation column — session content **and** the input composer move together — so you can slide the chat left to free up space on the right (e.g. to park another panel or compare content side by side).

- **Drag** the handle to shift the column horizontally (left shift only, clamped to `min(1000px, 50% of frame width)`).
- **Double-click** the handle or press **↺** to reset to the original position.
- The offset **survives session switches**: the plugin re-locates the scroll body live (via `MutationObserver` + `ResizeObserver`) and replays the current offset whenever the conversation nodes are rebuilt.

## Install

```powershell
# build (from the repo root; requires the DSH checkout's toolchain, see below)
pnpm build

# install into a profile (bundle layer)
dsh plugin --profile <name> add file:G:/deepseek/plugins/dsh_center-column-shift
```

The package declares itself as a `dsh.client` plugin (`platform: web`) **and** ships a `dsh.bundle` patch row, so `dsh plugin add` promotes it to a profile bundle layer; `dsh-client-modules` then scans the `dsh.client` declaration and loads the browser half into the web boot manifest automatically. No host-side behavior is provided — the whole feature is client-side.

> Note: the package name uses an underscore (`dsh_center-column-shift`); the client-bundle module id must equal the package name, so it stays in sync automatically (read from `package.json` at build time).

## Usage

After installation and a page refresh, the handle appears vertically centered on the right edge of the conversation column (or above the composer when the access chip is not found). Drag it; release to settle with a smooth transition.

## Development

```powershell
# node half (thin stub) + client half + browser closure bundle
pnpm build

# or step by step, using the DSH checkout toolchain:
$tsc    = "G:\deepseek\deepseek-harness\node_modules\typescript\bin\tsc"
$tsdown = "G:\deepseek\deepseek-harness\node_modules\tsdown\dist\run.mjs"
node $tsc -p tsconfig.json          # node half -> lib/
node $tsc -p tsconfig.client.json   # client half -> lib/client/
node $tsdown                        # closure bundle -> lib/client.js
```

The client bundle follows the harness `clientBundle` protocol (`window.__ModuleLoader__.load`); `react`, `@deepseek-ai/cordis` and `@deepseek-ai/dsh-client-runtime` stay external and resolve from the loader module table at runtime.

## License

MIT

---

<a id="chinese"></a>

# dsh_center-column-shift

**Center Column Shift** — [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的浏览器端(client)插件:通过一个可拖动把手,让整个会话列左右平移。

## 功能简介

DeepSeek Harness 的界面是 `侧栏 | 会话 | 详情` 三列布局。本插件在全局浮层 `shell.overlay` 上添加一个悬浮把手(`⇔ 移动内容`),与「Full access」芯片垂直对齐。拖动把手会对整个会话列应用 `translateX()` 变换——会话内容**和**输入框一起整体左右平移,方便给右侧腾出空间(例如并排摆放其他面板或对照内容)。

- **拖动**把手,会话列整体左右平移(只允许左移,上限 `min(1000px, 50% 帧宽)`)。
- **双击**把手或点击 **↺** 复位到原位。
- 偏移量**在切换会话后自动保持**:插件通过 `MutationObserver` + `ResizeObserver` 实时重定位滚动容器,会话节点重建后自动重放当前偏移。

## 安装

```powershell
# 构建(在仓库根目录;需要 DSH checkout 的工具链,见下文)
pnpm build

# 安装到某个 profile(bundle 层)
dsh plugin --profile <名字> add file:G:/deepseek/plugins/dsh_center-column-shift
```

本包同时声明为 `dsh.client` 插件(`platform: web`)**并**附带 `dsh.bundle` patch 行,因此 `dsh plugin add` 会把它提升为 profile 的 bundle 层;`dsh-client-modules` 会扫描 `dsh.client` 声明并自动把浏览器半加载进 Web 启动清单。本插件不提供任何宿主侧行为,整个功能都在浏览器端。

> 说明:包名带下划线(`dsh_center-column-shift`);client bundle 的模块 id 必须等于包名,构建时从 `package.json` 自动读取,始终保持同步。

## 使用方法

安装并刷新页面后,把手会出现在会话列右侧垂直居中的位置(找不到访问模式芯片时则显示在输入框上方)。拖动把手,松开后平滑归位。

## 开发

```powershell
# node 半(stub)+ client 半 + 浏览器 closure bundle
pnpm build

# 或使用 DSH checkout 工具链分步执行:
$tsc    = "G:\deepseek\deepseek-harness\node_modules\typescript\bin\tsc"
$tsdown = "G:\deepseek\deepseek-harness\node_modules\tsdown\dist\run.mjs"
node $tsc -p tsconfig.json          # node 半 -> lib/
node $tsc -p tsconfig.client.json   # client 半 -> lib/client/
node $tsdown                        # closure bundle -> lib/client.js
```

client bundle 遵循 harness 的 `clientBundle` 协议(`window.__ModuleLoader__.load`);`react`、`@deepseek-ai/cordis` 和 `@deepseek-ai/dsh-client-runtime` 保持 external,运行时从 loader 模块表解析。

## 许可证

MIT
