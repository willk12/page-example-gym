import { useEffect, useRef } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteLayout from './components/SiteLayout.jsx'
import Home from './pages/Home.jsx'
import Modalidades from './pages/Modalidades.jsx'
import Planos from './pages/Planos.jsx'
import Sobre from './pages/Sobre.jsx'
import Contato from './pages/Contato.jsx'
import Atendimento from './pages/Atendimento.jsx'
import { motion } from './motion/config.js'
import './viva.css'
import './editorial.css'

gsap.registerPlugin(ScrollTrigger)

function SmoothScroll() {
  const { pathname } = useLocation()
  const lenisRef = useRef(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis
    const tick = (time) => lenis?.raf(time * 1000)
    const disable = () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
      lenisRef.current = null
    }
    const updateMotion = () => {
      if (preference.matches) {
        disable()
        return
      }
      if (lenis) return
      lenis = new Lenis({ autoRaf: false, lerp: motion.scrollLerp, smoothWheel: true, wheelMultiplier: 0.9 })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
    }

    updateMotion()
    preference.addEventListener('change', updateMotion)
    return () => {
      preference.removeEventListener('change', updateMotion)
      disable()
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function NotFound() {
  return (
    <section className="not-found wrap">
      <span className="eyebrow">404 · caminho não encontrado</span>
      <h1>Essa página saiu para treinar.</h1>
      <Link className="button button--dark" to="/">Voltar para o início</Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <SiteLayout>
        <Routes>
          <Route path="/atendimento" element={<Atendimento />} />
          <Route path="/" element={<Home />} />
          <Route path="/modalidades" element={<Modalidades />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  )
}
