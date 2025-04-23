// RootLayout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Import the Providers component
import Navbar from "@/components/navbar"; // Import the Navbar component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drone Registry",
  description: "Register your drone flights and manage insurance claims",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Providers> {/* Wrap everything inside Providers */}
            <Navbar /> {/* Navbar inside Providers */}
            {children} {/* Ensure children are also wrapped */}
          </Providers>
        </div>
      </body>
    </html>
  );
}
