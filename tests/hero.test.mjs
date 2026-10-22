import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, Home
before(async () => {
  server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
  Home = (await server.ssrLoadModule('/src/pages/Home.jsx')).default
})
after(async () => server?.close())

async function mount(t, reducedMotion = false) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/', pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const preference = new dom.window.EventTarget()
  preference.matches = reducedMotion
  window.matchMedia = () => preference
  t.mock.timers.enable({ apis: ['setInterval', 'setTimeout'] })
  window.setInterval = globalThis.setInterval
  window.clearInterval = globalThis.clearInterval
  window.setTimeout = globalThis.setTimeout
  window.clearTimeout = globalThis.clearTimeout
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(createElement(MemoryRouter, null, createElement(Home))))
  t.after(async () => {
    await act(async () => root.unmount())
    dom.window.close()
    t.mock.timers.reset()
  })
  return {
    index: () => document.querySelector('.hero-index').textContent,
    tick: () => act(async () => t.mock.timers.tick(5500)),
    click: (label) => act(async () => document.querySelector(`[aria-label="${label}"]`).click()),
    preference,
  }
}

test('autoplay advances and wraps around while the pointer rests on the banner', async (t) => {
  const view = await mount(t)
  await act(async () => document.querySelector('.home-hero').dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })))
  await view.tick()
  assert.equal(view.index(), '02 / 03')
  await view.tick()
  assert.equal(view.index(), '03 / 03')
  await view.tick()
  assert.equal(view.index(), '01 / 03')
})

test('pause and resume work even when resume keeps keyboard focus', async (t) => {
  const view = await mount(t)
  await view.click('Pausar rotação automática')
  await view.tick()
  assert.equal(view.index(), '01 / 03')
  await act(async () => document.querySelector('.hero-control--play').focus())
  await view.click('Retomar rotação automática')
  await view.tick()
  assert.equal(view.index(), '02 / 03')
})

test('reduced motion keeps slideshow working with usable pause and manual controls', async (t) => {
  const view = await mount(t, true)
  await view.tick()
  assert.equal(view.index(), '02 / 03')
  await view.click('Pausar rotação automática')
  await view.tick()
  assert.equal(view.index(), '02 / 03')
  await view.click('Retomar rotação automática')
  await view.tick()
  assert.equal(view.index(), '03 / 03')
  await view.click('Próximo slide')
  assert.equal(view.index(), '01 / 03')
  await view.click('Slide anterior')
  assert.equal(view.index(), '03 / 03')
  await view.click('Próximo slide')
  assert.equal(view.index(), '01 / 03')
  await view.click('Mostrar destaque: Funcional')
  assert.equal(view.index(), '02 / 03')
  await act(async () => {
    view.preference.matches = false
    view.preference.dispatchEvent(new window.Event('change'))
  })
  await view.tick()
  assert.equal(view.index(), '03 / 03')
})

test('autoplay pauses in a hidden tab and resumes when visible without replacing the CTA', async (t) => {
  const view = await mount(t)
  const cta = document.querySelector('.hero-actions .button')
  await act(async () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new window.Event('visibilitychange'))
  })
  await view.tick()
  assert.equal(view.index(), '01 / 03')
  await act(async () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new window.Event('visibilitychange'))
  })
  await view.tick()
  assert.equal(view.index(), '02 / 03')
  assert.equal(document.querySelector('.hero-actions .button'), cta)
})
