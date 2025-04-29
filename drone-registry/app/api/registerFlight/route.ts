// app/api/registerFlight/route.ts
import { NextResponse } from 'next/server';
import { ethers, JsonRpcProvider, Interface } from 'ethers'; // Import specific classes directly from ethers for v6 compatibility

// Define your contract address and ABI
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your actual contract address

// Initialize the ABI using the Interface class
const contractABI: Interface = new Interface([ /* Your contract ABI here as a JSON array */ ]); // Replace with your actual contract ABI

// Create a provider (assuming you are using a JSON-RPC provider)
const provider = new JsonRpcProvider("YOUR_JSON_RPC_URL"); // Replace with your actual JSON-RPC URL

// Get the signer from the provider (Note: getSigner is async in v6)
const signer = await provider.getSigner(); // Get the signer from the provider

export async function POST(request: Request) {
  // Parse the incoming JSON request body
  const data = await request.json();

  // Create a contract instance using the address and ABI
  const contract = new ethers.Contract(contractAddress, contractABI, signer); // Uses the v6 compatible types

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
        data.flightAreaCenter,
        data.flightAreaRadius,
        data.flightAreaMaxHeight
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
    const errorMessage = (error as Error).message || 'There was an error registering the flight.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}