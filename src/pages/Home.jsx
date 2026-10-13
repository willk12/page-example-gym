import { ArrowDown, ArrowUpRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { classes, plans } from '../data/content.js'
import { CtaBand, Eyebrow, PlanCard, TextLink } from '../components/SharedSections.jsx'

export default function Home() {
  return (
    <>
      <section className="home-hero wrap">
        <div className="home-hero__copy">
          <Eyebrow>Seu bairro. Seu ritmo. Seu lugar.</Eyebrow>
          <h1>Movimento que <em>faz bem.</em></h1>
          <p>Treino de verdade, perto de casa e sem pressão para ser outra pessoa. Só precisa chegar como você está.</p>
          <div className="hero-actions"><Link className="button button--lime" to="/contato">Experimente sem custo <ArrowUpRight size={17} /></Link><Link className="hero-secondary" to="/modalidades">Conheça a Viva <ArrowDown size={15} /></Link></div>
          <div className="hero-proof"><div className="avatar-stack" aria-hidden="true"><span>M</span><span>J</span><span>L</span><span>+</span></div><p><span className="stars"><Star /><Star /><Star /><Star /><Star /></span><strong>4,9/5</strong> de quem treina com a gente</p></div>
        </div>
        <div className="home-hero__visual"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1500&q=90" alt="Interior amplo e iluminado de uma academia" /><div className="hero-stamp"><span>treino é</span><strong>pra todo<br />mundo.</strong><span className="stamp-star">✳</span></div><span className="image-caption">Espaço Viva · unidade fictícia</span></div>
        <span className="hero-index">01 — 05</span>
      </section>

      <section className="proof-strip" aria-label="Sobre a academia"><div className="proof-strip__inner wrap"><p><strong>01</strong><span>unidade perto<br />de você</span></p><p><strong>06—22</strong><span>horário que<br />cabe na rotina</span></p><p><strong>100%</strong><span>gente de verdade,<br />sem julgamento</span></p><p className="proof-highlight">O seu lugar para<br /><em>voltar a si.</em></p></div></section>

      <section className="section wrap home-classes">
        <div className="section-heading section-heading--split"><div><Eyebrow>Encontre seu movimento</Eyebrow><h2>Mais jeitos de<br />se sentir bem.</h2></div><TextLink to="/modalidades">Ver todas as modalidades</TextLink></div>
        <div className="class-grid class-grid--home">{classes.slice(0, 3).map((item) => <Link className="class-card" to="/modalidades" key={item.number}><div className="class-card__image"><img src={item.image} alt={item.alt} loading="lazy" /><span className="class-card__tag">{item.tag}</span></div><div className="class-card__body"><span className="class-card__number">{item.number}</span><h3>{item.name}</h3><p>{item.summary}</p><span className="round-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span></div></Link>)}</div>
      </section>

      <section className="section home-about"><div className="home-about__inner wrap"><div className="home-about__photo"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=85" alt="Pessoa treinando ao ar livre com expressão concentrada" loading="lazy" /><span>Um passo de cada vez<br />já é um começo.</span></div><div className="home-about__copy"><Eyebrow>Sem comparação. Sem cobrança.</Eyebrow><h2>A academia é sua.<br /><em>O ritmo também.</em></h2><p>A gente acredita em treino possível, acolhimento sem cerimônia e pequenas conquistas que fazem diferença. Aqui, cada pessoa tem espaço para começar do seu jeito.</p><TextLink to="/sobre">Conheça a nossa ideia</TextLink></div></div></section>

      <section className="section wrap home-plans"><div className="section-heading section-heading--split"><div><Eyebrow>Sem letra miúda</Eyebrow><h2>Um plano que<br />faz sentido.</h2></div><TextLink to="/planos">Comparar planos</TextLink></div><div className="plans-grid plans-grid--home">{plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</div></section>

      <section className="testimonial-band"><div className="testimonial-band__inner wrap"><span className="quote-mark">“</span><blockquote>Eu achei que não gostava de academia. No fim, só estava procurando um lugar que tivesse a minha cara.</blockquote><div className="quote-attribution"><span className="quote-avatar">C</span><span><strong>Camila R.</strong><small>aluna desde 2024 · depoimento fictício</small></span></div></div></section>
      <CtaBand />
    </>
  )
}