
import React from 'react';
import HlsPlayer from './components/HlsPlayer';

const App: React.FC = () => {
  const STREAM_URL = "https://1a-1791.com/live/r31jzt5k/live-hls/s8v6-u9sc/chunklist_i1_DVR.m3u8";
  const TWITCH_CHANNEL = "jeskkii";
  
  // Get current hostname for Twitch parent requirement.
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div className="flex flex-col h-screen bg-[#050507] text-zinc-100 overflow-hidden">
      {/* HEADER - Slim Twitch-style */}
      <nav className="h-12 md:h-14 border-b border-white/5 bg-[#18181b] px-4 flex justify-between items-center flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center">
            <i className="fa-solid fa-bolt-lightning text-white text-xs"></i>
          </div>
          <h1 className="text-sm md:text-base font-black tracking-tighter uppercase italic">
            Vibe<span className="text-purple-500">Cast</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-4 mr-4 border-r border-white/10 pr-4">
             <span className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white cursor-pointer transition-colors">Browse</span>
             <span className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white cursor-pointer transition-colors">Relay</span>
           </div>
           <div className="px-2 py-0.5 bg-red-500 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
             Live
           </div>
        </div>
      </nav>

      {/* MAIN LAYOUT: Side-by-side on desktop, Stacked on mobile */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* PLAYER SECTION */}
        <main className="flex-1 bg-black flex flex-col overflow-y-auto">
          <div className="w-full">
            <HlsPlayer src={STREAM_URL} />
          </div>
          
          {/* STREAM INFO PANEL */}
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex-shrink-0 border-2 border-white/10 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-800 flex items-center justify-center">
                    <i className="fa-solid fa-user text-white text-xl"></i>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">Live Broadcast: Mission Control</h2>
                  <p className="text-purple-400 text-sm font-bold uppercase tracking-wide">VibeCast Official</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">HLS</span>
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">English</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded text-sm transition-colors">
                  Follow
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1.5 px-4 rounded text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 hidden md:block">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                Broadcasting via encrypted secure gateway. Optimized for low-latency HLS delivery. 
                Interact with the community in the real-time relay feed.
              </p>
            </div>
          </div>
        </main>

        {/* CHAT SECTION - Fixed sidebar on Desktop, Bottom fill on Mobile */}
        <aside className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 bg-[#0e0e10] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[400px] md:h-full">
          {/* CHAT HEADER */}
          <div className="h-10 md:h-12 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0 bg-[#18181b]">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-right-to-bracket text-zinc-400 text-xs"></i>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-100">Stream Chat</span>
            </div>
            <i className="fa-solid fa-users text-zinc-500 text-xs"></i>
          </div>

          {/* IFRAME CONTAINER - Zero padding/obscuration */}
          <div className="flex-1 bg-black">
            {currentHost ? (
              <iframe
                src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?parent=${currentHost}&darkpopout=true`}
                height="100%"
                width="100%"
                className="border-0 w-full h-full"
                title="Twitch Chat Feed"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default App;
