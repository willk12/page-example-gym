import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from './config.js'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function useSiteMotion(scope, pathname) {
  useGSAP(() => {
    const root = scope.current
    if (!root || !('IntersectionObserver' in window)) return

    const media = gsap.matchMedia()
    media.add({ desktop: motion.desktop, reduce: motion.reduced, all: 'all' }, ({ conditions }) => {
      if (conditions.reduce) return
      const select = gsap.utils.selector(root)
      gsap.from(root, {
        y: 14,
        opacity: 0,
        duration: 0.55,
        ease: motion.ease,
        clearProps: 'transform,opacity',
      })
      select('.hero-orb').forEach((orb, index) => {
        gsap.to(orb, {
          x: index === 1 ? -16 : 14,
          y: index === 0 ? -22 : 18,
          rotate: index % 2 ? -12 : 10,
          duration: 5 + index * 1.3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.35,
        })
      })
      const hero = select('.home-hero')[0]
      const follower = select('.hero-orb-follower')[0]
      const removePointerListeners = []
      if (hero && follower && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const moveX = gsap.quickTo(follower, 'x', { duration: 0.7, ease: 'power3.out' })
        const moveY = gsap.quickTo(follower, 'y', { duration: 0.7, ease: 'power3.out' })
        const followPointer = (event) => {
          if (event.pointerType !== 'mouse') return
          const bounds = hero.getBoundingClientRect()
          moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * 34)
          moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 26)
        }
        const resetFollower = () => {
          moveX(0)
          moveY(0)
        }
        hero.addEventListener('pointermove', followPointer)
        hero.addEventListener('pointerleave', resetFollower)
        removePointerListeners.push(() => {
          hero.removeEventListener('pointermove', followPointer)
          hero.removeEventListener('pointerleave', resetFollower)
        })
      }
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        select('.hero-magnetic').forEach((target) => {
          const moveX = gsap.quickTo(target, 'x', { duration: 0.38, ease: 'power3.out' })
          const moveY = gsap.quickTo(target, 'y', { duration: 0.38, ease: 'power3.out' })
          const followPointer = (event) => {
            const bounds = target.getBoundingClientRect()
            moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * 12)
            moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 9)
          }
          const resetTarget = () => {
            moveX(0)
            moveY(0)
          }
          target.addEventListener('pointermove', followPointer)
          target.addEventListener('pointerleave', resetTarget)
          removePointerListeners.push(() => {
            target.removeEventListener('pointermove', followPointer)
            target.removeEventListener('pointerleave', resetTarget)
          })
        })
      }

      if (select('.home-hero').length) {
        const intro = gsap.timeline({ defaults: { duration: motion.entrance, ease: motion.ease } })
        intro.from(select('.hero-copy-slides'), { y: motion.distance, opacity: 0 })
          .from(select('.hero-art'), { y: motion.distance, opacity: 0, rotate: 2 }, 0.12)
          .from(select('.hero-stamp-motion'), { scale: 0.8, rotate: -12, opacity: 0 }, 0.4)
          .from(select('.hero-actions, .hero-proof, .hero-controls'), { y: 12, opacity: 0, stagger: motion.stagger }, 0.3)
      }

      if (conditions.desktop && select('.home-hero').length) {
        gsap.to(select('.hero-depth'), {
          y: motion.parallax, ease: 'none',
          scrollTrigger: { trigger: select('.home-hero')[0], start: 'top top', end: 'bottom top', scrub: motion.scrub },
        })
        gsap.to(select('.hero-watermark'), {
          x: -motion.parallax * 2, ease: 'none',
          scrollTrigger: { trigger: select('.home-hero')[0], start: 'top top', end: 'bottom top', scrub: motion.scrub },
        })
      }

      const targets = select('.page-intro, .section-heading, .home-about__photo, .home-about__copy, .modality-row, .about-story, .testimonial-band__inner, .cta-band__inner')
      targets.forEach((target) => {
        gsap.from(target, {
          y: motion.distance, opacity: 0, duration: motion.reveal, ease: motion.ease,
          scrollTrigger: { trigger: target, start: 'top 92%', once: true },
        })
      })
      select('.plans-grid, .values-grid, .class-grid').forEach((grid) => {
        gsap.from(grid.children, {
          y: motion.distance, opacity: 0, stagger: motion.stagger, duration: motion.reveal, ease: motion.ease,
          scrollTrigger: { trigger: grid, start: 'top 92%', once: true },
        })
      })

      // Keyboard navigation must never land on a visually hidden reveal.
      const showFocused = (event) => {
        const ancestors = [...targets, ...select('.plan-card, .value-item, .class-card')]
          .filter((target) => target.contains(event.target))
        ancestors.forEach((target) => {
          gsap.getTweensOf(target).forEach((tween) => tween.progress(1))
        })
      }
      root.addEventListener('focusin', showFocused)
      return () => {
        root.removeEventListener('focusin', showFocused)
        removePointerListeners.forEach((removeListener) => removeListener())
      }
    })

    let disposed = false
    let frame
    const refresh = () => {
      if (disposed) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    const images = [...root.querySelectorAll('img')]
    const imageTweens = []
    const revealImage = (img) => {
      if (disposed || !img.naturalWidth) return
      imageTweens.push(gsap.fromTo(img, { opacity: 0 }, {
        opacity: 1,
        duration: 0.7,
        ease: motion.ease,
        clearProps: 'opacity',
        overwrite: 'auto',
      }))
    }
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', refresh)
        img.addEventListener('load', () => revealImage(img), { once: true })
        img.addEventListener('error', refresh)
      } else {
        revealImage(img)
      }
    })
    document.fonts?.ready.then(refresh)
    refresh()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      images.forEach((img) => {
        img.removeEventListener('load', refresh)
        img.removeEventListener('error', refresh)
      })
      imageTweens.forEach((tween) => tween.kill())
      gsap.set(images, { clearProps: 'opacity' })
      media.revert()
    }
  }, { scope, dependencies: [pathname], revertOnUpdate: true })
}
