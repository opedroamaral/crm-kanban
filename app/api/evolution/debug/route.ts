import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '5511999999999'
  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`
  const jid = `${base}@s.whatsapp.net`

  const bodies = [
    { label: 'remoteJid_direct', body: { where: { remoteJid: jid }, limit: 3 } },
    { label: 'key_remoteJid', body: { where: { key: { remoteJid: jid } }, limit: 3 } },
    { label: 'number_only', body: { number: base, limit: 3 } },
    { label: 'no_filter', body: { limit: 3 } },
  ]

  const results: Record<string, unknown> = {}

  for (const { label, body } of bodies) {
    try {
      const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
        body: JSON.stringify(body),
      })
      const text = await res.text()
      let parsed: unknown
      try { parsed = JSON.parse(text) } catch { parsed = text }
      results[label] = { status: res.status, data: parsed }
    } catch (err) {
      results[label] = { error: String(err) }
    }
  }

  return NextResponse.json({ jid, results })
}
