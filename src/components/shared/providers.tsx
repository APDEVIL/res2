"use client"

import { TRPCReactProvider } from "@/trpc/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
    >
      <TRPCReactProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:       "bg-zinc-900 border border-white/10 text-white",
              title:       "text-white font-medium",
              description: "text-white/60",
              success:     "border-emerald-500/30",
              error:       "border-red-500/30",
              actionButton: "bg-orange-500 text-white",
            },
          }}
        />
      </TRPCReactProvider>
    </ThemeProvider>
  )
}