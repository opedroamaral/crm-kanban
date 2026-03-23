'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

import { KANBAN_COLUMNS, Lead, KanbanStatus } from '@/lib/supabase'
import { useLeads } from '@/lib/hooks/useLeads'
import { KanbanColumn } from './KanbanColumn'
import { LeadCard } from './LeadCard'
import { LeadModal } from './LeadModal'
import { NewLeadModal } from './NewLeadModal'
import { FilterBar } from './FilterBar'

export function KanbanBoard() {
  const {
    leads,
    loading,
    error,
    filters,
    setFilters,
    updateLeadStatus,
    updateLead,
    createLead,
    refetch,
  } = useLeads()

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localLeads, setLocalLeads] = useState<Lead[] | null>(null)

  // Use localLeads during drag, otherwise use server leads
  const displayLeads = localLeads || leads

  // Derive unique setores for filter
  const setores = useMemo(() => {
    const s = new Set(leads.map((l) => l.setor).filter(Boolean) as string[])
    return Array.from(s).sort()
  }, [leads])

  const getLeadsForColumn = (colId: KanbanStatus) =>
    displayLeads.filter(
      (l) => (l.status_kanban || 'novo_lead') === colId
    )

  const activeLead = activeId ? displayLeads.find((l) => l.id === activeId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setLocalLeads(leads) // snapshot for optimistic updates
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !localLeads) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    // Check if over a column or a card
    const overColumn = KANBAN_COLUMNS.find((c) => c.id === overId)
    const overLead = localLeads.find((l) => l.id === overId)

    if (!overColumn && !overLead) return

    const targetStatus = overColumn
      ? (overId as KanbanStatus)
      : ((overLead?.status_kanban || 'novo_lead') as KanbanStatus)

    setLocalLeads((prev) => {
      if (!prev) return prev
      return prev.map((l) =>
        l.id === activeLeadId ? { ...l, status_kanban: targetStatus } : l
      )
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !localLeads) {
      setLocalLeads(null)
      return
    }

    const activeLeadId = active.id as string
    const overId = over.id as string

    const activeLd = localLeads.find((l) => l.id === activeLeadId)
    if (!activeLd) {
      setLocalLeads(null)
      return
    }

    const newStatus = activeLd.status_kanban as KanbanStatus

    // Commit optimistic state
    setLocalLeads(null)

    try {
      await updateLeadStatus(activeLeadId, newStatus || 'novo_lead')
    } catch {
      // Revert on error
      refetch()
    }

    void overId // suppress unused var warning
  }

  const handleCardClick = (lead: Lead) => {
    // Find from live leads to get fresh data
    const fresh = leads.find((l) => l.id === lead.id) || lead
    setSelectedLead(fresh)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">CRM Kanban</h1>
          <p className="text-xs text-gray-400 mt-0.5">Clínica de Terapia & Psicologia</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Novo Lead
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 shrink-0">
        <FilterBar filters={filters} setFilters={setFilters} setores={setores} />
      </div>

      {/* Loading / Error states */}
      {loading && !displayLeads.length && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Carregando leads...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            onClick={refetch}
            className="ml-auto text-rose-600 hover:text-rose-800 underline text-xs"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Kanban board */}
      {(!loading || displayLeads.length > 0) && !error && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 px-6 py-4 h-full items-start">
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  color={col.color}
                  bgColor={col.bgColor}
                  leads={getLeadsForColumn(col.id)}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeLead && (
              <div className="rotate-2 scale-105">
                <LeadCard lead={activeLead} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={async (id, updates) => {
            await updateLead(id, updates)
            // Refresh selected lead with updated data
            const updated = leads.find((l) => l.id === id)
            if (updated) setSelectedLead({ ...updated, ...updates })
          }}
        />
      )}

      {/* New lead modal */}
      {showNewModal && (
        <NewLeadModal
          onClose={() => setShowNewModal(false)}
          onCreate={createLead}
        />
      )}
    </div>
  )
}
