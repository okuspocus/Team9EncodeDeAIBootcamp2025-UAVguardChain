// app/api/registerFlight/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import OpenAI from 'openai';

export async function POST(request: Request) {
  // Check if the OpenAI API key is set
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key is not set. Please set OPENAI_API_KEY in your environment.' }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Parse the incoming JSON request body
  const data = await request.json();

  // Check if the required fields are present
  if (!data.droneName) {
    // If droneName is missing, return a 400 error response
    return NextResponse.json({ error: 'Drone name is required' }, { status: 400 });
  }

  // Use OpenAI to determine if droneName is a number
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an API validator. Respond only with true if the input is a number, or false if it is not. Do not explain.'
        },
        {
          role: 'user',
          content: `Is this a number? ${data.droneName}`
        }
      ],
      max_tokens: 5,
    });

    const aiResponse = completion.choices[0].message.content.trim().toLowerCase();
    const result = aiResponse === 'true';
    return NextResponse.json({ result });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to validate droneName with OpenAI.' }, { status: 500 });
  }
}