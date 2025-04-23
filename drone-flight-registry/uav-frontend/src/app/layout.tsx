import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WagmiWrapper } from '@/components/WagmiWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UAV Flight Registry',
  description: 'Register your drone flights on Polygon Amoy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiWrapper>
          {children}
        </WagmiWrapper>
      </body>
    </html>
  )
}
