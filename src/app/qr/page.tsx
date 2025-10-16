'use client'

import QRCode from 'qrcode.react'

export default function QRPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">🍳 Breakfast Buddy</h1>
        
        <div className="mb-6">
          <QRCode 
            value={appUrl}
            size={256}
            level="M"
            includeMargin={true}
          />
        </div>
        
        <div className="text-sm text-gray-600 break-all max-w-xs">
          {appUrl}
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Scan to open Breakfast Buddy
        </p>
      </div>
    </div>
  )
}