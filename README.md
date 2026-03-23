# CRM Kanban — Clínica de Terapia & Psicologia

CRM estilo Kanban para gerenciar leads de clínica de terapia/psicologia. Integrado ao Supabase, consome leads gerados automaticamente via n8n + Evolution API (WhatsApp).

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Estilo:** Tailwind CSS
- **Banco de dados:** Supabase (PostgreSQL)
- **Drag and drop:** @dnd-kit
- **Deploy:** Vercel

## Setup

### 1. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 2. Migração do Supabase

Execute o arquivo `supabase-migration.sql` no SQL Editor do Supabase para adicionar as colunas do CRM à tabela `dados_cliente`:

```sql
ALTER TABLE dados_cliente
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS tipo_terapia TEXT,
  ADD COLUMN IF NOT EXISTS status_kanban TEXT DEFAULT 'novo_lead',
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT now();
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Faça push do repositório para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático a cada push na branch `main`

## Funcionalidades

- **Quadro Kanban** com 5 colunas: Novo Lead → Contato Feito → Agendamento Marcado → Em Atendimento → Perdido
- **Drag and drop** para mover leads entre colunas (atualiza Supabase em tempo real)
- **Cards** com nome, telefone (link WhatsApp), tipo de terapia e data de entrada
- **Modal de detalhes** com edição de e-mail, tipo de terapia, status e observações
- **Criar lead manualmente** via botão "+ Novo Lead"
- **Filtros:** busca por nome/telefone, tipo de terapia, setor, tipo de atendimento e período
- **Realtime:** novos leads do n8n aparecem automaticamente via Supabase Realtime

## Estrutura do projeto

```
app/
  page.tsx          — Página principal
  layout.tsx        — Layout global
  globals.css       — Estilos globais + animações
components/
  KanbanBoard.tsx   — Componente principal com DnD
  KanbanColumn.tsx  — Coluna do Kanban
  LeadCard.tsx      — Card do lead (arrastável)
  LeadModal.tsx     — Modal de detalhes/edição
  NewLeadModal.tsx  — Modal de criação de lead
  FilterBar.tsx     — Barra de busca e filtros
lib/
  supabase.ts       — Cliente Supabase + tipos + constantes
  utils.ts          — Funções utilitárias (formatação, WhatsApp link)
  hooks/
    useLeads.ts     — Hook principal de dados (fetch, filtros, CRUD)
```
