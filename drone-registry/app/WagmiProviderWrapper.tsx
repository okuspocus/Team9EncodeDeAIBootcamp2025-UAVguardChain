"use client";

import { WagmiProvider } from 'wagmi';
import { createConfig, http } from '@wagmi/core';
import { polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const config = createConfig({
  chains: [polygonAmoy],
  connectors: [injected()],
  transports: {
    [polygonAmoy.id]: http(),
  },
});

export default function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
