import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visual Intelligence System',
  description: 'AI-powered image analysis platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <div className="flex">
          <Sidebar />
          <main className="ml-64 flex-1 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}