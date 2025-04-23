import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { polygonAmoy } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'UAV Flight Registry',
  projectId: 'a101df8f2ea9bc1bde3830d8ab683b74', // ← ⚠️ pega aquí el tuyo
  chains: [polygonAmoy]
})
