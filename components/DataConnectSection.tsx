"use client";

import { useEffect, useState } from 'react';
import { DataConnectSection as DataConnectType } from '@/types';

interface Props {
  data: DataConnectType;
  sectionId: string;
}

const DataConnectSection = ({ data, sectionId }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight - 100;
      setIsVisible(isInView);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionId]);

  return (
    <div id={sectionId} className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-4 flex flex-col lg:flex-row items-center">
        {/* Left content */}
        <div className="w-full lg:w-1/2 space-y-8 px-4 lg:px-0">
          <h2 className={`text-4xl md:text-6xl font-bold text-white transform transition-all duration-1000 
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-32 opacity-0'}`}>
            {data.title}
          </h2>
          
          <p className={`text-gray-300 text-lg md:text-xl transform transition-all duration-1000 delay-200
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-32 opacity-0'}`}>
            {data.description}
          </p>

          <div className="space-y-6">
            {data.features.map((item, index) => (
              <div 
                key={item.title}
                className={`transform transition-all duration-1000 delay-[${(index + 2) * 200}ms]
                  ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-32 opacity-0'}`}
              >
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {item.title}
                </div>
                <div className="text-gray-400">
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right content - Image */}
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
          <div className={`transform transition-all duration-1000 delay-500
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-32 opacity-0'}`}>
            <img
              src={data.image}
              alt="Laptop Display"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataConnectSection; 