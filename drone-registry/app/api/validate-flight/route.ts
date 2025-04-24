import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  const flightData = await request.json();

  if (!flightData || typeof flightData !== 'object') {
    return NextResponse.json({ error: 'Invalid flight data provided.' }, { status: 400 });
  }

  return new Promise((resolve) => {
    const pythonPath = path.resolve(process.cwd(), "backend/llama_validator.py");

    const python = spawn('python', [pythonPath]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 || errorOutput) {
        console.error("Python error:", errorOutput);
        return resolve(NextResponse.json({ error: 'Error validating flight data.' }, { status: 500 }));
      }

      resolve(NextResponse.json({ result: output }));
    });

    // Send flight data via stdin
    python.stdin.write(JSON.stringify(flightData));
    python.stdin.end();
  });
}
