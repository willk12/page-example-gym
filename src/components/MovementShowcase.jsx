import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import { classes } from '../data/content.js'
import { Eyebrow, TextLink } from './SharedSections.jsx'
import { motion, sceneAccents, sceneAccentTokens } from '../motion/config.js'

gsap.registerPlugin(useGSAP, ScrollTrigger)
const movements = classes.slice(0, 3)

export default function MovementShowcase() {
  const scope = useRef(null)

  useGSAP(() => {
    if (!('IntersectionObserver' in window)) return
    const root = scope.current
    const select = gsap.utils.selector(root)
    const scenes = select('.movement-scene')
    const media = gsap.matchMedia()
    media.add({ desktop: motion.desktop, reduce: motion.reduced, all: 'all' }, ({ conditions }) => {
      if (conditions.reduce) return
      if (!conditions.desktop) {
        scenes.forEach((scene) => {
          gsap.from(scene.querySelectorAll('.movement-scene__photo, .movement-scene__copy'), {
            y: 20, opacity: 0, duration: motion.reveal, stagger: motion.stagger, ease: motion.ease,
            scrollTrigger: { trigger: scene, start: 'top 90%', once: true },
          })
        })
        return
      }

      const stage = select('.movement-stage')[0]
      const progress = select('.movement-progress__fill')[0]
      const steps = select('.movement-step')
      const number = select('.movement-current')[0]
      const theme = getComputedStyle(document.documentElement)
      const colors = sceneAccentTokens.map((token) => theme.getPropertyValue(token).trim())
      root.classList.add('movement-showcase--pinned')
      gsap.set(scenes.slice(1), { autoAlpha: 0 })
      let current = -1
      const updateScene = (index) => {
        if (current === index) return
        current = index
        scenes.forEach((scene, i) => {
          scene.inert = i !== index
          scene.setAttribute('aria-hidden', String(i !== index))
          steps[i].classList.toggle('movement-step--active', i === index)
        })
        number.textContent = String(index + 1).padStart(2, '0')
      }
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate() { updateScene(Math.min(2, Math.floor(this.time() + 0.5))) },
        scrollTrigger: {
          trigger: root, pin: stage,
          start: () => `top ${document.querySelector('.site-header')?.offsetHeight || 79}px`,
          end: () => `+=${window.innerHeight * 2}`,
          scrub: motion.scrub, invalidateOnRefresh: true,
        },
      })
      timeline.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 2 }, 0)
      scenes.slice(1).forEach((scene, i) => {
        const at = i + 0.15
        timeline.to(stage, { backgroundColor: colors[i + 1], duration: 0.7 }, at)
          .to(scenes[i], { autoAlpha: 0, duration: 0.4 }, at)
          .fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, at)
          .fromTo(scene.querySelector('.movement-scene__photo'),
            { clipPath: 'inset(0 0 100% 0)', y: 35, rotate: 3 },
            { clipPath: 'inset(0 0 0% 0)', y: 0, rotate: 0, duration: 0.7 }, at)
          .fromTo(scene.querySelector('.movement-scene__word'), { xPercent: 9 }, { xPercent: 0, duration: 0.8 }, at)
          .fromTo(scene.querySelector('.movement-scene__copy'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, at + 0.15)
      })
      updateScene(0)
      return () => {
        root.classList.remove('movement-showcase--pinned')
        scenes.forEach((scene) => {
          scene.inert = false
          scene.removeAttribute('aria-hidden')
          // Initial sets and scrubbed fromTo tweens share these properties.
          // Explicitly restore the static layout after GSAP reverts both.
          scene.style.removeProperty('opacity')
          scene.style.removeProperty('visibility')
        })
        stage.style.removeProperty('background-color')
        steps.forEach((step, i) => step.classList.toggle('movement-step--active', i === 0))
        number.textContent = '01'
      }
    })
    return () => media.revert()
  }, { scope })

  return (
    <section ref={scope} className="movement-showcase" aria-labelledby="movement-title">
      <div className="movement-stage">
        <div className="movement-heading wrap">
          <div><Eyebrow>Encontre seu movimento</Eyebrow><h2 id="movement-title">Mais jeitos de <em>se sentir bem.</em></h2></div>
          <span className="movement-scroll" aria-hidden="true">Siga o seu ritmo <ArrowDown size={16} /></span>
        </div>
        <div className="movement-scenes wrap">
          {movements.map((item, index) => (
            <article key={item.number} className="movement-scene" style={{ '--scene-accent': sceneAccents[index] }} aria-label={item.name}>
              <span className="movement-scene__word" aria-hidden="true">{item.tag}</span>
              <div className="movement-scene__photo"><img src={item.image} alt={item.alt} loading="lazy" width="1000" height="1100" /><span className="movement-scene__photo-label" aria-hidden="true">Viva em movimento / {item.number}</span></div>
              <div className="movement-scene__copy"><span className="movement-scene__number" aria-hidden="true">/ {item.number}</span><span className="movement-scene__tag">{item.tag}</span><h3>{item.name}</h3><p>{item.summary}</p><span className="movement-scene__asterisk" aria-hidden="true">✳</span></div>
            </article>
          ))}
        </div>
        <div className="movement-footer wrap">
          <div className="movement-position" aria-hidden="true"><span className="movement-current">01</span><span className="movement-progress"><span className="movement-progress__fill" /></span><span>03</span></div>
          <div className="movement-steps" aria-hidden="true">{movements.map((item, i) => <span key={item.number} className={`movement-step${i === 0 ? ' movement-step--active' : ''}`}>{item.tag}</span>)}</div>
          <TextLink to="/modalidades">Todas as modalidades</TextLink>
        </div>
      </div>
    </section>
  )
}
