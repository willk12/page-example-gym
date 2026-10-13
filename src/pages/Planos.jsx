import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { plans } from '../data/content.js'
import { CtaBand, Eyebrow, PageIntro, PlanCard } from '../components/SharedSections.jsx'

const includedBenefits = ['Sem taxa de matrícula', 'Sem multa de cancelamento', 'Acompanhamento próximo']

export default function Planos() {
  return (
    <>
      <PageIntro eyebrow="Escolha com calma" title={<>Planos simples.<br /><em>Sem surpresas.</em></>} description="Comece pelo que funciona para a sua rotina hoje. Se ela mudar, a gente conversa e ajusta junto." />
      <section className="section wrap pricing-section"><div className="pricing-intro"><Eyebrow>Todos os planos incluem</Eyebrow><div className="included-list">{includedBenefits.map((benefit) => <span key={benefit}><Check size={16} />{benefit}</span>)}</div></div><div className="plans-grid">{plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</div><p className="pricing-footnote">Valores, condições e nomes de planos são fictícios e servem apenas para este projeto demonstrativo.</p></section>
      <section className="plan-note-band"><div className="wrap plan-note-band__inner"><span className="plan-note-band__symbol">?</span><div><h2>Quer conversar antes de escolher?</h2><p>Sem pressa e sem compromisso. A equipe pode te ajudar a encontrar o melhor começo.</p></div><Link className="text-link" to="/contato">Fale com a gente <Check size={16} /></Link></div></section>
      <CtaBand eyebrow="Primeiro passo, sem custo" title="Vem conhecer antes de decidir." button="Agendar aula experimental" />
    </>
  )
}