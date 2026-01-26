import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// 1. Import the Language Provider
import { LanguageProvider } from "@/lib/language-context"

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: 'TriNetra - Agricultural Intelligence Command Center',
  description: 'AI-powered agricultural intelligence dashboard for market prediction, soil analysis, and credit scoring',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* 2. Wrap the entire app in the Language Provider */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}