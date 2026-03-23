'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Filters } from '@/lib/hooks/useLeads'
import { TERAPIA_TYPES } from '@/lib/supabase'
import { useState } from 'react'

type Props = {
  filters: Filters
  setFilters: (f: Filters) => void
  setores: string[]
}

export function FilterBar({ filters, setFilters, setores }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters =
    filters.tipo_terapia ||
    filters.setor ||
    filters.atendimento_ia ||
    filters.dateRange

  const clearAll = () => {
    setFilters({
      search: '',
      tipo_terapia: '',
      setor: '',
      atendimento_ia: '',
      dateRange: '',
      dateFrom: '',
      dateTo: '',
    })
    setShowAdvanced(false)
  }

  return (
    <div className="space-y-2">
      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors font-medium ${
            showAdvanced || hasActiveFilters
              ? 'bg-violet-50 border-violet-200 text-violet-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {(hasActiveFilters || filters.search) && (
          <button
            onClick={clearAll}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Tipo de terapia */}
          <select
            value={filters.tipo_terapia}
            onChange={(e) => setFilters({ ...filters, tipo_terapia: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          >
            <option value="">Tipo de terapia</option>
            {TERAPIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Setor */}
          {setores.length > 0 && (
            <select
              value={filters.setor}
              onChange={(e) => setFilters({ ...filters, setor: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            >
              <option value="">Setor</option>
              {setores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Atendimento */}
          <select
            value={filters.atendimento_ia}
            onChange={(e) => setFilters({ ...filters, atendimento_ia: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          >
            <option value="">Atendimento</option>
            <option value="IA">IA</option>
            <option value="Humano">Humano</option>
          </select>

          {/* Date range */}
          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value, dateFrom: '', dateTo: '' })
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          >
            <option value="">Período</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="custom">Personalizado</option>
          </select>

          {filters.dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
