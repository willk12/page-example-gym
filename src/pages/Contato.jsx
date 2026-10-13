import { useState } from 'react'
import { ArrowUpRight, Clock3, MapPin, Phone, CheckCircle2 } from 'lucide-react'
import { schedule } from '../data/content.js'
import { Eyebrow, PageIntro } from '../components/SharedSections.jsx'

export default function Contato() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageIntro eyebrow="A conversa começa aqui" title={<>Chega mais.<br /><em>A gente te espera.</em></>} description="Quer conhecer o espaço, experimentar uma aula ou tirar uma dúvida? Manda uma mensagem para a equipe." />
      <section className="section wrap contact-layout">
        <div className="contact-form-wrap">
          {submitted ? <div className="form-success" role="status"><CheckCircle2 size={34} /><Eyebrow>Mensagem recebida</Eyebrow><h2>Obrigado por chegar junto.</h2><p>Este formulário é demonstrativo e não enviou seus dados. Em um site real, a equipe da Viva entraria em contato em breve.</p><button className="text-link form-reset" type="button" onClick={() => setSubmitted(false)}>Enviar outra mensagem <ArrowUpRight size={16} /></button></div> : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-heading"><Eyebrow>Conta pra gente</Eyebrow><p>Os campos com * são obrigatórios.</p></div>
              <label>Seu nome *<input name="name" type="text" placeholder="Como podemos te chamar?" autoComplete="name" required /></label>
              <div className="form-row"><label>E-mail *<input name="email" type="email" placeholder="voce@email.com" autoComplete="email" required /></label><label>Telefone<input name="phone" type="tel" placeholder="(11) 99999-9999" autoComplete="tel" /></label></div>
              <label>O que você procura?<select name="interest" defaultValue="aula"><option value="aula">Quero agendar uma aula experimental</option><option value="planos">Quero saber sobre os planos</option><option value="modalidades">Quero conhecer as modalidades</option><option value="outro">Tenho outra dúvida</option></select></label>
              <label>Deixe uma mensagem<textarea name="message" rows="4" placeholder="Escreva aqui (opcional)" /></label>
              <button className="button button--dark form-submit" type="submit">Enviar mensagem <ArrowUpRight size={17} /></button>
              <small className="form-disclaimer">Demonstração: seus dados não são armazenados nem enviados.</small>
            </form>
          )}
        </div>
        <aside className="contact-aside">
          <div className="contact-info-block"><Eyebrow>Visite a Viva</Eyebrow><span className="contact-icon"><MapPin size={19} /></span><h2>Bem no bairro.</h2><p>Rua das Palmeiras, 248<br />Vila Mariana · São Paulo, SP</p><span className="fictional-note">Endereço fictício para demonstração</span></div>
          <div className="contact-info-block"><span className="contact-icon"><Clock3 size={19} /></span><h3>Nosso horário</h3><div className="schedule-list">{schedule.map((item) => <p key={item.day}><span>{item.day}</span><strong>{item.hours}</strong></p>)}</div></div>
          <div className="contact-info-block contact-phone"><span className="contact-icon"><Phone size={19} /></span><h3>Prefere ligar?</h3><a href="tel:+551140002026">(11) 4000-2026 <ArrowUpRight size={14} /></a><span className="fictional-note">Telefone fictício</span></div>
        </aside>
      </section>
      <div className="contact-bottom-note"><div className="wrap"><span aria-hidden="true">●</span> A primeira aula é por nossa conta. Você decide depois.</div></div>
    </>
  )
}