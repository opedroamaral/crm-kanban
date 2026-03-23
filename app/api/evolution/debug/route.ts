import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '5511999999999'
  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`

  const candidates: string[] = [base]
  if (base.length === 13) {
    candidates.push(base.slice(0, 4) + base.slice(5))
  } else if (base.length === 12) {
    candidates.push(base.slice(0, 4) + '9' + base.slice(4))
  }

  const results: Record<string, unknown> = {}

  for (const num of candidates) {
    const jid = `${num}@s.whatsapp.net`
    try {
      const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
        body: JSON.stringify({ where: { key: { remoteJid: jid } }, limit: 3 }),
      })
      const text = await res.text()
      let parsed: unknown
      try { parsed = JSON.parse(text) } catch { parsed = text }
      results[jid] = { status: res.status, data: parsed }
    } catch (err) {
      results[jid] = { error: String(err) }
    }
  }

  return NextResponse.json(results)
}
