/**
 * Center Column Shift — browser half.
 *
 * Registers a draggable handle into `shell.overlay`. Dragging it shifts the
 * whole conversation column (session content + input) left/right with a CSS
 * transform, so other panels can sit beside the chat; double-click or ↺ resets.
 * The target column and its scroll body are re-located live, so the offset
 * survives session switches (the DOM nodes are rebuilt on switch).
 *
 * This is a faithful port of the dynamic Cordis plugin authored in the
 * "deepseek harness布局偏移调整" session; `styles.insert` is replaced with an
 * explicit `<style>` tag owned by this package (the browser half of a shipped
 * plugin has no `styles` symbol).
 *
 * @package dsh_center-column-shift
 */

import * as React from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the shell's SlotMap merge (the 'shell.overlay' entry).
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'

/** Required service: client Slot registry. */
export const inject = ['slots']

const CSS = `
.dsh-center-move-handle {
  position: absolute;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1;
  cursor: grab;
  user-select: none;
  touch-action: none;
  white-space: nowrap;
  background: var(--dsw-alias-bg-overlay);
  border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  opacity: 0.7;
  transition: opacity 150ms ease, background 150ms ease;
  pointer-events: auto;
}
.dsh-center-move-handle:hover {
  opacity: 1;
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-center-move-handle[data-dragging='true'] {
  cursor: grabbing;
  opacity: 1;
}
.dsh-center-move-handle .handle-label {
  font-weight: 600;
}
.dsh-center-move-handle .handle-value {
  font-variant-numeric: tabular-nums;
  min-width: 30px;
  text-align: center;
  color: var(--dsw-alias-label-secondary);
}
.dsh-center-move-handle .reset-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  padding: 0 3px;
  border-radius: 6px;
  line-height: 1;
}
.dsh-center-move-handle .reset-btn:hover {
  color: var(--dsw-alias-brand-primary);
}
`

