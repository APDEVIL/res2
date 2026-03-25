import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/shared/providers"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title:       "FoodRush",
  description: "Order food from your favourite restaurants",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}