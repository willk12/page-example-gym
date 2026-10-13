import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Eyebrow({ children }) {
  return <span className="eyebrow"><span className="eyebrow__dot" />{children}</span>
}

export function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="page-intro wrap">
      <Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1>{description && <p>{description}</p>}
    </section>
  )
}

export function TextLink({ to, children, light = false }) {
  return <Link className={`text-link${light ? ' text-link--light' : ''}`} to={to}>{children}<ArrowRight size={17} /></Link>
}

export function PlanCard({ plan }) {
  return (
    <article className={`plan-card${plan.featured ? ' plan-card--featured' : ''}`}>
      {plan.featured && <span className="plan-card__badge">Mais escolhido</span>}
      <div className="plan-card__top"><h3>{plan.name}</h3><p>{plan.description}</p></div>
      <p className="plan-price"><span>R$</span>{plan.price}<small>/ mês*</small></p>
      <ul className="check-list">{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">+</span>{feature}</li>)}</ul>
      <Link className={`button plan-card__button${plan.featured ? ' button--lime' : ' button--outline'}`} to="/contato">Quero conhecer <ArrowUpRight size={16} /></Link>
      <small className="plan-note">* Valor ilustrativo para este projeto.</small>
    </article>
  )
}

export function CtaBand({ eyebrow = 'Vem experimentar', title = 'Seu próximo treino começa com um oi.', button = 'Agendar aula' }) {
  return (
    <section className="cta-band"><div className="cta-band__inner wrap"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div><Link className="button button--light" to="/contato">{button}<ArrowUpRight size={17} /></Link></div></section>
  )
}
