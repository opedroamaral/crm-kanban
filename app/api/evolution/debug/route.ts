import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '5511999999999'
  const digits = phone.replace(/\D/g, '')
  const remoteJid = digits.startsWith('55') ? `${digits}@s.whatsapp.net` : `55${digits}@s.whatsapp.net`

  try {
    const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: API_KEY! },
      body: JSON.stringify({ where: { key: { remoteJid } }, limit: 5 }),
    })
    const text = await res.text()
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { parsed = text }

    return NextResponse.json({
      status: res.status,
      remoteJid,
      topLevelKeys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed as object) : typeof parsed,
      raw: parsed,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
