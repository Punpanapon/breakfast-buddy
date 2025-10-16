import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Breakfast Buddy',
  description: 'Never skip breakfast again',
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <nav className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-blue-600">
                🍳 Breakfast Buddy
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Today</Link>
                <Link href="/meals" className="text-gray-600 hover:text-gray-900">Meals</Link>
                <Link href="/history" className="text-gray-600 hover:text-gray-900">History</Link>
                <Link href="/streak" className="text-gray-600 hover:text-gray-900">Streak</Link>
                <Link href="/game" className="text-gray-600 hover:text-gray-900">Game</Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}