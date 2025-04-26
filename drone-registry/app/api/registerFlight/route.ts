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
  if (data.droneModel && !data.serialNumber) {
    // If droneModel is provided but serialNumber is missing, return a 400 error response
    return NextResponse.json({ error: 'Serial number is required for full registration' }, { status: 400 });
  }
  // Add more validations as needed...

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

  // Create a contract instance using the address and ABI
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    let tx;
    // Check if it's a full registration or basic registration based on the presence of droneModel
    if (data.droneModel) {
      // Full registration
      tx = await contract.registerFlight(
        data.droneName,
        data.droneModel,
        data.serialNumber,
        data.weight,
        data.flightPurpose,
        data.flightDescription,
        data.flightDate,
        data.startTime,
        data.endTime,
        data.location,
        data.altitude
      );
    } else {
      // Basic registration
      tx = await contract.registerFlight(data.droneName);
    }
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Flight registered successfully:", tx);
    // Return a success message to the frontend
    return NextResponse.json({ message: 'Flight registered successfully!' });
  } catch (error) {
    console.error("Error registering flight:", error);
    // Type assertion to handle the error as an instance of Error
    const errorMessage = (error as Error).message || 'There was an error registering the flight.';
    // Return a 500 error response if there was an error during the transaction
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}