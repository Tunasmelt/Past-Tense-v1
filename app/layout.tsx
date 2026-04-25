import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import OfflineIndicator from '@/components/OfflineIndicator'
import OfflineInitializer from '@/components/OfflineInitializer'
import ArchiveResurface from '@/components/ArchiveResurface'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Manifest',
  description: 'Create beautiful stories with canvas-style editing and immersive reading',
  generator: 'v0.app',
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
      <body className="font-sans antialiased">
        <OfflineInitializer />
        {children}
        <ArchiveResurface />
        <OfflineIndicator />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
