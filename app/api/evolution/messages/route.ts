import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400 })

  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`

  // Both BR number formats (with/without 9th digit)
  const candidates = [base]
  if (base.length === 13) candidates.push(base.slice(0, 4) + base.slice(5))
  else if (base.length === 12) candidates.push(base.slice(0, 4) + '9' + base.slice(4))
  const jids = candidates.map((n) => `${n}@s.whatsapp.net`)

  try {
    const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
      body: JSON.stringify({ limit: 200 }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()

    const all: unknown[] =
      Array.isArray(data) ? data :
      Array.isArray(data?.messages?.records) ? data.messages.records :
      Array.isArray(data?.records) ? data.records :
      Array.isArray(data?.messages) ? data.messages :
      []

    // Filter by phone number on our side
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = all.filter((m: any) => {
      const jid: string =
        m?.key?.remoteJid || m?.remoteJid || ''
      return jids.some((j) => jid.includes(j) || j.includes(jid.replace('@s.whatsapp.net', '')))
    })

    return NextResponse.json(filtered)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
