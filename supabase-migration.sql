-- Run this in the Supabase SQL Editor to add the CRM columns
ALTER TABLE dados_cliente
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS tipo_terapia TEXT,
  ADD COLUMN IF NOT EXISTS status_kanban TEXT DEFAULT 'novo_lead',
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT now();

-- Enable Row Level Security (keep public access for now since there's no auth)
-- If you want to lock it down later, add a policy here.
