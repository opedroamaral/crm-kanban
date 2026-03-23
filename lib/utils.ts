export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  // Remove non-digits
  const digits = phone.replace(/\D/g, '')
  // Already has country code
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`
  return `55${digits}`
}

export function whatsappLink(phone: string | null): string {
  if (!phone) return '#'
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) return `https://wa.me/${digits}`
  return `https://wa.me/55${digits}`
}

export function isAtendimentoIA(val: string | boolean | null): boolean {
  if (val === null || val === undefined) return false
  if (typeof val === 'boolean') return val
  const lower = String(val).toLowerCase()
  return lower === 'true' || lower === 'ia' || lower === 'sim' || lower === '1'
}
