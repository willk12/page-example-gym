import { ArrowUpRight, Heart, Users, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CtaBand, Eyebrow, PageIntro } from '../components/SharedSections.jsx'

const values = [
  { icon: Heart, title: 'Acolher primeiro', text: 'Todo corpo e todo começo merecem respeito. Ponto.' },
  { icon: Users, title: 'Fazer junto', text: 'Instrutores presentes e uma comunidade que torce por você.' },
  { icon: Sun, title: 'Celebrar o possível', text: 'Consistência vale mais do que perfeição. Cada passo conta.' },
]

export default function Sobre() {
  return (
    <>
      <PageIntro eyebrow="Prazer, somos a Viva" title={<>Uma academia feita<br />para a <em>vida real.</em></>} description="A Viva nasceu de uma pergunta simples: e se a academia fosse um lugar onde todo mundo pudesse se sentir à vontade?" />
      <section className="about-feature wrap"><div className="about-feature__image"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85" alt="Área de treino espaçosa com equipamentos e luz natural" loading="lazy" /><span>Nosso espaço · imagem ilustrativa</span></div><div className="about-feature__caption"><span>01 — A VIVA</span><p>Mais do que aparelhos, um lugar para criar o hábito de cuidar de você.</p></div></section>
      <section className="section wrap about-story"><div className="about-story__label"><Eyebrow>De bairro, de verdade</Eyebrow><span>Desde 2021<br />na vizinhança</span></div><div className="about-story__text"><h2>Não precisa chegar<br />sabendo tudo.</h2><p>A gente sabe que entrar numa academia pela primeira vez pode dar um frio na barriga. Por isso, aqui tem alguém para te receber, explicar com calma e ajudar a encontrar seu próprio ritmo.</p><p>A Viva é um projeto fictício criado para demonstrar um site de academia local. Nome, história, equipe e imagens são ilustrativos e podem ser adaptados para a identidade de um negócio real.</p><Link className="text-link" to="/contato">Venha conhecer <ArrowUpRight size={16} /></Link></div></section>
      <section className="values-section"><div className="wrap"><div className="section-heading"><Eyebrow>O que guia a gente</Eyebrow><h2>Jeito Viva de<br /><em>fazer acontecer.</em></h2></div><div className="values-grid">{values.map(({ icon: Icon, title, text }, index) => <article className="value-item" key={title}><span className="value-number">0{index + 1}</span><span className="value-icon"><Icon size={21} strokeWidth={1.7} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <CtaBand eyebrow="O próximo passo pode ser pequeno" title="Passa aqui para dar uma olhada." button="Agendar uma visita" />
    </>
  )
}