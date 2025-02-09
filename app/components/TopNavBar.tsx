'use client'

import React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord, FaReddit } from 'react-icons/fa';
import { Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Main NavBar component
export default function TopNavBar() {
  const pathname = usePathname();
  const isInBlogPost = pathname?.startsWith('/blog/') && pathname !== '/blog';

  return (
    <nav className="fixed top-0 w-full bg-[#111111]/95 backdrop-blur supports-[backdrop-filter]:bg-[#111111]/60 z-50">
      <div className="relative flex h-12 items-center px-4">
        {/* Left - Conditional Logo/Home Button */}
        {isInBlogPost ? (
          <Link 
            href="/blog"
            className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
          >
            <Home size={24} />
            <span className="font-medium">Blog Home</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center">
            <Image 
              src="/darkflows-logo.svg"
              alt="Darkflows Logo" 
              width={180}
              height={45}
              priority={true}
            />
          </Link>
        )}

        {/* Center - Description (hidden on mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <p className="text-sm text-gray-400 whitespace-nowrap">
            Have your CAKE and eat it too... DarkFlows RouterOS
          </p>
        </div>

        {/* Right - Icons */}
        <div className="fixed top-2 right-4 z-50 flex items-center gap-2">
          {/* Discord Icon - Using Discord's brand color */}
          <Link 
            href="https://discord.gg/3QmjpqX2Y5" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5865F2] hover:opacity-80 transition-opacity"
          >
            <FaDiscord size={24} />
          </Link>

          {/* Reddit Icon - Using Reddit's brand color */}
          <Link 
            href="https://www.reddit.com/r/DarkFlows/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF4500] hover:opacity-80 transition-opacity"
          >
            <FaReddit size={24} />
          </Link>

          {/* Support Button - Hidden on mobile */}
          <Link 
            href="https://www.reddit.com/r/DarkFlows/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Support
          </Link>

          {/* Download Button */}
          <Link 
            href="/downloadpage"
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Download
          </Link>
        </div>
      </div>
    </nav>
  )
} 