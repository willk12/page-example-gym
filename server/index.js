import { readFile } from 'node:fs/promises'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'node:http'
import express from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { Pool } from 'pg'
import { Server } from 'socket.io'

const port = Number(process.env.CHAT_PORT || 3001)
const sessionSecret = process.env.SESSION_SECRET
const adminPassword = process.env.CHAT_ADMIN_PASSWORD
const databaseUrl = process.env.DATABASE_URL
const defaultGreeting = process.env.CHAT_GREETING?.trim() || 'Olá! Obrigado por entrar em contato com a Viva Academia. Como podemos ajudar?'
const maxGreetingLength = 1000

if (!sessionSecret || !adminPassword || !databaseUrl) {
  throw new Error('Set SESSION_SECRET, CHAT_ADMIN_PASSWORD, and DATABASE_URL before starting the chat server.')
}

const pool = new Pool({ connectionString: databaseUrl })
const PgSession = connectPgSimple(session)
const sessionMiddleware = session({
  store: new PgSession({ pool, createTableIfMissing: true }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
})

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { serveClient: false })
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const loginAttempts = new Map()

app.set('trust proxy', 1)
app.use(express.json({ limit: '8kb' }))
app.use(sessionMiddleware)

const requireStaff = (req, res, next) => {
  if (req.session.role !== 'staff') return res.status(401).json({ error: 'Faça login para continuar.' })
  next()
}

const getMessages = async (conversationId) => {
  const result = await pool.query(
    `SELECT id, conversation_id AS "conversationId", sender, body, created_at AS "createdAt"
       FROM chat_messages WHERE conversation_id = $1 ORDER BY id ASC`,
    [conversationId],
  )
  return result.rows
}

const getEffectiveGreeting = async (db = pool) => {
  const result = await db.query('SELECT greeting FROM chat_settings WHERE id = 1')
  return result.rows[0]?.greeting || defaultGreeting
}

const getGreetingSettings = async () => {
  const greeting = await getEffectiveGreeting()
  return { greeting, defaultGreeting, isCustomized: greeting !== defaultGreeting }
}

const createMessage = async (conversationId, sender, rawBody) => {
  const body = typeof rawBody === 'string' ? rawBody.trim() : ''
  if (!body || body.length > 2000) throw new Error('A mensagem deve ter entre 1 e 2000 caracteres.')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const conversation = await client.query(
      'SELECT id FROM chat_conversations WHERE id = $1 AND status = \'open\' FOR UPDATE',
      [conversationId],
    )
    if (!conversation.rowCount) throw new Error('Esta conversa não está disponível.')
    const inserted = await client.query(
      `INSERT INTO chat_messages (conversation_id, sender, body)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id AS "conversationId", sender, body, created_at AS "createdAt"`,
      [conversationId, sender, body],
    )
    await client.query('UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1', [conversationId])
    await client.query('COMMIT')
    return inserted.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/chat/session', asyncRoute(async (req, res) => {
  if (req.session.role === 'staff') return res.status(403).json({ error: 'Use o painel de atendimento.' })

  let conversationId = req.session.conversationId
  if (conversationId) {
    const existing = await pool.query('SELECT id FROM chat_conversations WHERE id = $1 AND status = \'open\'', [conversationId])
    if (!existing.rowCount) conversationId = null
  }
  if (!conversationId) {
    conversationId = randomUUID()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('INSERT INTO chat_conversations (id) VALUES ($1)', [conversationId])
      await client.query(
        'INSERT INTO chat_messages (conversation_id, sender, body) VALUES ($1, \'system\', $2)',
        [conversationId, await getEffectiveGreeting(client)],
      )
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    req.session.conversationId = conversationId
    await new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()))
  }

  res.json({ conversationId, messages: await getMessages(conversationId) })
}))

app.post('/api/admin/login', asyncRoute(async (req, res) => {
  const address = req.ip || req.socket.remoteAddress || 'unknown'
  const attempt = loginAttempts.get(address) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
  if (attempt.resetAt <= Date.now()) {
    attempt.count = 0
    attempt.resetAt = Date.now() + 15 * 60 * 1000
  }
  if (attempt.count >= 10) return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' })

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const submitted = Buffer.from(password)
  const expected = Buffer.from(adminPassword)
  const matches = submitted.length === expected.length && timingSafeEqual(submitted, expected)
  if (!matches) {
    attempt.count += 1
    loginAttempts.set(address, attempt)
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  loginAttempts.delete(address)

  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()))
  req.session.role = 'staff'
  await new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()))
  res.json({ authenticated: true })
}))

app.get('/api/admin/session', (req, res) => res.json({ authenticated: req.session.role === 'staff' }))

