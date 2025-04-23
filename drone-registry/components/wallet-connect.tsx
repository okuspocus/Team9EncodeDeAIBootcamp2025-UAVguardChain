// components/wallet-connect.tsx

"use client"

// Import necessary Wagmi hooks and UI components
import { useConnect } from "wagmi"; // Import the useConnect hook
import { injected } from '@wagmi/connectors'; // Correct import for the injected connector
import { Button } from "@/components/ui/button"; // Button component
import { Loader2, Wallet } from "lucide-react"; // Import Loader2 and Wallet from lucide-react

export function WalletConnect() { // Refactored to take no props
  // Use the useConnect hook provided by wagmi
  const { connectors, connect, isPending } = useConnect();

  // Find the injected connector (e.g., MetaMask, WalletConnect browser extension)
  const injectedConnector = connectors.find(c => c.name === 'Injected'); // Use the connector's name instead of id

  return (
    <Button
      onClick={() => {
        // Call the connect function with the desired connector
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        } else {
          // Handle case where injected connector is not found (e.g., no MetaMask)
          alert("Injected wallet not found. Please install MetaMask or a similar extension.");
        }
      }}
      // Disable button while connection is pending
      disabled={isPending}
      className="flex items-center space-x-2" // Use your styling classes
    >
      {/* Show loading spinner if connection is pending */}
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}