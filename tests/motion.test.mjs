import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

test('reduced-motion styles preserve visible button and image fades', async () => {
  const css = await readFile(new URL('../src/viva.css', import.meta.url), 'utf8')
  const dom = new JSDOM('<style></style><a class="button button--lime">Conheça</a><img class="hero-image hero-image--active">')
  const { document } = dom.window
  // Font loading is unrelated to motion and blocks stylesheet readiness in JSDOM.
  document.querySelector('style').textContent = css.replace(/^@import.*$/gm, '')
  // Apply the actual reduced-motion rules, since JSDOM does not evaluate media queries.
  const reducedRules = [...document.styleSheets[0].cssRules]
    .filter((rule) => rule.conditionText === '(prefers-reduced-motion: reduce)')
    .flatMap((rule) => [...rule.cssRules].map((child) => {
      // JSDOM drops entire selector lists containing pseudo-elements.
      // Keep the element selectors; pseudo-elements are outside this test.
      const selectors = child.selectorText.split(',').filter((selector) => !selector.includes('::'))
      return selectors.length ? `${selectors.join(',')} { ${child.style.cssText} }` : ''
    }))
  const reducedStyle = document.createElement('style')
  reducedStyle.textContent = reducedRules.join('\n')
  document.head.append(reducedStyle)
  for (const selector of ['.button', '.hero-image']) {
    const style = dom.window.getComputedStyle(document.querySelector(selector))
    const duration = style.transitionDuration.split(',')[0].trim()
    const seconds = parseFloat(duration) / (duration.endsWith('ms') ? 1000 : 1)
    assert.ok(seconds >= .2, `${selector} needs a visible fade; got ${duration}`)
  }
  dom.window.close()
})