app.get('/api/admin/chat-settings', requireStaff, asyncRoute(async (_req, res) => {
  res.json(await getGreetingSettings())
}))

app.put('/api/admin/chat-settings/greeting', requireStaff, asyncRoute(async (req, res) => {
  const greeting = typeof req.body?.greeting === 'string' ? req.body.greeting.trim() : ''
  if (!greeting || greeting.length > maxGreetingLength) {
    return res.status(400).json({ error: `A mensagem deve ter entre 1 e ${maxGreetingLength} caracteres.` })
  }

  await pool.query(
    `INSERT INTO chat_settings (id, greeting) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET greeting = EXCLUDED.greeting, updated_at = NOW()`,
    [greeting],
  )
  res.json(await getGreetingSettings())
}))

app.delete('/api/admin/chat-settings/greeting', requireStaff, asyncRoute(async (_req, res) => {
  await pool.query('DELETE FROM chat_settings WHERE id = 1')
  res.json(await getGreetingSettings())
}))

app.post('/api/admin/logout', requireStaff, asyncRoute(async (req, res) => {
  await new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()))
  res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
  res.json({ authenticated: false })
}))

app.get('/api/admin/conversations', requireStaff, asyncRoute(async (_req, res) => {
  const result = await pool.query(
    `SELECT c.id, c.status, c.created_at AS "createdAt", c.updated_at AS "updatedAt",
            m.body AS "lastMessage", m.sender AS "lastSender"
       FROM chat_conversations c
       LEFT JOIN LATERAL (
         SELECT body, sender FROM chat_messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1
       ) m ON TRUE
      WHERE c.status = 'open' ORDER BY c.updated_at DESC`,
  )
  res.json({ conversations: result.rows })
}))

app.get('/api/admin/conversations/:id/messages', requireStaff, asyncRoute(async (req, res) => {
  if (!validUuid.test(req.params.id)) return res.status(400).json({ error: 'Conversa inválida.' })
  const exists = await pool.query('SELECT id FROM chat_conversations WHERE id = $1', [req.params.id])
  if (!exists.rowCount) return res.status(404).json({ error: 'Conversa não encontrada.' })
  res.json({ messages: await getMessages(req.params.id) })
}))

app.post('/api/admin/conversations/:id/close', requireStaff, asyncRoute(async (req, res) => {
  if (!validUuid.test(req.params.id)) return res.status(400).json({ error: 'Conversa inválida.' })
  const result = await pool.query("UPDATE chat_conversations SET status = 'closed' WHERE id = $1 AND status = 'open' RETURNING id", [req.params.id])
  if (!result.rowCount) return res.status(404).json({ error: 'Conversa não encontrada ou já encerrada.' })
  io.to(`conversation:${req.params.id}`).emit('chat:closed')
  res.json({ closed: true })
}))

io.engine.use(sessionMiddleware)
io.use((socket, next) => {
  const socketSession = socket.request.session
  if (socketSession?.role === 'staff' || socketSession?.conversationId) return next()
  next(new Error('Sessão do chat inválida.'))
})

io.on('connection', (socket) => {
  const socketSession = socket.request.session
  const isStaff = socketSession.role === 'staff'
  const conversationId = socketSession.conversationId
  if (isStaff) socket.join('staff')
  else socket.join(`conversation:${conversationId}`)

  socket.on('chat:send', async (payload, acknowledge = () => {}) => {
    try {
      if (isStaff) throw new Error('Equipe deve responder pelo painel de atendimento.')
      const message = await createMessage(conversationId, 'visitor', payload?.body)
      io.to('staff').emit('chat:message', message)
      acknowledge({ ok: true, message })
    } catch (error) {
      acknowledge({ ok: false, error: error.message })
    }
  })

  socket.on('staff:send', async (payload, acknowledge = () => {}) => {
    try {
      if (!isStaff || !validUuid.test(payload?.conversationId || '')) throw new Error('Acesso não autorizado.')
      const message = await createMessage(payload.conversationId, 'staff', payload.body)
      io.to(`conversation:${payload.conversationId}`).emit('chat:message', message)
      acknowledge({ ok: true, message })
    } catch (error) {
      acknowledge({ ok: false, error: error.message })
    }
  })
})

const rootPath = fileURLToPath(new URL('..', import.meta.url))
app.use(express.static(path.join(rootPath, 'dist')))
app.get(/^(?!\/api\/|\/socket\.io\/).*/, (_req, res, next) => {
  res.sendFile(path.join(rootPath, 'dist', 'index.html'), (error) => error && next(error))
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Ocorreu um erro no servidor.' })
})

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
await pool.query(schema)
httpServer.listen(port, () => console.log(`Chat server listening on port ${port}`))

const shutdown = async () => {
  httpServer.close()
  await pool.end()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)