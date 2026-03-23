import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

// Evolution API v2 (Prisma/PostgreSQL) stores remoteJid directly on the message record.
// Try multiple query formats and return first that has results.
const QUERY_FORMATS = [
  // Format 1: remoteJid direct (v2 Prisma schema)
  (jid: string) => ({ where: { remoteJid: jid }, limit: 60 }),
  // Format 2: nested under key (older format)
  (jid: string) => ({ where: { key: { remoteJid: jid } }, limit: 60 }),
  // Format 3: just number field
  (jid: string) => ({ number: jid.replace('@s.whatsapp.net', ''), limit: 60 }),
]

async function fetchMessages(jid: string): Promise<unknown[]> {
  for (const buildBody of QUERY_FORMATS) {
    const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
      body: JSON.stringify(buildBody(jid)),
    })
    if (!res.ok) continue
    const data = await res.json()

    // Extract records from any known response shape
    const records: unknown[] =
      Array.isArray(data) ? data :
      Array.isArray(data?.messages?.records) ? data.messages.records :
      Array.isArray(data?.records) ? data.records :
      Array.isArray(data?.messages) ? data.messages :
      []

    if (records.length > 0) return records
  }
  return []
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone is required' }, { status: 400 })

  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`

  // Try both Brazilian number formats (with and without the 9th digit)
  const candidates: string[] = [base]
  if (base.length === 13) {
    candidates.push(base.slice(0, 4) + base.slice(5))   // remove 9
  } else if (base.length === 12) {
    candidates.push(base.slice(0, 4) + '9' + base.slice(4)) // add 9
  }

  try {
    for (const num of candidates) {
      const jid = `${num}@s.whatsapp.net`
      const records = await fetchMessages(jid)
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
