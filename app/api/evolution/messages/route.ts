import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  // Format: 5511999999999@s.whatsapp.net
  const digits = phone.replace(/\D/g, '')
  const remoteJid = digits.startsWith('55')
    ? `${digits}@s.whatsapp.net`
    : `55${digits}@s.whatsapp.net`

  try {
    const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY!,
      },
      body: JSON.stringify({
        where: {
          key: { remoteJid },
        },
        limit: 50,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    // Log raw response to help debug format
    console.log('[Evolution API] raw response keys:', JSON.stringify(Object.keys(data)))
    console.log('[Evolution API] raw response (truncated):', JSON.stringify(data).slice(0, 500))
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
