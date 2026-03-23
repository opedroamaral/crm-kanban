import { useState, useEffect, useCallback } from 'react'
import { supabase, Lead, KanbanStatus } from '@/lib/supabase'

export type Filters = {
  search: string
  tipo_terapia: string
  setor: string
  atendimento_ia: string
  dateRange: string
  dateFrom: string
  dateTo: string
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  tipo_terapia: '',
  setor: '',
  atendimento_ia: '',
  dateRange: '',
  dateFrom: '',
  dateTo: '',
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('dados_cliente')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.search) {
        query = query.or(
          `nomewpp.ilike.%${filters.search}%,telefone.ilike.%${filters.search}%`
        )
      }

      if (filters.tipo_terapia) {
        query = query.eq('tipo_terapia', filters.tipo_terapia)
      }

      if (filters.setor) {
        query = query.eq('setor', filters.setor)
      }

      if (filters.atendimento_ia) {
        query = query.eq('atendimento_ia', filters.atendimento_ia)
      }

      if (filters.dateRange === '7d') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        query = query.gte('created_at', d.toISOString())
      } else if (filters.dateRange === '30d') {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        query = query.gte('created_at', d.toISOString())
      } else if (filters.dateRange === 'custom' && filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString())
        if (filters.dateTo) {
          const to = new Date(filters.dateTo)
          to.setHours(23, 59, 59, 999)
          query = query.lte('created_at', to.toISOString())
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setLeads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('dados_cliente_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dados_cliente' },
        () => {
          fetchLeads()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeads])

  const updateLeadStatus = async (leadId: string, newStatus: KanbanStatus) => {
    const { error } = await supabase
      .from('dados_cliente')
      .update({ status_kanban: newStatus, atualizado_em: new Date().toISOString() })
      .eq('id', leadId)

    if (error) throw error

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status_kanban: newStatus, atualizado_em: new Date().toISOString() } : l
      )
    )
  }

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    const payload = { ...updates, atualizado_em: new Date().toISOString() }
    const { error } = await supabase
      .from('dados_cliente')
      .update(payload)
      .eq('id', leadId)

    if (error) throw error

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...payload } : l))
    )
  }

  const createLead = async (data: {
    nomewpp: string
    telefone: string
    email?: string
    tipo_terapia?: string
    observacoes?: string
  }) => {
    const { data: newLead, error } = await supabase
      .from('dados_cliente')
      .insert({
        ...data,
        status_kanban: 'novo_lead',
        atendimento_ia: 'Humano',
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    setLeads((prev) => [newLead, ...prev])
    return newLead
  }

  return {
    leads,
    loading,
    error,
    filters,
    setFilters,
    updateLeadStatus,
    updateLead,
    createLead,
    refetch: fetchLeads,
  }
}
