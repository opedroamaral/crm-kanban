import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id: string
  created_at: string
  telefone: string
  nomewpp: string
  atendimento_ia: string | boolean | null
  setor: string | null
  email: string | null
  tipo_terapia: string | null
  status_kanban: string | null
  observacoes: string | null
  atualizado_em: string | null
}

export type KanbanStatus =
  | 'novo_lead'
  | 'contato_feito'
  | 'agendamento_marcado'
  | 'em_atendimento'
  | 'perdido'

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string; bgColor: string }[] =
  [
    { id: 'novo_lead', label: 'Novo Lead', color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-200' },
    { id: 'contato_feito', label: 'Contato Feito', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    { id: 'agendamento_marcado', label: 'Agendamento Marcado', color: 'text-teal-700', bgColor: 'bg-teal-50 border-teal-200' },
    { id: 'em_atendimento', label: 'Em Atendimento', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
    { id: 'perdido', label: 'Perdido', color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200' },
  ]

export const TERAPIA_TYPES = [
  'Ansiedade',
  'Depressão',
  'Terapia de Casal',
  'Terapia Familiar',
  'Transtorno Alimentar',
  'Fobia / TOC',
  'Trauma / PTSD',
  'Desenvolvimento Pessoal',
  'Infantil / Adolescente',
  'Outro',
]

export const TERAPIA_COLORS: Record<string, string> = {
  'Ansiedade': 'bg-amber-100 text-amber-800',
  'Depressão': 'bg-blue-100 text-blue-800',
  'Terapia de Casal': 'bg-pink-100 text-pink-800',
  'Terapia Familiar': 'bg-purple-100 text-purple-800',
  'Transtorno Alimentar': 'bg-orange-100 text-orange-800',
  'Fobia / TOC': 'bg-red-100 text-red-800',
  'Trauma / PTSD': 'bg-slate-100 text-slate-800',
  'Desenvolvimento Pessoal': 'bg-teal-100 text-teal-800',
  'Infantil / Adolescente': 'bg-lime-100 text-lime-800',
  'Outro': 'bg-gray-100 text-gray-700',
}
