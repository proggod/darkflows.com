"use client";

import { useEffect, useState } from 'react';
import { HeroSection } from '@/types';
import Image from 'next/image';

interface Props {
  data: HeroSection;
}

const ScrollReveal = ({ data }: Props) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const windowHeight = window.innerHeight;
      // Convert scroll position to percentage (0-100)
      const scrollPercentage = Math.min((position / windowHeight) * 100, 100);
      setScrollPosition(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[200vh] bg-black">
      {/* First section - Initial view */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full relative">
          {/* Text content */}
          <div 
            className="text-white text-center transition-opacity duration-500"
            style={{
              opacity: scrollPosition < 33 ? 1 : 0
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {data.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              {data.subtitle}
            </p>
          </div>

          {/* Laptop image container */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-transparent"
          >
            <div
              className="relative w-full max-w-[900px] transition-all duration-500 bg-transparent"
              style={{
                transform: `scale(${Math.min(1 + scrollPosition / 50, 1.2)})`,
                opacity: Math.min(scrollPosition / 100, 1)
              }}
            >
              <Image
                src={data.image}
                alt="Laptop Display"
                width={900}
                height={600}
                className="w-full h-auto object-contain transition-transform duration-500 bg-transparent"
                style={{
                  transform: `translateY(${scrollPosition > 50 ? 0 : 100}px)`,
                }}
              />
            </div>
          </div>

          {/* Final text overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{
              opacity: scrollPosition > 66 ? 1 : 0
            }}
          >
            <div className="text-white text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {data.finalTitle}
              </h2>
              <p className="text-lg md:text-xl text-gray-300">
                {data.finalSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollReveal; 