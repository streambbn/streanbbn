
import React, { useState, useEffect } from 'react';

interface StreamContainerProps {
  isFakeFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

const StreamContainer: React.FC<StreamContainerProps> = ({ isFakeFullscreen = false, onExitFullscreen }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    let countdownTimer: ReturnType<typeof setTimeout>;
    let delayTimer: ReturnType<typeof setTimeout>;

    const startSequence = () => {
      // Clear any pending timers
      clearTimeout(delayTimer);
      clearTimeout(countdownTimer);
      
      // Lock state: Show cover and solid black blocker instantly
      setIsConnecting(true);
      setIsCountdownActive(false);

      // Wait 2 seconds after browser is reopened/visible
      delayTimer = setTimeout(() => {
        setIsCountdownActive(true);
        // Start the 5-second countdown to reveal the stream
        countdownTimer = setTimeout(() => {
          setIsConnecting(false);
          setIsCountdownActive(false);
        }, 5000);
      }, 2000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Immediately trigger solid black state and reset timers when minimized
        setIsConnecting(true);
        setIsCountdownActive(false);
        clearTimeout(delayTimer);
        clearTimeout(countdownTimer);
      } else if (document.visibilityState === 'visible') {
        // Start the reveal sequence when user returns to the page
        startSequence();
      }
    };

    // Initial load sequence
    startSequence();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(delayTimer);
      clearTimeout(countdownTimer);
    };
  }, []);

  const containerClasses = isFakeFullscreen 
    ? "fixed inset-0 z-[100] bg-black" 
    : "relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 transition-all duration-500 ease-in-out";

  return (
    <div className={containerClasses}>
      {/* Background Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 -z-10">
        <i className="fa-solid fa-compact-disc text-4xl text-zinc-700 animate-spin"></i>
      </div>
      
      {/* The Actual Stream Player */}
      <iframe 
        src="https://player.kick.com/Djharrylive?autoplay=true&allowfullscreen=false" 
        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          isConnecting ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
        frameBorder="0" 
        scrolling="no"
        allowFullScreen={true}
      />

      {/* 
          Persistent Interaction Blocker & Black Cover Layer: 
          - Covers everything underneath.
          - Solid black while connecting or minimized.
          - Transparent but still active (blocking clicks) after reveal.
      */}
      <div 
        className={`absolute inset-0 z-20 cursor-default select-none ${
          isConnecting ? 'bg-black' : 'bg-transparent'
        }`}
        style={{ 
          transition: isConnecting ? 'none' : 'background-color 1s ease-in-out' 
        }}
        aria-hidden="true"
      ></div>

      {/* Connecting UI Text & Progress Bar */}
      <div 
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isConnecting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-bolt text-purple-400 animate-pulse"></i>
          </div>
        </div>
        
        <div className="text-center space-y-2 px-4">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.25em] neon-glow animate-pulse">
            Connecting to Live Stream
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em]">
            {isCountdownActive ? 'Establishing Secure Link...' : 'Syncing Frequencies...'}
          </p>
        </div>
        
        {/* Animated Loading Bar */}
        <div className="w-64 h-1 bg-zinc-900 rounded-full mt-10 overflow-hidden border border-zinc-800/50">
          <div 
            className={`h-full bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-200 ${
              isCountdownActive ? 'animate-[loading_5s_linear_forwards]' : 'w-0'
            }`}
          ></div>
        </div>
      </div>

      {/* Exit Button - only visible in fake fullscreen */}
      {isFakeFullscreen && (
        <button 
          onClick={onExitFullscreen}
          className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-95"
          title="Exit enlarged mode"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      )}

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StreamContainer;
