"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

interface CarouselItem {
  title: string;
  description: string;
  imageSrc: string;
}

const FeatureCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [selectedImage, setSelectedImage] = useState<CarouselItem | null>(null);
  const [startPos, setStartPos] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1280) setItemsPerView(4); // xl
      else if (window.innerWidth >= 1024) setItemsPerView(3); // lg
      else if (window.innerWidth >= 768) setItemsPerView(2); // md
      else setItemsPerView(1); // mobile
    };

    const handleScroll = () => {
      const element = document.getElementById('feature-carousel');
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight - 100;
      setIsVisible(isInView);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('resize', updateItemsPerView);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const items: CarouselItem[] = [
    {
      title: "DHCP Leases",
      description: "View and manage active DHCP leases on your network",
      imageSrc: "/active_dhcp_leases.png"
    },
    {
      title: "Bandwidth Statistics",
      description: "Monitor network bandwidth usage and trends",
      imageSrc: "/bandwidth_stats.png"
    },
    {
      title: "Bandwidth Usage",
      description: "Detailed bandwidth consumption analysis",
      imageSrc: "/bandwidth_usage.png"
    },
    {
      title: "Client Blocking",
      description: "Manage blocked clients and access control",
      imageSrc: "/block_clients.png"
    },
    {
      title: "DHCP Reservations",
      description: "Configure static IP assignments for devices",
      imageSrc: "/dhcp_reservations.png"
    },
    {
      title: "Network Ping Statistics",
      description: "Monitor network latency and connectivity",
      imageSrc: "/ping_stats.png"
    },
    {
      title: "Samba Configuration",
      description: "Manage file sharing settings and access",
      imageSrc: "/samba.png"
    },
    {
      title: "Network Services",
      description: "Control and monitor running network services",
      imageSrc: "/services.png"
    },
    {
      title: "System Monitor",
      description: "Track system performance and resources",
      imageSrc: "/system_monitor.png"
    },
    {
      title: "System Settings",
      description: "Configure core system parameters",
      imageSrc: "/system_settings.png"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = items.length - itemsPerView;
      return prev >= maxIndex ? maxIndex : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? 0 : prev - 1
    );
  };

  const openModal = (item: CarouselItem) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setStartPos(e.clientX);
  };

  const handleMouseUp = () => {
    setStartPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startPos === null) return;

    const diff = startPos - e.clientX;
    if (Math.abs(diff) > 50) { // threshold for movement
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setStartPos(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartPos(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setStartPos(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startPos === null) return;

    const diff = startPos - e.touches[0].clientX;
    if (Math.abs(diff) > 50) { // threshold for movement
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setStartPos(null);
    }
  };

  return (
    <>
      <div 
        id="feature-carousel" 
        className={`w-full bg-black py-8 select-none transition-opacity duration-1000
          ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-[95vw] mx-auto">
          <div className="relative">
            <div 
              ref={carouselRef}
              className="overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              <div 
                className="flex gap-2 transition-transform duration-500 ease-out mb-12"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {items.map((item, index) => {
                  const isCenter = index === currentIndex + Math.floor(itemsPerView / 2);
                  return (
                    <div
                      key={index}
                      className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 transition-all duration-300"
                      style={{
                        transform: `scale(${isCenter ? 1.1 : 0.9})`,
                        zIndex: isCenter ? 2 : 1,
                      }}
                    >
                      <div className="rounded-lg overflow-hidden">
                        <div 
                          className="relative w-full flex items-center justify-center cursor-pointer"
                          onClick={() => openModal(item)}
                        >
                          <Image
                            src={item.imageSrc}
                            alt={item.title}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain rounded-lg hover:opacity-90 transition-opacity"
                            priority={false}
                            draggable={false}
                            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              disabled={currentIndex >= items.length - itemsPerView}
            >
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center mt-12 gap-2 pb-8">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal/Popup */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-[90vw] h-full max-h-[85vh] flex flex-col">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <div className="flex flex-col items-center h-full overflow-y-auto py-4">
              <Image
                src={selectedImage.imageSrc}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain"
                priority={true}
              />
              <div 
                className="text-center w-full pb-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-gray-200">
                  {selectedImage.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureCarousel;