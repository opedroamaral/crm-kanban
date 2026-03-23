import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  const digits = phone.replace(/\D/g, '')
  const base = digits.startsWith('55') ? digits : `55${digits}`

  // Brazilian numbers: try both with and without the 9th digit
  // e.g. 5543984278638 and 554384278638
  const candidates: string[] = [base]
  if (base.length === 13) {
    // Has 9-digit local number — also try without the 9
    const without9 = base.slice(0, 4) + base.slice(5)
    candidates.push(without9)
  } else if (base.length === 12) {
    // Has 8-digit local number — also try with the 9
    const with9 = base.slice(0, 4) + '9' + base.slice(4)
    candidates.push(with9)
  }

  const fetchForJid = async (jid: string) => {
    const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
      body: JSON.stringify({ where: { key: { remoteJid: jid } }, limit: 60 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data?.messages?.records as unknown[]) || []
  }

  try {
    let records: unknown[] = []

    for (const num of candidates) {
      const jid = `${num}@s.whatsapp.net`
      const result = await fetchForJid(jid)
      if (result && result.length > 0) {
        records = result
        break
      }
    }

    return NextResponse.json(records)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
