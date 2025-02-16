'use client';

import { useState } from 'react';
import TopNavBar from '@/app/components/TopNavBar';
import { FaCopy } from 'react-icons/fa';

export default function DownloadPage() {
  const [activeType, setActiveType] = useState<'iso' | 'install' | 'update'>('iso');
  const [copySuccess, setCopySuccess] = useState('');

  const instructions = {
    install: 'su - root -c "apt install -y curl && curl -sSL https://darkflows.com/downloads/install.sh | bash"',
    update: 'su - root -c "apt install -y curl && curl -sSL https://darkflows.com/downloads/update.sh | bash"'
  };

  const descriptions = {
    iso: `Use this ISO to install directly onto the machine or virtual machine. Let it run and do the full install, after it boots you need to let it finish the install which can take 15 minutes or more, once it is done it will show the message where you can log into the webserver. If you have any issues installing you can use the script in <span class="text-[#7fb69b]">/usr/local/darkflows/installer/verify_installation.sh</span> to see what is missing and have it attempt to fix it.`,
    install: "We recommend you installing the following ISO as the base for your install. Also make sure you have both your WAN and LAN ethernet plugged in before you run the install. The installer will automatically detect and configure the networking. If you have a secondary WAN plug that in as well.",
    update: "We recommend you installing the following ISO as the base for your install. Also make sure you have both your WAN and LAN ethernet plugged in before you run the install. The installer will automatically detect and configure the networking. If you have a secondary WAN plug that in as well."
  };

  const isoLink = 'https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.9.0-amd64-netinst.iso';
  const darkflowsIsoLink = '/downloads/darkflows.iso';

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            DarkFlows{' '}
            <span className="text-[#7fb69b]">installation</span>
          </h1>
        </div>

        {/* Installation Prerequisites */}
        <div className="max-w-2xl mx-auto mb-12 text-gray-300">
          <p className="mb-4 italic text-center" 
             dangerouslySetInnerHTML={{ __html: descriptions[activeType] }}>
          </p>
          {activeType !== 'iso' && (
            <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between group">
              <code className="text-gray-300 break-all">{isoLink}</code>
              <button
                onClick={() => handleCopy(isoLink, 'ISO link')}
                className="ml-4 p-2 text-gray-400 hover:text-white transition-colors"
                title="Copy ISO link"
              >
                <FaCopy size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Option Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-8">
          <button
            onClick={() => setActiveType('iso')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg ${
              activeType === 'iso' 
                ? 'bg-[#7fb69b] text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 0a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 12.293V.5A.5.5 0 0 1 8 0z"/>
            </svg>
            ISO Install
          </button>

          <button
            onClick={() => setActiveType('install')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg ${
              activeType === 'install' 
                ? 'bg-[#7fb69b] text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 0a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 12.293V.5A.5.5 0 0 1 8 0z"/>
            </svg>
            Script Install
          </button>

          <button
            onClick={() => setActiveType('update')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg ${
              activeType === 'update'
                ? 'bg-[#7fb69b] text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M8 3a5 5 0 0 0-5 5v.5a.5.5 0 0 1-1 0V8a6 6 0 1 1 12 0v.5a.5.5 0 0 1-1 0V8a5 5 0 0 0-5-5z"/>
              <path d="M8 4.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5z"/>
            </svg>
            Upgrade
          </button>
        </div>

        {/* Download ISO Button */}
        {activeType === 'iso' && (
          <div className="flex justify-center mt-8">
            <a 
              href={darkflowsIsoLink}
              download
              className="inline-block px-6 py-3 bg-[#7fb69b] text-white rounded-md hover:bg-[#6fa58b] transition-colors"
            >
              Download DarkFlows ISO
            </a>
          </div>
        )}

        {/* Instructions Section */}
        <div className="mt-16">
          <div className="max-w-2xl mx-auto">
            {activeType !== 'iso' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {activeType === 'install' ? 'Install' : 'Update'} Instructions
                </h2>
                <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between group">
                  <code className="text-gray-300">{instructions[activeType]}</code>
                  <button
                    onClick={() => handleCopy(instructions[activeType], 'Command')}
                    className="ml-4 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    <FaCopy size={20} />
                  </button>
                </div>
                {copySuccess && (
                  <p className="text-green-500 text-sm mt-2 text-center">
                    {copySuccess}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 