import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { classes, plans } from '../data/content.js'
import { CtaBand, Eyebrow, PlanCard, TextLink } from '../components/SharedSections.jsx'
import MovementShowcase from '../components/MovementShowcase.jsx'
import { sceneAccents } from '../motion/config.js'

const heroSlides = classes.slice(0, 3)

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const [isPageHidden, setIsPageHidden] = useState(() => document.hidden)
  const slide = heroSlides[activeSlide]
  const isRotating = isAutoPlaying && !isFocused && !isPageHidden

  useEffect(() => {
    const updateVisibility = () => setIsPageHidden(document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (!isRotating) return undefined

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length)
    }, 5500)

    return () => window.clearInterval(intervalId)
  }, [activeSlide, isRotating])

  const selectSlide = (index) => setActiveSlide((index + heroSlides.length) % heroSlides.length)

  return (
    <>
      <section
        className="home-hero wrap"
        style={{ '--hero-accent': sceneAccents[activeSlide] }}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) setIsFocused(true)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
        }}
        aria-label="Destaques da Viva Academia"
      >
        <span className="hero-watermark" aria-hidden="true">MOVIMENTO</span>
        <div className="hero-orbs" aria-hidden="true">
          <span className="hero-orb hero-orb--lime" />
          <span className="hero-orb-follower"><span className="hero-orb hero-orb--coral" /></span>
          <span className="hero-orb hero-orb--mint" />
        </div>
        <div className="home-hero__copy">
          <div className="hero-copy-slides" aria-live={isRotating ? 'off' : 'polite'}>
            {heroSlides.map((item, index) => (
              <div key={item.number} className={`hero-copy-slide${index === activeSlide ? ' hero-copy-slide--active' : ''}`} aria-hidden={index !== activeSlide}>
                <Eyebrow>{item.tag} · Encontre seu movimento</Eyebrow>
                <h1>{item.name} <em>no seu ritmo.</em></h1>
                <p>{item.summary}</p>
              </div>
            ))}
          </div>
          <div className="hero-actions"><span className="hero-magnetic"><Link className="button button--lime" to="/modalidades">Conheça as modalidades <ArrowUpRight size={17} /></Link></span><span className="hero-magnetic"><Link className="hero-secondary" to="/contato">Agende uma aula <ArrowDown size={15} /></Link></span></div>
          <div className="hero-proof"><div className="avatar-stack" aria-hidden="true"><span>M</span><span>J</span><span>L</span><span>+</span></div><p><span className="stars"><Star /><Star /><Star /><Star /><Star /></span><strong>4,9/5</strong> de quem treina com a gente</p></div>
        </div>
        <div className="home-hero__visual">
          <div className="hero-depth">
            <div className="hero-art">
              <div className="hero-images">
                {heroSlides.map((item, index) => (
                  <img key={item.number} className={`hero-image${index === activeSlide ? ' hero-image--active' : ''}`} src={item.image} alt={item.alt} aria-hidden={index !== activeSlide} fetchPriority={index === 0 ? 'high' : 'auto'} />
                ))}
              </div>
              <div className="hero-stamp-motion"><div className="hero-stamp"><span>treino é</span><strong>pra todo<br />mundo.</strong><span className="stamp-star">✳</span></div></div>
              <span className="image-caption">Viva · {slide.name}</span>
              <span className="hero-photo-note" aria-hidden="true">Corpo presente. Vida em movimento.</span>
            </div>
          </div>
          <div className="hero-controls" aria-label="Controles do destaque">
            <span className="hero-index">{String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}</span>
            <button className="hero-control" type="button" aria-label="Slide anterior" onClick={() => selectSlide(activeSlide - 1)}><ArrowLeft size={16} /></button>
            <div className="hero-dots" aria-label="Escolher destaque">
              {heroSlides.map((item, index) => (
                <button key={item.number} className={`hero-dot${index === activeSlide ? ' hero-dot--active' : ''}`} type="button" aria-label={`Mostrar destaque: ${item.name}`} aria-pressed={index === activeSlide} onClick={() => selectSlide(index)} />
              ))}
            </div>
            <button className="hero-control" type="button" aria-label="Próximo slide" onClick={() => selectSlide(activeSlide + 1)}><ArrowRight size={16} /></button>
            <button className="hero-control hero-control--play" type="button" aria-label={isRotating ? 'Pausar rotação automática' : 'Retomar rotação automática'} aria-pressed={isRotating} onClick={() => {
              setIsAutoPlaying(!isRotating)
              setIsFocused(false)
            }}>
              {isRotating ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Sobre a academia"><div className="proof-strip__inner wrap"><p><strong>01</strong><span>unidade perto<br />de você</span></p><p><strong>06—22</strong><span>horário que<br />cabe na rotina</span></p><p><strong>100%</strong><span>gente de verdade,<br />sem julgamento</span></p><p className="proof-highlight">O seu lugar para<br /><em>voltar a si.</em></p></div></section>

      <MovementShowcase />

      <section className="section home-about"><div className="home-about__inner wrap"><div className="home-about__photo"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=85" alt="Pessoa treinando ao ar livre com expressão concentrada" loading="lazy" /><span>Um passo de cada vez<br />já é um começo.</span></div><div className="home-about__copy"><Eyebrow>Sem comparação. Sem cobrança.</Eyebrow><h2>A academia é sua.<br /><em>O ritmo também.</em></h2><p>A gente acredita em treino possível, acolhimento sem cerimônia e pequenas conquistas que fazem diferença. Aqui, cada pessoa tem espaço para começar do seu jeito.</p><TextLink to="/sobre">Conheça a nossa ideia</TextLink></div></div></section>

      <section className="section wrap home-plans"><div className="section-heading section-heading--split"><div><Eyebrow>Sem letra miúda</Eyebrow><h2>Um plano que<br />faz sentido.</h2></div><TextLink to="/planos">Comparar planos</TextLink></div><div className="plans-grid plans-grid--home">{plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</div></section>

      <section className="testimonial-band"><div className="testimonial-band__inner wrap"><span className="quote-mark">“</span><blockquote>Eu achei que não gostava de academia. No fim, só estava procurando um lugar que tivesse a minha cara.</blockquote><div className="quote-attribution"><span className="quote-avatar">C</span><span><strong>Camila R.</strong><small>aluna desde 2024 · depoimento fictício</small></span></div></div></section>
      <CtaBand />
    </>
  )
}
