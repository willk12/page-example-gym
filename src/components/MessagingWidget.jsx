import { useEffect, useRef, useState } from 'react'
import { MessageCircle, ArrowUpRight, X } from 'lucide-react'

const whatsappNumber = '5511996600240'
const messageLimit = 2000

export default function MessagingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const toggleRef = useRef(null)
  const canContinue = Boolean(draft.trim()) && draft.length <= messageLimit

  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  const closePanel = () => {
    setIsOpen(false)
    toggleRef.current?.focus({ preventScroll: true })
  }

  const continueToWhatsApp = (event) => {
    event.preventDefault()
    if (!canContinue) return
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(draft.trim())}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <aside className="message-widget" aria-label="Contato pelo WhatsApp">
      <section
        id="message-widget-panel"
        className={`message-widget__panel${isOpen ? ' message-widget__panel--open' : ''}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        aria-label="Preparar mensagem para o WhatsApp"
        onKeyDown={(event) => {
          if (event.key === 'Escape') closePanel()
        }}
      >
        <header className="chat-panel__header">
          <div>
            <p className="message-widget__title">Fale com a gente</p>
            <span className="chat-panel__status">Pelo WhatsApp · Viva Academia</span>
          </div>
          <button className="chat-panel__close" type="button" aria-label="Fechar WhatsApp" onClick={closePanel}>
            <X size={18} />
          </button>
        </header>
        <form className="whatsapp-form" onSubmit={continueToWhatsApp}>
          <p id="whatsapp-instructions">Sua mensagem será aberta no WhatsApp. Toque em Enviar para concluir.</p>
          <label htmlFor="chat-message-input">Sua mensagem</label>
          <textarea
            ref={inputRef}
            id="chat-message-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Olá! Quero conhecer a academia..."
            aria-describedby="whatsapp-instructions whatsapp-message-limit"
            maxLength={messageLimit}
            rows={5}
            required
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                if (!event.repeat) event.currentTarget.form.requestSubmit()
              }
            }}
          />
          <small id="whatsapp-message-limit">{draft.length} / {messageLimit} caracteres · Shift+Enter para nova linha</small>
          <button className="button button--lime" type="submit" disabled={!canContinue}>
            Continuar no WhatsApp <ArrowUpRight size={18} />
          </button>
        </form>
      </section>
      <button
        ref={toggleRef}
        className={`message-widget__toggle${isOpen ? ' message-widget__toggle--open' : ''}`}
        type="button"
        aria-label={isOpen ? 'Fechar WhatsApp' : 'Abrir WhatsApp'}
        aria-expanded={isOpen}
        aria-controls="message-widget-panel"
        onClick={isOpen ? closePanel : () => setIsOpen(true)}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </aside>
  )
}
