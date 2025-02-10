'use client';

import SwirlingParticles from '@/app/components/SwirlingParticles';

export default function TestParticles() {
  return (
    <div className="min-h-screen">
      <SwirlingParticles />
      <div className="relative z-10 p-8">
        <h1 className="text-white text-4xl">Test Particles Page</h1>
        <p className="text-gray-300 mt-4">You should see red particles swirling in the background</p>
      </div>
    </div>
  );
} 