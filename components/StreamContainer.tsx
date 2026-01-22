
import React, { useState, useEffect, useRef } from 'react';

interface StreamContainerProps {
  isFakeFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

type RevealStatus = 'awaiting-unmute' | 'syncing' | 'revealed';

const StreamContainer: React.FC<StreamContainerProps> = ({ isFakeFullscreen = false, onExitFullscreen }) => {
  const [status, setStatus] = useState<RevealStatus>('awaiting-unmute');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detection logic: Blur occurs when user clicks into the iframe hole
    const handleDetection = () => {
      requestAnimationFrame(() => {
        if (document.activeElement instanceof HTMLIFrameElement) {
          triggerSync();
        }
      });
    };

    const triggerSync = () => {
      setStatus(prev => {
        if (prev === 'awaiting-unmute') {
          // Transition to syncing, then eventually to revealed
          // But the interaction lock will remain active in both states
          setTimeout(() => setStatus('revealed'), 2500); 
          return 'syncing';
        }
        return prev;
      });
    };

    window.addEventListener('blur', handleDetection);

    const sentinel = setInterval(() => {
      if (document.activeElement instanceof HTMLIFrameElement && status === 'awaiting-unmute') {
        triggerSync();
      }
    }, 50);

    return () => {
      window.removeEventListener('blur', handleDetection);
      clearInterval(sentinel);
    };
  }, [status]);

  const containerClasses = isFakeFullscreen 
    ? "fixed inset-0 z-[100] bg-black" 
    : "relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 transition-all duration-500 ease-in-out";

  // CRITICAL: The player is ONLY interactive during the 'awaiting-unmute' phase.
  // Once the user clicks once, pointer-events are disabled FOREVER.
  const iframeStyle: React.CSSProperties = {
    pointerEvents: status === 'awaiting-unmute' ? 'auto' : 'none',
    userSelect: 'none',
  };

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* 
          1. THE PLAYER 
          Becomes physically non-existent to mouse events after first click.
      */}
      <iframe 
        src="https://player.kick.com/lisibrm?autoplay=true&muted=false" 
        className="absolute top-0 left-0 w-full h-full"
        style={iframeStyle}
        frameBorder="0" 
        scrolling="no"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen={true}
      />

      {/* 
          2. THE INDEFINITE GHOST SHIELD
          Sits at the highest Z-index stack. 
          Activated the moment status leaves 'awaiting-unmute'.
          Remains active even after the visual reveal to block all future clicks.
      */}
      <div 
        className={`absolute inset-0 z-[300] bg-transparent
          ${status !== 'awaiting-unmute' ? 'pointer-events-auto cursor-default' : 'pointer-events-none'}`} 
      />

      {/* 
          3. VISUAL MASK / ANIMATION LAYER
      */}
      <div 
        className={`absolute inset-0 z-[140] bg-[#09090b] transition-all duration-1000 ease-in-out pointer-events-none
          ${status === 'revealed' ? 'opacity-0 invisible scale-105' : 'opacity-100'}`}
        style={{
          clipPath: status === 'awaiting-unmute' 
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 6% 82%, 18% 82%, 18% 97%, 6% 97%, 6% 82%)' 
            : 'none',
          WebkitClipPath: status === 'awaiting-unmute' 
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 6% 82%, 18% 82%, 18% 97%, 6% 97%, 6% 82%)' 
            : 'none'
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          {status === 'awaiting-unmute' ? (
            <div className="animate-in fade-in duration-700">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/50 rounded-2xl flex items-center justify-center animate-pulse">
                  <i className="fa-solid fa-volume-xmark text-purple-500 text-2xl"></i>
                </div>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2 neon-glow">Initialize Broadcast</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-[280px] leading-relaxed">
                Click the <span className="text-purple-400">Speaker Icon</span> to finalize sync.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <i className="fa-solid fa-lock-open text-purple-400 text-2xl animate-pulse"></i>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em] neon-glow">Sync Complete</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-12 bg-purple-600 rounded-full animate-pulse"></div>
                  <span className="text-purple-400 text-[9px] font-black uppercase tracking-[0.5em]">Establishing Permanent Feed</span>
                  <div className="h-1 w-12 bg-purple-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. THE GUIDE RING (Hole Highlight) */}
      {status === 'awaiting-unmute' && (
        <div className="absolute inset-0 z-[160] pointer-events-none">
          <div 
            className="absolute left-[6%] bottom-[3%] w-[12%] h-[15%] border-2 border-purple-500/50 rounded-xl animate-pulse shadow-[0_0_40px_rgba(168,85,247,0.3)] flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-purple-600/20 backdrop-blur-md px-3 py-1 rounded-md border border-purple-500/30">
              <span className="text-white text-[9px] font-black uppercase tracking-widest">Unmute & Lock</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. EXIT UI - Always stays above the ghost shield */}
      {isFakeFullscreen && status === 'revealed' && (
        <button 
          onClick={onExitFullscreen}
          className="absolute top-6 right-6 z-[400] w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-95"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      )}

      <style>{`
        .neon-glow {
          text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default StreamContainer;
