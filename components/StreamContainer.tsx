
import React, { useState } from 'react';

interface StreamContainerProps {
  channel: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  isLocked?: boolean; // If true, adds invisible interaction layer
  allowFakeFullscreen?: boolean; // If true, enables the expand button
}

const StreamContainer: React.FC<StreamContainerProps> = ({ 
  channel, 
  title, 
  subtitle = "Direct Kick.com Integration",
  accentColor = "purple",
  isLocked = false,
  allowFakeFullscreen = false
}) => {
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
  const embedUrl = `https://player.kick.com/${channel}?autoplay=true&muted=false`;

  const toggleFullscreen = () => setIsFakeFullscreen(!isFakeFullscreen);

  // Styling for the container based on fullscreen state
  const containerClasses = isFakeFullscreen 
    ? "fixed inset-0 z-[100] bg-black p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300"
    : "group relative w-full space-y-4";

  const playerClasses = isFakeFullscreen
    ? "relative w-full h-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    : "relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500";

  return (
    <div className={containerClasses}>
      {/* HEADER (Only show in normal mode or as a floating bar in FS) */}
      {!isFakeFullscreen ? (
        <div className="flex justify-between items-end px-2 w-full">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              {title.split(' ')[0]} <span className={`text-${accentColor}-500`}>{title.split(' ').slice(1).join(' ')}</span>
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
             {allowFakeFullscreen && (
               <button 
                onClick={toggleFullscreen}
                className="text-zinc-500 hover:text-white transition-colors text-xs flex items-center gap-2 font-black uppercase tracking-widest"
               >
                 <i className="fa-solid fa-expand"></i>
                 Theater
               </button>
             )}
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">ID:</span>
                <span className={`text-[9px] font-black uppercase tracking-widest text-${accentColor}-400 underline decoration-zinc-800`}>{channel}</span>
             </div>
          </div>
        </div>
      ) : (
        /* Floating Exit Button in FS */
        <div className="absolute top-8 right-8 z-[110] flex gap-3">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 italic">{title} // Active Feed</span>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-2xl"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className={playerClasses}>
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen={true}
          scrolling="no"
        />

        {/* INVISIBLE INTERACTION LAYER */}
        {isLocked && (
          <div 
            className="absolute inset-0 z-20 bg-transparent cursor-default"
            title="Interaction Restricted"
          />
        )}

        {/* OVERLAYS */}
        <div className="absolute top-6 left-6 pointer-events-none z-30">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75`}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Live Signal</span>
           </div>
        </div>

        {/* LOCK INDICATOR */}
        {isLocked && !isFakeFullscreen && (
          <div className="absolute bottom-6 right-6 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg text-zinc-400">
              <i className="fa-solid fa-lock text-[10px]"></i>
            </div>
          </div>
        )}
      </div>
      
      {!isFakeFullscreen && (
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-2 italic">
          {isLocked ? "* User interaction locked for this node." : "* Click to unmute if necessary."}
        </p>
      )}
    </div>
  );
};

export default StreamContainer;
