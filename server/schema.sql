CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('visitor', 'staff')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check CHECK (sender IN ('visitor', 'staff', 'system'));

CREATE TABLE IF NOT EXISTS chat_settings (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  greeting TEXT NOT NULL CHECK (char_length(greeting) BETWEEN 1 AND 1000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_created_idx
  ON chat_messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS chat_conversations_updated_idx
  ON chat_conversations (updated_at DESC);