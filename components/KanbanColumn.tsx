'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Lead } from '@/lib/supabase'
import { LeadCard } from './LeadCard'

type Props = {
  id: string
  label: string
  color: string
  bgColor: string
  leads: Lead[]
  onCardClick: (lead: Lead) => void
}

export function KanbanColumn({ id, label, color, bgColor, leads, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      className={`flex flex-col rounded-2xl border ${bgColor} min-w-[280px] w-[280px] shrink-0 transition-colors ${
        isOver ? 'ring-2 ring-offset-1 ring-violet-300' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
        <h2 className={`font-semibold text-sm ${color}`}>{label}</h2>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${color}`}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-col gap-3 p-3 flex-1 min-h-[120px]"
        >
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onCardClick} />
          ))}
          {leads.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-6 select-none">
              Nenhum lead aqui
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
