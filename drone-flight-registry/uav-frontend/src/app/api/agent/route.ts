// File: src/app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server'

let chatHistory: { type: 'human' | 'ai'; content: string }[] = []

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    const response = await fetch('http://localhost:3010/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: message,
        chat_history: chatHistory
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Agent failed')
    }

    const data = await response.json()

    // Añadir los mensajes a chatHistory
    chatHistory.push({ type: 'human', content: message })
    chatHistory.push({ type: 'ai', content: data.result || '' })

    return NextResponse.json({
      reply: data.result || 'No se recibió respuesta del agente.',
      mcpConnections: data.tools || []
    })
  } catch (err: any) {
    console.error('MCP Agent Error:', err.message)
    return NextResponse.json(
      {
        reply: 'No se recibió respuesta del agente.',
        mcpConnections: []
      },
      { status: 500 }
    )
  }
}
