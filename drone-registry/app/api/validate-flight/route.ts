// app/api/validate-flight/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  const flightData = await request.json(); // This should match the structure of `values`

  // Check if flightData is defined and has the necessary properties
  if (!flightData || typeof flightData !== 'object') {
    return NextResponse.json({ error: 'Invalid flight data provided.' }, { status: 400 });
  }

  return new Promise((resolve) => {
    const pythonPath = path.resolve(process.cwd(), "backend/llama_validator.py");
    
    // Ensure flightData is a string or convert it to a string if necessary
    const flightDataString = JSON.stringify(flightData);
    
    const command = `python "${pythonPath}" '${flightDataString.replace(/'/g, "\\'")}'`;

    exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error("Error executing Python script:", error || stderr);
          return resolve(NextResponse.json({ error: 'Error validating flight data.' }, { status: 500 }));
        }
        console.log("Python script output:", stdout); // Log the output for debugging
        resolve(NextResponse.json({ result: stdout }));
      });
  });
}