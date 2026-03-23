'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, Mail, Bot, User, Edit3, Save, Loader2 } from 'lucide-react'
import { Lead, KANBAN_COLUMNS, TERAPIA_TYPES, TERAPIA_COLORS } from '@/lib/supabase'
import { formatDate, whatsappLink, isAtendimentoIA } from '@/lib/utils'
import { ChatPanel } from './ChatPanel'

type Props = {
  lead: Lead | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>
}

type Tab = 'info' | 'chat'

export function LeadModal({ lead, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('chat')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: '',
    tipo_terapia: '',
    observacoes: '',
    status_kanban: '',
  })

  useEffect(() => {
    if (lead) {
      setForm({
        email: lead.email || '',
        tipo_terapia: lead.tipo_terapia || '',
        observacoes: lead.observacoes || '',
        status_kanban: lead.status_kanban || 'novo_lead',
      })
      setEditing(false)
      setTab('chat')
    }
  }, [lead])

  if (!lead) return null

  const isIA = isAtendimentoIA(lead.atendimento_ia)
  const terapiaColor =
    (form.tipo_terapia && TERAPIA_COLORS[form.tipo_terapia]) || TERAPIA_COLORS['Outro']
  const currentColumn = KANBAN_COLUMNS.find(
    (c) => c.id === (lead.status_kanban || 'novo_lead')
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(lead.id, form)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{lead.nomewpp || 'Sem nome'}</h2>
            {currentColumn && (
              <span className={`text-xs font-medium ${currentColumn.color}`}>
                {currentColumn.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'info' && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors font-medium"
              >
                <Edit3 size={14} />
                Editar
              </button>
            )}
            {tab === 'info' && editing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salvar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setTab('chat')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === 'chat'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Conversa
          </button>
          <button
            onClick={() => setTab('info')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === 'info'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Informações
          </button>
        </div>

        {/* Tab: Chat */}
        {tab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 px-4 py-4">
            <ChatPanel phone={lead.telefone} leadName={lead.nomewpp || 'Lead'} />
          </div>
        )}

        {/* Tab: Info */}
        {tab === 'info' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Contato */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Contato
                </h3>
                <div className="space-y-2">
                  <a
                    href={whatsappLink(lead.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm hover:underline"
                  >
                    <MessageCircle size={15} />
                    {lead.telefone || '—'}
                  </a>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Mail size={15} className="text-gray-400 shrink-0" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="E-mail"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={15} className="text-gray-400" />
                      {lead.email || <span className="text-gray-300">Sem e-mail</span>}
                    </div>
                  )}
                </div>
              </section>

              {/* Atendimento */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Atendimento
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium ${
                      isIA ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {isIA ? <Bot size={13} /> : <User size={13} />}
                    {isIA ? 'Atendido por IA' : 'Atendimento Humano'}
                  </span>
                  {lead.setor && (
                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {lead.setor}
                    </span>
                  )}
                </div>
              </section>

              {/* Tipo de terapia */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Tipo de Terapia / Queixa
                </h3>
                {editing ? (
                  <select
                    value={form.tipo_terapia}
                    onChange={(e) => setForm({ ...form, tipo_terapia: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  >
                    <option value="">Selecionar...</option>
                    {TERAPIA_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : form.tipo_terapia ? (
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${terapiaColor}`}>
                    {form.tipo_terapia}
                  </span>
                ) : (
                  <span className="text-sm text-gray-300">Não informado</span>
                )}
              </section>

              {/* Status */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Estágio no Funil
                </h3>
                {editing ? (
                  <select
                    value={form.status_kanban}
                    onChange={(e) => setForm({ ...form, status_kanban: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  >
                    {KANBAN_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                ) : (
                  currentColumn && (
                    <span className={`text-sm px-3 py-1 rounded-full font-medium bg-white border ${currentColumn.color}`}>
                      {currentColumn.label}
                    </span>
                  )
                )}
              </section>

              {/* Datas */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Datas
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrada:</span>
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                  {lead.atualizado_em && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Atualizado:</span>
                      <span>{formatDate(lead.atualizado_em)}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Observações */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Observações / Notas
                </h3>
                {editing ? (
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    rows={5}
                    placeholder="Adicione notas sobre este lead..."
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                ) : form.observacoes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                    {form.observacoes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-300">Sem observações</p>
                )}
              </section>
            </div>

            {editing && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 text-sm py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 text-sm py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar Alterações
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
