// app/api/validate-flight/route.ts
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
        if (!output.trim()) {
          // If Python exits with 0 but produces no output, it might still be an issue
          if (code === 0) {
            console.error("Python script exited with code 0 but produced no output.");
            return resolve(NextResponse.json({ error: 'Validation script produced no output.' }, { status: 500 }));
          }
          // If non-zero code, the error output should explain, but handle empty stdout just in case.
          throw new Error("No output from Python script.");
        }

        const parsed = JSON.parse(output);
        console.log("Successfully parsed Python output:", parsed); // Log the parsed result

        // *** MODIFICATION START ***

        // Check if the parsed JSON contains the expected results from llama_validator.py
        if (parsed && typeof parsed === 'object' && parsed.compliance_messages !== undefined && Array.isArray(parsed.compliance_messages) && parsed.dataHash !== undefined && parsed.ipfsCid !== undefined) {
          // Return the parsed data in the structure expected by the frontend's ValidationResult interface
          return resolve(NextResponse.json({
            result: { // 'result' should be an object
              complianceMessages: parsed.compliance_messages, // The messages array goes here
              dataHash: parsed.dataHash, // dataHash goes inside 'result'
              ipfsCid: parsed.ipfsCid,   // ipfsCid goes inside 'result'
            }
          }));
        }

        // Check if the parsed JSON contains an error field
        if (parsed && typeof parsed === 'object' && parsed.error !== undefined) {
          console.error("Python script returned a specific error:", parsed.error);
          // Return error with a 500 status code, as it's a processing error
          return resolve(NextResponse.json({ error: parsed.error }, { status: 500 }));
        }

        // If the output was parsed but doesn't match the expected success or error formats
        console.error("Parsed JSON output has unexpected format:", parsed); // Log the actual parsed data
        return resolve(NextResponse.json({ error: 'Unexpected response format from validation script.' }, { status: 500 }));

        // *** MODIFICATION END ***

      } catch (e) {
        // Log the error if JSON parsing fails or other unexpected errors occur within the try block
        console.error("Failed to parse Python output as JSON or other processing error:", e); // Log the problematic output
        // If Python exited with a non-zero code, and we failed to parse or got an unexpected JS error here
        if (code !== 0) {
          return resolve(NextResponse.json({ error: `Processing failed: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 }));
        } else {
          // If Python exited with code 0 but we failed to parse or got JS error, it's still an internal issue
          return resolve(NextResponse.json({ error: `Unexpected error processing script output: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 }));
        }
      }

      // If we reach here, it implies Python exited with a non-zero code and no parsable output/error was produced
      console.error(`Python script exited with a non-zero code (${code}) without a clear output or error.`);
      return resolve(NextResponse.json({ error: `Validation script failed with exit code ${code}.` }, { status: 500 }));
    });

    // Send flight data via stdin to the Python script
    python.stdin.write(JSON.stringify(flightData));
    python.stdin.end();
  });
}