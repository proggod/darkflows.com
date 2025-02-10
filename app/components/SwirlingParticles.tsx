'use client';
import React, { useState, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  animationDuration: number;
  delay: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
  driftSpeed: number;
}

const SwirlingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: 150 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.2 
          ? Math.random() * 6 + 4  // 20% chance of larger particles (4-10px)
          : Math.random() * 2 + 1, // 80% chance of smaller particles (1-3px)
        animationDuration: Math.random() * 10 + 15,
        delay: Math.random() * -15,
        opacity: Math.random() * 0.5 + 0.3, // Increased opacity
        color: `rgb(${220 + Math.random() * 35}, ${20 + Math.random() * 20}, ${20 + Math.random() * 20})`,
        pulseSpeed: 3 + Math.random() * 2,
        driftSpeed: 20 + Math.random() * 10
      }));
    };

    setParticles(generateParticles());
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen overflow-hidden bg-black">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animation: `
              swirl ${particle.animationDuration}s infinite linear,
              pulse ${particle.pulseSpeed}s infinite ease-in-out,
              drift ${particle.driftSpeed}s infinite ease-in-out
            `,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      <style jsx>{`
        @keyframes swirl {
          0% {
            transform: rotate(0deg) translateY(0) scale(1);
          }
          33% {
            transform: rotate(120deg) translateY(40px) scale(1.2);
          }
          66% {
            transform: rotate(240deg) translateY(-40px) scale(0.8);
          }
          100% {
            transform: rotate(360deg) translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }

        @keyframes drift {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(100px, 100px);
          }
          50% {
            transform: translate(0, 200px);
          }
          75% {
            transform: translate(-100px, 100px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default SwirlingParticles; 