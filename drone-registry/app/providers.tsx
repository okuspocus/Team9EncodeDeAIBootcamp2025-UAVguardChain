// providers.tsx
"use client"; // This directive marks the component as a Client Component

import React, { useState } from 'react'; // Import useState for QueryClient initialization
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClientProvider from @tanstack/react-query
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import WagmiProviderWrapper from "./WagmiProviderWrapper"; // Import WagmiProviderWrapper

// This component will render all client-side providers
export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize the QueryClient instance using useState
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <WagmiProviderWrapper> {/* This provides Wagmi context */}
        <ThemeProvider>
          {children} {/* children represents the content of the current page/route */}
        </ThemeProvider>
      </WagmiProviderWrapper>
    </QueryClientProvider>
  );
}