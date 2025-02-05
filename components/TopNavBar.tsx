'use client'

import React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord, FaReddit } from 'react-icons/fa';

// Main NavBar component
export default function TopNavBar() {
  return (
    <nav className="fixed top-0 w-full bg-[#111111]/95 backdrop-blur supports-[backdrop-filter]:bg-[#111111]/60 z-50">
      <div className="relative flex h-12 items-center px-4">
        {/* Left - Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center"
          >
            <Image 
              src="/darkflows-logo.svg"
              alt="Darkflows Logo" 
              width={180}
              height={45}
              priority={true}
            />
          </Link>
        </div>

        {/* Center - Description */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <p className="text-sm text-muted-foreground whitespace-nowrap text-gray-400">
            Have your CAKE and eat it too...  DarkFlows RouterOS
          </p>
        </div>

        {/* Right - Icons */}
        <div className="fixed top-2 right-4 z-50 flex items-center gap-2">
          {/* Discord Icon */}
          <Link 
            href="https://discord.gg/3QmjpqX2Y5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaDiscord size={24} />
          </Link>

          {/* Reddit Icon */}
          <Link 
            href="https://www.reddit.com/r/DarkFlows/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaReddit size={24} />
          </Link>

          {/* Support Button */}
          <Link 
            href="https://www.reddit.com/r/DarkFlows/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Support
          </Link>

          {/* Download Button */}
          <Link 
            href="/downloads"
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Download
          </Link>
        </div>
      </div>
    </nav>
  )
} 