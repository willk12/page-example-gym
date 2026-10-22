import { useEffect, useRef, useState } from 'react'
import { LogOut, MessageCircle, Send, X } from 'lucide-react'
import { io } from 'socket.io-client'

export default function Atendimento() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [defaultGreeting, setDefaultGreeting] = useState('')
  const [greetingCustomized, setGreetingCustomized] = useState(false)
  const [savingGreeting, setSavingGreeting] = useState(false)
  const [greetingFeedback, setGreetingFeedback] = useState('')
  const activeIdRef = useRef(activeId)
  const socketRef = useRef(null)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setError('Não foi possível conectar ao servidor de atendimento.'))
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    if (!authenticated) return undefined
    let active = true
    const socket = io()
    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('chat:message', (message) => {
      setConversations((current) => {
        const existing = current.find((conversation) => conversation.id === message.conversationId)
        if (!existing) {
          fetch('/api/admin/conversations')
            .then((response) => response.json())
            .then((data) => active && setConversations(data.conversations))
          return current
        }
        return [
          { ...existing, lastMessage: message.body, lastSender: message.sender, updatedAt: message.createdAt },
          ...current.filter((conversation) => conversation.id !== message.conversationId),
        ]
      })
      if (message.conversationId === activeIdRef.current) {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
      }
    })

    fetch('/api/admin/conversations')
      .then((response) => response.json())
      .then((data) => {
        if (!active) return
        setConversations(data.conversations)
        setActiveId((current) => current || data.conversations[0]?.id || null)
      })
      .catch(() => setError('Não foi possível carregar as conversas.'))
    fetch('/api/admin/chat-settings')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setGreeting(data.greeting)
        setDefaultGreeting(data.defaultGreeting)
        setGreetingCustomized(data.isCustomized)
      })
      .catch(() => setError('Não foi possível carregar a mensagem automática.'))

    return () => {
      active = false
      socket.disconnect()
      socketRef.current = null
    }
  }, [authenticated])

  useEffect(() => {
    if (!authenticated || !activeId) return
    fetch(`/api/admin/conversations/${activeId}/messages`)
      .then((response) => response.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setError('Não foi possível carregar as mensagens.'))
  }, [authenticated, activeId])

  const login = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setPassword('')
      setAuthenticated(true)
    } catch (loginError) {
      setError(loginError.message || 'Falha no login.')
    }
  }

  const sendReply = (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !activeId) return
    const socket = socketRef.current
    if (!socket?.connected) return
    socket.emit('staff:send', { conversationId: activeId, body }, (result) => {
      if (!result?.ok) {
        setError(result?.error || 'Não foi possível enviar a resposta.')
        return
      }
      setMessages((current) => [...current, result.message])
      setConversations((current) => current.map((conversation) => conversation.id === activeId
        ? { ...conversation, lastMessage: result.message.body, lastSender: 'staff', updatedAt: result.message.createdAt }
        : conversation))
      setDraft('')
      setError('')
    })
  }

  const closeConversation = async () => {
    if (!activeId) return
    const response = await fetch(`/api/admin/conversations/${activeId}/close`, { method: 'POST' })
    if (!response.ok) {
      setError('Não foi possível encerrar esta conversa.')
      return
    }
    setConversations((current) => current.filter((conversation) => conversation.id !== activeId))
    setMessages([])
    setActiveId(null)
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    setConversations([])
    setActiveId(null)
  }

  const saveGreeting = async (event) => {
    event.preventDefault()
    setSavingGreeting(true)
    setGreetingFeedback('')
    try {
      const response = await fetch('/api/admin/chat-settings/greeting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greeting }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setGreeting(data.greeting)
      setGreetingCustomized(data.isCustomized)
      setGreetingFeedback('Mensagem salva para novas conversas.')
    } catch (saveError) {
      setGreetingFeedback(saveError.message || 'Não foi possível salvar a mensagem.')
    } finally {
      setSavingGreeting(false)
    }
  }

  const restoreGreeting = async () => {
    setSavingGreeting(true)
    setGreetingFeedback('')
    try {
      const response = await fetch('/api/admin/chat-settings/greeting', { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setGreeting(data.greeting)
      setDefaultGreeting(data.defaultGreeting)
      setGreetingCustomized(false)
      setGreetingFeedback('Mensagem padrão restaurada para novas conversas.')
    } catch (restoreError) {
      setGreetingFeedback(restoreError.message || 'Não foi possível restaurar a mensagem.')
    } finally {
      setSavingGreeting(false)
    }
  }

  if (checkingSession) return <main className="support-page"><p>Conectando ao atendimento...</p></main>
  if (!authenticated) {
    return (
      <main className="support-page">
        <form className="support-login" onSubmit={login}>
          <MessageCircle size={28} aria-hidden="true" />
          <span className="eyebrow">Área da equipe</span>
          <h1>Atendimento</h1>
          <label htmlFor="support-password">Senha</label>
          <input id="support-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error && <p className="support-error" role="alert">{error}</p>}
          <button className="button button--dark" type="submit">Entrar</button>
        </form>
      </main>
    )
  }

  return (
    <main className="support-page support-page--inbox">
      <header className="support-header">
        <div><span className="eyebrow">Viva Academia</span><h1>Atendimento</h1></div>
        <div className="support-header__actions">
          <span className={`chat-panel__status${connected ? ' chat-panel__status--online' : ' chat-panel__status--offline'}`}><span aria-hidden="true" />{connected ? 'Conectado' : 'Sem conexão'}</span>
          <button className="support-logout" type="button" onClick={logout} aria-label="Sair"><LogOut size={18} /></button>
        </div>
      </header>
      {error && <p className="support-error" role="alert">{error}</p>}
      <form className="support-greeting" onSubmit={saveGreeting}>
        <div className="support-greeting__heading">
          <div><span className="eyebrow">Configuração do chat</span><h2>Mensagem automática</h2></div>
          <span className="support-greeting__state">{greetingCustomized ? 'Personalizada' : 'Padrão do servidor'}</span>
        </div>
        <p>Enviada uma vez quando uma nova conversa começa. Conversas existentes não são alteradas.</p>
        <label className="visually-hidden" htmlFor="chat-greeting-input">Texto da mensagem automática</label>
        <textarea id="chat-greeting-input" value={greeting} onChange={(event) => setGreeting(event.target.value)} maxLength={1000} rows={3} required />
        <div className="support-greeting__actions">
          <span>{greeting.length}/1000{greetingFeedback && <span className="support-greeting__feedback" role="status">{greetingFeedback}</span>}</span>
          <div>
            <button className="support-close-conversation" type="button" onClick={restoreGreeting} disabled={savingGreeting || !greetingCustomized}>Restaurar padrão</button>
            <button className="button button--dark" type="submit" disabled={savingGreeting || !greeting.trim() || greeting.length > 1000}>{savingGreeting ? 'Salvando...' : 'Salvar mensagem'}</button>
          </div>
        </div>
        <span className="visually-hidden">Padrão atual: {defaultGreeting}</span>
      </form>
      <div className="support-inbox">
        <aside className="support-conversations" aria-label="Conversas abertas">
          <div className="support-list-heading"><h2>Conversas</h2><span>{conversations.length}</span></div>
          {conversations.length === 0 && <p className="support-empty">Nenhuma conversa por enquanto.</p>}
          {conversations.map((conversation) => (
            <button key={conversation.id} className={`support-conversation${conversation.id === activeId ? ' support-conversation--active' : ''}`} type="button" onClick={() => { setMessages([]); setActiveId(conversation.id) }}>
              <MessageCircle size={18} aria-hidden="true" />
              <span><strong>Visitante</strong><small>{conversation.lastMessage || 'Aguardando mensagem'}</small></span>
            </button>
          ))}
        </aside>
        <section className="support-thread" aria-label="Mensagens da conversa">
          {activeId ? (
            <>
              <header className="support-thread__header"><strong>Conversa</strong><button className="support-close-conversation" type="button" onClick={closeConversation}><X size={16} /> Encerrar</button></header>
              <div className="support-thread__messages">
                {messages.map((message) => (
                  <article key={message.id} className={`chat-message chat-message--${message.sender}`}>
                    {message.sender === 'system' && <span className="chat-message__label">Mensagem automática</span>}
                    <p>{message.body}</p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</time>
                  </article>
                ))}
              </div>
              <form className="support-reply" onSubmit={sendReply}>
                <label className="visually-hidden" htmlFor="support-reply-input">Sua resposta</label>
                <textarea id="support-reply-input" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder="Escreva uma resposta..." />
                <button className="button button--dark" type="submit" disabled={!draft.trim() || !connected}><Send size={16} /> Enviar</button>
              </form>
            </>
          ) : <p className="support-empty support-empty--center">Selecione uma conversa para responder.</p>}
        </section>
      </div>
    </main>
  )
}