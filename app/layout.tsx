import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agent Generator | Build AI agents using LlamaIndex TypeScript",
  description:
    "Create, customize, and test AI agents with a manager-worker topology using LlamaIndex TypeScript, Gemini, and Mistral models.",
  keywords: "AI agents, LlamaIndex, TypeScript, Gemini, Mistral, RAG, agent generator, AI development",
  authors: [{ name: "Blue Lotus", url: "https://lotuschain.org" }],
  creator: "BlueLotus",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: ".",
    title: "Agent Generator | Build AI agents using LlamaIndex TypeScript",
    description: "Create, customize, and test AI agents with a manager-worker topology using LlamaIndex TypeScript.",
    siteName: "Agent Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Generator | Build AI agents using LlamaIndex TypeScript",
    description: "Create, customize, and test AI agents with a manager-worker topology using LlamaIndex TypeScript.",
    creator: "@BlueLotus",
  },
    generator: 'lotuschain.org'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'