/** The draggable handle: shifts the conversation column via translateX. */
function CenterMoveHandle(): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const scrollRef = React.useRef<HTMLElement | null>(null)
  const frameRef = React.useRef<HTMLElement | null>(null)
  const centerRef = React.useRef<HTMLElement | null>(null)
  const maxRef = React.useRef(600)
  const dragRef = React.useRef({ startX: 0, base: 0, latest: 0 })
  const [shift, setShift] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)

  // Locate the scroll body live (switching sessions rebuilds the nodes, so the
  // target must be re-found every time).
  const findScroll = React.useCallback((): HTMLElement | null => {
    const center = centerRef.current
    if (center === null) return null
    return center.querySelector('[data-conversation-scroll]')
  }, [])

  const findAccessChip = React.useCallback((): HTMLElement | null => {
    const center = centerRef.current
    if (center === null) return null
    const byLabel = center.querySelector<HTMLElement>(
      '[aria-label*="访问模式"], [aria-label*="access mode"], [aria-label*="Access mode"]',
    )
    if (byLabel !== null) return byLabel
    const buttons = center.querySelectorAll('button')
    for (let i = 0; i < buttons.length; i += 1) {
      const text = buttons[i]?.textContent
      if (text !== null && text !== undefined && text.indexOf('Full access') !== -1) return buttons[i]
    }
    return null
  }, [])

  const applyTransform = React.useCallback((el: HTMLElement, px: number, smooth: boolean): void => {
    el.style.transition = smooth ? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
    el.style.transform = `translateX(${px}px)`
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const overlay = root.closest('[data-shell-overlay]')
    if (overlay === null) {
      console.error('center-move: overlay layer not found')
      return
    }
    const frame = overlay.parentElement
    // Frame children: [sidebarCol, centerCol, detailsCol, overlayLayer]
    const center = overlay.previousElementSibling !== null ? overlay.previousElementSibling.previousElementSibling : null
    if (frame === null || center === null) {
      console.error('center-move: center column not found')
      return
    }
    centerRef.current = center as HTMLElement
    frameRef.current = frame as HTMLElement
    const w = frame.getBoundingClientRect().width
    maxRef.current = Math.max(200, Math.min(1000, w * 0.5))
    scrollRef.current = center.querySelector('[data-conversation-scroll]')

    const position = (): void => {
      const rootEl = rootRef.current
      const frameEl = frameRef.current
      if (rootEl === null || frameEl === null) return
      const f = frameEl.getBoundingClientRect()
      const chip = findAccessChip()
      rootEl.style.left = '50%'
      if (chip !== null) {
        const c = chip.getBoundingClientRect()
        rootEl.style.top = `${c.top - f.top + c.height / 2}px`
      } else {
        rootEl.style.top = `${f.height - 96}px`
      }
      rootEl.style.transform = 'translate(-50%, -50%)'
    }
    position()

    // When the center column content is rebuilt (session/view switch):
    // rebind the target and replay the current offset.
    const sync = (): void => {
      const el = findScroll()
      if (el !== null && el !== scrollRef.current) {
        scrollRef.current = el
        const latest = dragRef.current.latest
        if (latest !== 0) applyTransform(el, latest, false)
      }
      position()
    }
    let raf: number | null = null
    const onMutate = (): void => {
      if (raf !== null) return
      raf = requestAnimationFrame(() => {
        raf = null
        sync()
      })
    }
    const ro = new ResizeObserver(onMutate)
    ro.observe(frame as Element)
    ro.observe(center as Element)
    const mo = new MutationObserver(onMutate)
    mo.observe(center, { childList: true, subtree: true })
    return (): void => {
      ro.disconnect()
      mo.disconnect()
      if (raf !== null) cancelAnimationFrame(raf)
      const el = scrollRef.current
      if (el === null) return
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [findScroll, findAccessChip, applyTransform])

  const paint = (px: number, smooth: boolean): void => {
    // Re-confirm the target before every paint (stale after a session switch).
    const el = findScroll() ?? scrollRef.current
    if (el === null) return
    scrollRef.current = el
    applyTransform(el, px, smooth)
    dragRef.current.latest = px
    setShift(px)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    const el = findScroll() ?? scrollRef.current
    if (el === null) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    scrollRef.current = el
    dragRef.current.startX = e.clientX
    dragRef.current.base = dragRef.current.latest
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!dragging) return
    const el = findScroll() ?? scrollRef.current
    if (el === null) return
    const next = Math.max(-maxRef.current, Math.min(0, dragRef.current.base + (e.clientX - dragRef.current.startX)))
    scrollRef.current = el
    applyTransform(el, next, false)
    dragRef.current.latest = next
    setShift(next)
  }
  const onPointerUp = (): void => {
    if (!dragging) return
    setDragging(false)
    paint(dragRef.current.latest, true)
  }

  return React.createElement(
    'div',
    {
      ref: rootRef,
      className: 'dsh-center-move-handle',
      title: '拖动：左右移动输入框与会话内容（左移为右侧腾出空间）；双击或 ↺ 复位',
      'data-dragging': dragging || undefined,
      onPointerDown: onPointerDown,
      onPointerMove: onPointerMove,
      onPointerUp: onPointerUp,
      onDoubleClick: (): void => paint(0, true),
    },
    React.createElement('span', { className: 'handle-label' }, '⇔ 移动内容'),
    React.createElement('span', { className: 'handle-value' }, `${shift}px`),
    React.createElement('button', {
      className: 'reset-btn',
      title: '复位到原位',
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>): void => e.stopPropagation(),
      onClick: (): void => paint(0, true),
    }, '↺'),
  )
}

/** Mount the handle into the frame-wide overlay layer. */
export function apply(ctx: ClientContext): void {
  // Own the stylesheet for the lifetime of this plugin run (replaces the
  // dynamic-plugin `styles.insert` symbol).
  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-plugin', 'dsh_center-column-shift')
  styleEl.textContent = CSS
  document.head.appendChild(styleEl)
  ctx.effect(() => () => { styleEl.remove() }, 'dsh_center-column-shift: styles')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'center-move-handle', order: 90 },
    () => React.createElement(CenterMoveHandle),
  ))
}
