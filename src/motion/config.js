// Brand motion: one place to tune a client edition of the site.
export const motion = {
  ease: 'power3.out',
  entrance: 0.9,
  reveal: 0.75,
  stagger: 0.12,
  distance: 32,
  parallax: 42,
  scrollLerp: 0.08,
  scrub: 0.3,
  desktop: '(min-width: 1024px) and (min-height: 720px)',
  reduced: '(prefers-reduced-motion: reduce)',
}

// CSS variables keep slide accents, printed surfaces and scene colors in sync.
export const sceneAccentTokens = ['--lime', '--peach', '--mint']
export const sceneAccents = sceneAccentTokens.map((token) => `var(${token})`)
