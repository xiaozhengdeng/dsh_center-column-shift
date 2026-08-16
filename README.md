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
