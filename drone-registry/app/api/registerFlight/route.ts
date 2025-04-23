// app/api/registerFlight/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
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

  // Check if MetaMask is installed
  if (typeof window === 'undefined' || !window.ethereum) {
    // If MetaMask is not installed, return a 400 error response
    return NextResponse.json({ error: 'Please install MetaMask!' }, { status: 400 });
  }

  // Initialize the Ethereum provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(); // Get the signer for sending transactions

  const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address
  const contractABI = [
    {
      inputs: [
        { internalType: "string", name: "droneName", type: "string" },
        // Add other inputs as needed for the full registration
      ],
      name: "registerFlight",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

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