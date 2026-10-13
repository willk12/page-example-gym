import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { classes } from '../data/content.js'
import { CtaBand, PageIntro } from '../components/SharedSections.jsx'

export default function Modalidades() {
  return (
    <>
      <PageIntro eyebrow="Tem espaço para todo mundo" title={<>Encontre o seu<br /><em>jeito de se mexer.</em></>} description="Da primeira série à aula em grupo, a ideia é simples: experimentar sem pressão até achar o movimento que combina com você." />
      <section className="section wrap modality-list">{classes.map((item, index) => <article className={`modality-row${index % 2 ? ' modality-row--reverse' : ''}`} key={item.number}><div className="modality-row__photo"><img src={item.image} alt={item.alt} loading="lazy" /><span>{item.tag}</span></div><div className="modality-row__copy"><span className="modality-number">{item.number} / 04</span><h2>{item.name}</h2><p>{item.summary}</p><p className="modality-detail">Instrutores por perto, turma acolhedora e opções para você adaptar a intensidade ao seu momento.</p><Link className="text-link" to="/contato">Quero experimentar <ArrowUpRight size={17} /></Link></div></article>)}</section>
      <CtaBand eyebrow="A gente te ajuda a escolher" title="Ainda não sabe por onde começar?" button="Marcar uma conversa" />
    </>
  )
}