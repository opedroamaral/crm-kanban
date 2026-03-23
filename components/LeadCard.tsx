'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageCircle, Bot, User, Calendar } from 'lucide-react'
import { Lead, TERAPIA_COLORS } from '@/lib/supabase'
import { formatDate, whatsappLink, isAtendimentoIA } from '@/lib/utils'

type Props = {
  lead: Lead
  onClick: (lead: Lead) => void
}

export function LeadCard({ lead, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isIA = isAtendimentoIA(lead.atendimento_ia)
  const terapiaColor =
    (lead.tipo_terapia && TERAPIA_COLORS[lead.tipo_terapia]) || TERAPIA_COLORS['Outro']

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 select-none active:shadow-lg"
    >
      {/* Header: name + IA badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
          {lead.nomewpp || 'Sem nome'}
        </span>
        <span
          className={`flex items-center gap-1 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            isIA
              ? 'bg-violet-100 text-violet-700'
              : 'bg-teal-100 text-teal-700'
          }`}
        >
          {isIA ? <Bot size={11} /> : <User size={11} />}
          {isIA ? 'IA' : 'Humano'}
        </span>
      </div>

      {/* Phone */}
      <a
        href={whatsappLink(lead.telefone)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 hover:underline mb-2 w-fit"
      >
        <MessageCircle size={12} />
        {lead.telefone || '—'}
      </a>

      {/* Terapia tag */}
      {lead.tipo_terapia && (
        <span
          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${terapiaColor}`}
        >
          {lead.tipo_terapia}
        </span>
      )}

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <Calendar size={11} />
        {formatDate(lead.created_at)}
      </div>
    </div>
  )
}
