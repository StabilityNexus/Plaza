'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  return (
    <header className="w-full absolute top-0 z-50">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        {/* Left side - Plaza name */}
        <div className="flex items-center">
          <h1 className="text-4xl pl-8 font-bold text-black cursor-pointer">
            Plaza
          </h1>
        </div>

        {/* Right side - Connect wallet button */}
        <div className="flex items-center pr-8">
          <ConnectButton />
        </div>
      </div>
    </header>
  )
} 