import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/shared/providers"
// Verify this path: if it's in src/styles/globals.css, use this:

import "@/styles/globals.css" 
// If the error persists, try: import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FoodRush",
  description: "Order food from your favourite restaurants",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-zinc-950 min-h-screen antialiased text-white`}
      >
        <Providers>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}