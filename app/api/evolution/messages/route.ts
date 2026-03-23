import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400 })

  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`

  // Try both BR number formats (with/without 9th digit)
  const candidates = [base]
  if (base.length === 13) candidates.push(base.slice(0, 4) + base.slice(5))
  else if (base.length === 12) candidates.push(base.slice(0, 4) + '9' + base.slice(4))

  try {
    for (const num of candidates) {
      const jid = `${num}@s.whatsapp.net`

      const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
        // remoteJid_direct: server filters both fromMe and @lid incoming messages correctly
        body: JSON.stringify({ where: { remoteJid: jid }, limit: 100 }),
      })

      if (!res.ok) continue
      const data = await res.json()

      const records: unknown[] =
        Array.isArray(data?.messages?.records) ? data.messages.records :
        Array.isArray(data?.records) ? data.records :
        Array.isArray(data) ? data : []

      if (records.length > 0) return NextResponse.json(records)
    }

    return NextResponse.json([])
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
