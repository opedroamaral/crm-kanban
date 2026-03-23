'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(msg: any): string {
  // Try top-level text fields first (some Evolution versions flatten the structure)
  if (msg.body) return msg.body
  if (msg.text) return msg.text
  if (msg.content) return msg.content

  const m = msg.message
  if (!m) return ''

  // Standard Baileys message types
  if (m.conversation) return m.conversation
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text
  if (m.imageMessage?.caption) return m.imageMessage.caption
  if (m.imageMessage) return '📷 Imagem'
  if (m.videoMessage?.caption) return m.videoMessage.caption
  if (m.videoMessage) return '🎥 Vídeo'
  if (m.audioMessage) return '🎵 Áudio'
  if (m.stickerMessage) return '🎨 Sticker'
  if (m.documentMessage) return `📄 ${m.documentMessage.fileName || 'Documento'}`
  if (m.locationMessage) return '📍 Localização'
  if (m.contactMessage) return `👤 Contato: ${m.contactMessage.displayName || ''}`
  if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText
  if (m.listResponseMessage?.title) return m.listResponseMessage.title
  if (m.templateButtonReplyMessage?.selectedDisplayText) return m.templateButtonReplyMessage.selectedDisplayText
  if (m.reactionMessage?.text) return `Reagiu: ${m.reactionMessage.text}`

  // Fallback: find any string value in the message object
  const firstString = Object.values(m).find((v) => typeof v === 'string' && v.length > 0)
  if (firstString) return firstString as string

  return '📎 Mídia'
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  phone: string | null
  leadName: string
}

export function ChatPanel({ phone, leadName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    if (!phone) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/evolution/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar mensagens')

      // API route already normalizes to a flat array
      const msgs: Message[] = Array.isArray(data) ? data : []

      const sorted = [...msgs].sort((a, b) => (a.messageTimestamp ?? 0) - (b.messageTimestamp ?? 0))
      setMessages(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversa')
    } finally {
      setLoading(false)
    }
  }, [phone])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !phone || sending) return
    const msgText = text.trim()
    setText('')
    setSending(true)

    // Optimistic message
    const optimistic: Message = {
      key: { id: `tmp-${Date.now()}`, fromMe: true, remoteJid: '' },
      message: { conversation: msgText },
      messageTimestamp: Math.floor(Date.now() / 1000),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch('/api/evolution/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, text: msgText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      // Refresh after a small delay to get the real message
      setTimeout(fetchMessages, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m.key.id !== optimistic.key.id))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!phone) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Sem telefone cadastrado
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Conversa WhatsApp
        </span>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-[#ece5dd] rounded-xl p-3 space-y-2 min-h-[240px] max-h-[340px]">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-20 gap-2 text-gray-500 text-xs">
            <Loader2 size={14} className="animate-spin" />
            Carregando conversa...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-xs">
            Nenhuma mensagem encontrada
          </div>
        )}

        {messages.map((msg, i) => {
          // fromMe can live in key.fromMe or directly on the message
          const isMe = msg?.key?.fromMe ?? msg?.fromMe ?? false
          const content = extractText(msg)
          if (!content) return null
          const msgId = msg?.key?.id || msg?.id || `msg-${i}`
          const msgTs = msg?.messageTimestamp || msg?.timestamp || 0

          return (
            <div
              key={msgId}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 shadow-sm text-sm ${
                  isMe
                    ? 'bg-[#dcf8c6] text-gray-800 rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                {!isMe && (
                  <p className="text-[11px] font-semibold text-violet-600 mb-0.5">
                    {leadName}
                  </p>
                )}
                <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                <p className="text-[10px] text-gray-400 text-right mt-0.5">
                  {formatTime(msgTs)}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Digite uma mensagem... (Enter para enviar)"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="px-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40 flex items-center justify-center"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
