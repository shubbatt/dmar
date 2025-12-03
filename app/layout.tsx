import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { LanguageProvider } from "@/lib/language-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "D'Mar Travels - Maldives Adventures & Diving Experiences",
  description:
    "Discover the magic of the Maldives with D'Mar Travels. Expert diving instruction, sport fishing, and unforgettable excursions in paradise.",
  generator: "v0.app",
  icons: {
    icon: "/dmar-logo-final.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <LanguageProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </LanguageProvider>
      </body>
    </html>
  )
}
