import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { act, createElement, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

// Real GSAP timelines and React lifecycles; synthetic layout is deliberately
// limited to testing state/cleanup. This does not replace browser visual QA.
let dom, server, Showcase, Layout, Home, Modalidades, gsap, ScrollTrigger
let width = 1280, height = 900, reduce = false
const mediaLists = new Map()

before(async () => {
  dom = new JSDOM('<style></style><div id="root"></div>', { url: 'http://localhost/', pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.Node = window.Node
  globalThis.HTMLElement = window.HTMLElement
  globalThis.getComputedStyle = window.getComputedStyle.bind(window)
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  window.IntersectionObserver = class {}
  Object.defineProperty(window, 'innerWidth', { get: () => width })
  Object.defineProperty(window, 'innerHeight', { get: () => height })
  Object.defineProperty(document.documentElement, 'clientHeight', { get: () => height })
  Object.defineProperty(document.documentElement, 'clientWidth', { get: () => width })
  Object.defineProperty(document.documentElement, 'scrollHeight', { get: () => 6000 })
  window.scrollTo = (x, y) => {
    window.pageXOffset = typeof x === 'object' ? x.left || 0 : x || 0
    window.pageYOffset = typeof x === 'object' ? x.top || 0 : y || 0
  }
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const h = this.classList.contains('site-header') ? 79 : 700
    return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: h, width, height: h }
  }
  window.matchMedia = (query) => {
    if (!mediaLists.has(query)) {
      const list = new window.EventTarget()
      Object.defineProperty(list, 'matches', { get: () => {
        if (query.includes('prefers-reduced-motion')) return reduce
        if (query.includes('min-width: 1024px')) return width >= 1024 && height >= 720
        return query === 'all'
      } })
      mediaLists.set(query, list)
    }
    return mediaLists.get(query)
  }
  const css = await readFile(new URL('../src/viva.css', import.meta.url), 'utf8')
  document.querySelector('style').textContent = css.replace(/^@import.*$/gm, '')
  server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
  Showcase = (await server.ssrLoadModule('/src/components/MovementShowcase.jsx')).default
  Layout = (await server.ssrLoadModule('/src/components/SiteLayout.jsx')).default
  Home = (await server.ssrLoadModule('/src/pages/Home.jsx')).default
  Modalidades = (await server.ssrLoadModule('/src/pages/Modalidades.jsx')).default
  gsap = (await import('gsap')).gsap
  ScrollTrigger = gsap.core.globals().ScrollTrigger
})

after(async () => {
  ScrollTrigger?.disable()
  gsap?.ticker.sleep()
  await server?.close()
  dom?.window.close()
})

async function mount(t, withLayout = false, page = createElement(Showcase)) {
  const root = createRoot(document.getElementById('root'))
  const content = withLayout ? createElement(Layout, null, page) : page
  t.after(async () => {
    await act(async () => root.unmount())
    assert.equal(ScrollTrigger.getAll().length, 0, 'route teardown must remove all triggers')
    assert.equal(document.querySelectorAll('.pin-spacer').length, 0)
  })
  try {
    await act(async () => root.render(createElement(StrictMode, null, createElement(MemoryRouter, null, content))))
  } catch (error) {
    for (const cause of error.errors || [error]) t.diagnostic(cause.stack)
    throw error
  }
  return root
}

async function preferences(next) {
  // GSAP coalesces media-query events received within the same 2 ms window.
  await new Promise((resolve) => setTimeout(resolve, 5))
  width = next.width ?? width
  height = next.height ?? height
  reduce = next.reduce ?? reduce
  await act(async () => {
    mediaLists.forEach((list) => list.dispatchEvent(new window.Event('change')))
  })
}

test('desktop scenes progress forward and backward with a single accessible scene and persistent CTA', async (t) => {
  width = 1280; height = 900; reduce = false
  await mount(t, true)
  const scenes = [...document.querySelectorAll('.movement-scene')]
  const trigger = ScrollTrigger.getAll().find((item) => item.pin)
  assert.ok(trigger, 'desktop must initialize pinning')
  assert.equal(document.querySelectorAll('.pin-spacer').length, 1, 'StrictMode must not duplicate pin wrappers')
  const link = document.querySelector('.movement-footer a')
  for (const [progress, expected] of [[0, 0], [0.5, 1], [1, 2], [0.5, 1], [0, 0]]) {
    await act(async () => { trigger.animation.progress(progress) })
    assert.equal(document.querySelector('.movement-current').textContent, `0${expected + 1}`)
    scenes.forEach((scene, index) => {
      assert.equal(scene.getAttribute('aria-hidden'), String(index !== expected))
      assert.equal(scene.inert, index !== expected)
    })
    assert.equal(document.querySelector('.movement-footer a'), link)
    assert.equal(link.closest('[inert], [aria-hidden="true"]'), null)
    assert.equal(link.getAttribute('href'), '/modalidades')
    if (progress === 1) assert.equal(document.querySelector('.movement-stage').style.backgroundColor, 'rgb(168, 217, 191)')
  }
})

test('resize, short screens and live reduced-motion preference restore all scenes and remove pinning', async (t) => {
  width = 1280; height = 900; reduce = false
  await mount(t)
  const assertStacked = () => {
    assert.equal(document.querySelectorAll('.pin-spacer').length, 0)
    for (const scene of document.querySelectorAll('.movement-scene')) {
      assert.equal(scene.hasAttribute('aria-hidden'), false)
      assert.equal(scene.inert, false)
      assert.notEqual(scene.style.visibility, 'hidden')
      assert.notEqual(scene.style.opacity, '0')
    }
  }
  await preferences({ width: 390 })
  assertStacked()
  await preferences({ width: 1280, height: 700 })
  assertStacked()
  await preferences({ height: 900 })
  assert.equal(document.querySelectorAll('.pin-spacer').length, 1)
  await preferences({ reduce: true })
  assertStacked()
  for (const element of document.querySelectorAll('.movement-scene__photo, .movement-scene__copy')) {
    assert.notEqual(element.style.opacity, '0')
    assert.notEqual(element.style.clipPath, 'inset(0 0 100% 0)')
  }
  assert.equal(ScrollTrigger.getAll().length, 0)
  await preferences({ reduce: false })
  assert.equal(document.querySelectorAll('.pin-spacer').length, 1)
})

test('reduced motion on initial load keeps every modality readable without scroll effects', async (t) => {
  width = 1280; height = 900; reduce = true
  await mount(t, true)
  assert.equal(ScrollTrigger.getAll().length, 0)
  assert.deepEqual([...document.querySelectorAll('.movement-scene h3')].map((el) => el.textContent), ['Musculação', 'Funcional', 'Ritmos'])
  assert.equal(document.querySelectorAll('.movement-scene[aria-hidden="true"], .pin-spacer').length, 0)
})

test('full home supports focused cards and route round trips without stale animation wrappers', async (t) => {
  width = 1280; height = 900; reduce = false
  const routes = createElement(Routes, null,
    createElement(Route, { path: '/', element: createElement(Home) }),
    createElement(Route, { path: '/modalidades', element: createElement(Modalidades) }),
  )
  await mount(t, true, routes)
  const initialTriggers = ScrollTrigger.getAll().length
  const button = document.querySelector('.plan-card a')
  await act(async () => button.focus())
  assert.equal(window.getComputedStyle(button.closest('.plan-card')).opacity, '1')
  await act(async () => document.querySelector('.movement-footer a').click())
  assert.equal(document.querySelector('.movement-showcase'), null)
  assert.equal(document.querySelectorAll('.pin-spacer').length, 0)
  assert.ok(document.querySelector('.modality-row'))
  await act(async () => document.querySelector('.brand').click())
  assert.equal(document.querySelectorAll('.pin-spacer').length, 1)
  assert.equal(ScrollTrigger.getAll().length, initialTriggers)
  assert.ok(document.querySelector('.hero-control--play'))
})
