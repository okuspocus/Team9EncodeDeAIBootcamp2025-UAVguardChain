import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  const flightData = await request.json();

  // Validate the incoming flight data
  if (!flightData || typeof flightData !== 'object') {
    return NextResponse.json({ error: 'Invalid flight data provided.' }, { status: 400 });
  }

  return new Promise((resolve) => {
    const pythonPath = path.resolve(process.cwd(), "backend/llama_validator.py");
    console.log(`Spawning Python script at: ${pythonPath}`);

    const python = spawn('python', [pythonPath]);

    let output = ''; // Standard output
    let errorOutput = ''; // Standard error

    // Capture standard output from the Python script
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture standard error output from the Python script
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle the closing of the Python process
    python.on('close', (code) => {
      console.log(`Python process exited with code: ${code}`);
      console.log("Raw Python stdout:", output); // Log raw standard output
      console.error("Raw Python stderr:", errorOutput); // Log raw standard error output

      try {
        // Attempt to parse the standard output as JSON
        console.log("Attempting to parse Python stdout as JSON...");
        const parsed = JSON.parse(output);
        console.log("Successfully parsed Python output:", parsed); // Log the parsed result

        // Check if the parsed JSON contains an answer field
        if (parsed && typeof parsed === 'object' && parsed.answer !== undefined) {
          console.warn("Warning: Python process exited with a non-zero code:", code);
          return resolve(NextResponse.json({ result: parsed.answer })); // Return success with answer
        }

        // Check if the parsed JSON contains an error field
        if (parsed && typeof parsed === 'object' && parsed.error !== undefined) {
          console.warn("Parsed output contains 'error'. Resolving with application error (200 OK).", parsed.error);
          return resolve(NextResponse.json({ error: parsed.error }, { status: 200 })); // Return error with 200 OK
        }

        // If the output does not contain the expected fields, return a generic error
        console.error("Parsed JSON output has unexpected format (neither 'answer' nor 'error' found).");
        if (code !== 0) {
          return resolve(NextResponse.json({ error: 'Unexpected response format from validation script.' }, { status: 500 })); // Return 500 error
        }
      } catch (e) {
        // Log the error if JSON parsing fails
        console.error("Failed to parse Python output as JSON:", e);
        console.error("Output that caused parsing failure:", output); // Log the problematic output
        if (code !== 0) {
          return resolve(NextResponse.json({ error: "Failed to parse Python output." }, { status: 500 })); // Return 500 error
        }
      }

      // If we reach here, it means we have a non-zero exit code without a clear error
      console.error("Python script exited with a non-zero code without a clear error.");
      return resolve(NextResponse.json({ error: 'Unexpected error during validation.' }, { status: 500 })); // Return 500 error
    });

    // Send flight data via stdin to the Python script
    python.stdin.write(JSON.stringify(flightData));
    python.stdin.end();
  });
}