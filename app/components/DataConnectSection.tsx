"use client";

import { useEffect, useState } from 'react';
import { DataConnectSection as DataConnectType } from '@/types';
import Image from 'next/image';

interface Props {
  data: DataConnectType;
  sectionId: string;
  imageOnRight?: boolean;
}

const DataConnectSection = ({ data, sectionId, imageOnRight = true }: Props) => {
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
    <div id={sectionId} className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-4 flex flex-col lg:flex-row items-center">
        {/* Content section */}
        <div className={`w-full lg:w-1/2 space-y-8 px-4 lg:px-0 ${
          imageOnRight ? 'lg:pr-8' : 'lg:pl-8 lg:order-2'
        }`}>
          <h2 className={`text-4xl md:text-6xl font-bold text-white transform transition-all duration-1000 
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? '-translate-x-32' : 'translate-x-32'} opacity-0`}`}>
            {data.title}
          </h2>
          
          <p className={`text-gray-300 text-lg md:text-xl transform transition-all duration-1000 delay-200
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? '-translate-x-32' : 'translate-x-32'} opacity-0`}`}>
            {data.description}
          </p>

          <div className="space-y-6">
            {data.features.map((item, index) => (
              <div 
                key={item.title}
                className={`transform transition-all duration-1000 delay-[${(index + 2) * 200}ms]
                  ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? '-translate-x-32' : 'translate-x-32'} opacity-0`}`}
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

        {/* Image section */}
        <div className={`w-full lg:w-1/2 mt-12 lg:mt-0 ${
          imageOnRight ? 'lg:order-2' : 'lg:order-1'
        }`}>
          <div className={`transform transition-all duration-1000 delay-500
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? 'translate-x-32' : '-translate-x-32'} opacity-0`}`}>
            <Image
              src={data.image}
              alt="Feature illustration"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataConnectSection; 