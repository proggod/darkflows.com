"use client";

import { useState } from 'react';
import { FAQItem } from '@/types';

interface FAQProps {
  data: {
    title: string;
    subtitle: string;
    items: FAQItem[];
  };
}

const FAQ = ({ data }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{data.title}</h2>
        <p className="text-gray-400">{data.subtitle}</p>
      </div>
      
      <div className="space-y-2">
        {data.items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50 backdrop-blur-sm"
          >
            <button
              className="w-full px-4 py-3 text-left flex justify-between items-center text-white hover:bg-gray-800/50 transition-colors"
              onClick={() => toggleQuestion(index)}
            >
              <span className="text-lg">{item.question}</span>
              <span className="text-2xl transform transition-transform duration-200" style={{
                transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)'
              }}>
                +
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 text-gray-400 border-t border-gray-800">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 