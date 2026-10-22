import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { act, createElement } from 'react'
import { createServer } from 'vite'

let server, Widget, createRoot
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/', pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true

before(async () => {
  // React's event handling must be initialized with a DOM for input events.
  ;({ createRoot } = await import('react-dom/client'))
  server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
  Widget = (await server.ssrLoadModule('/src/components/MessagingWidget.jsx')).default
})
after(async () => {
  await server?.close()
  dom.window.close()
})

async function mount(t) {
  const network = t.mock.fn(() => { throw new Error('Backend unavailable') })
  t.mock.method(globalThis, 'fetch', network)
  const open = t.mock.method(window, 'open', () => null)
  const root = createRoot(document.getElementById('root'))
  await act(async () => root.render(createElement(Widget)))
  t.after(async () => {
    await act(async () => root.unmount())
    assert.equal(network.mock.callCount(), 0, 'WhatsApp widget must not contact the backend')
  })
  const toggle = document.querySelector('.message-widget__toggle')
  await act(async () => toggle.click())
  const input = document.querySelector('textarea')
  const submit = document.querySelector('[type="submit"]')
  return {
    input, submit, toggle, open,
    fill: (value) => act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(input, value)
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    }),
    key: async (options = {}) => {
      const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...options })
      await act(async () => input.dispatchEvent(event))
      return event
    },
  }
}

test('opens the correct WhatsApp conversation with encoded text and preserves the draft', async (t) => {
  const view = await mount(t)
  const message = 'Olá! Quero uma aula 💪\nPlanos & horários? 50% + #treino'
  await view.fill(message)
  assert.equal(view.submit.disabled, false)
  await act(async () => view.submit.click())
  assert.equal(view.open.mock.callCount(), 1)
  assert.deepEqual(view.open.mock.calls[0].arguments, [
    `https://wa.me/5511996600240?text=${encodeURIComponent(message)}`,
    '_blank', 'noopener,noreferrer',
  ])
  assert.equal(view.input.value, message)
  assert.equal(document.body.textContent.includes('Mensagem recebida'), false)
  assert.equal(document.querySelector('a[href*="t.me"]'), null)
})

test('rejects whitespace and oversized input, accepts the 2000-character limit', async (t) => {
  const view = await mount(t)
  assert.equal(view.input.maxLength, 2000)
  assert.equal(view.submit.disabled, true)
  await view.fill('   \n  ')
  await view.key()
  assert.equal(view.submit.disabled, true)
  assert.equal(view.open.mock.callCount(), 0)
  await view.fill('a'.repeat(2001))
  await view.key()
  assert.equal(view.submit.disabled, true)
  assert.equal(view.open.mock.callCount(), 0)
  await view.fill('a'.repeat(2000))
  assert.equal(view.submit.disabled, false)
  await view.key()
  assert.equal(view.open.mock.callCount(), 1)
})

test('Enter continues, Shift+Enter and IME composition do not submit', async (t) => {
  const view = await mount(t)
  await view.fill('Quero conhecer a academia')
  assert.equal((await view.key({ shiftKey: true })).defaultPrevented, false)
  assert.equal((await view.key({ isComposing: true })).defaultPrevented, false)
  await view.key({ repeat: true })
  assert.equal(view.open.mock.callCount(), 0)
  assert.equal((await view.key()).defaultPrevented, true)
  assert.equal(view.open.mock.callCount(), 1)
})

test('closing and reopening preserves text and restores keyboard focus', async (t) => {
  const view = await mount(t)
  assert.equal(document.activeElement, view.input)
  await view.fill('Minha mensagem ainda não enviada')
  await view.key({ key: 'Escape' })
  assert.equal(document.activeElement, view.toggle)
  assert.equal(document.querySelector('#message-widget-panel').getAttribute('aria-hidden'), 'true')
  assert.equal(document.querySelector('#message-widget-panel').hasAttribute('inert'), true)
  await act(async () => view.toggle.click())
  assert.equal(document.activeElement, view.input)
  assert.equal(view.input.value, 'Minha mensagem ainda não enviada')
  assert.equal(view.open.mock.callCount(), 0)
})
