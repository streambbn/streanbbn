
import React, { useState } from 'react';
import HlsPlayer from './components/HlsPlayer';

type Page = 'vibecast' | 'sooplive';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('vibecast');
  
  const STREAM_URL = "https://cdn-live-tv.ru/api/v1/channels/za-supersport-psl/tracks-v1a1/mono.ts.m3u8?token=1b665f489248e3db3b773793331b30f53a5cc1bc2e0ed95993385ecd0aa5936b.1770109393.58c3b1f9d5f9fb6dfc8733a3ade84764.314e4d304fa112119f45d681e0c97c5c.ea4d57c77a29d7d6e95a54a178c3b6c2.b27fe1fc21490475";
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
             <button 
                onClick={() => setCurrentPage('vibecast')}
                className={`text-[10px] font-bold uppercase transition-colors ${currentPage === 'vibecast' ? 'text-purple-500' : 'text-zinc-400 hover:text-white'}`}
             >
               Primary
             </button>
             <button 
                onClick={() => setCurrentPage('sooplive')}
                className={`text-[10px] font-bold uppercase transition-colors ${currentPage === 'sooplive' ? 'text-purple-500' : 'text-zinc-400 hover:text-white'}`}
             >
               SoopLive
             </button>
           </div>
           <div className="px-2 py-0.5 bg-red-500 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
             Live
           </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* SIDEBAR CHANNEL LIST (Twitch Style) */}
        <aside className="hidden lg:flex w-16 bg-[#1f1f23] flex-col items-center py-4 gap-4 border-r border-black flex-shrink-0">
          <button 
            onClick={() => setCurrentPage('vibecast')}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${currentPage === 'vibecast' ? 'border-purple-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
            title="VibeCast"
          >
            <div className="w-full h-full bg-purple-600 flex items-center justify-center text-xs font-bold">V</div>
          </button>
          <button 
            onClick={() => setCurrentPage('sooplive')}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${currentPage === 'sooplive' ? 'border-purple-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
            title="SoopLive"
          >
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-xs font-bold">S</div>
          </button>
        </aside>
        
        {/* CONTENT AREA */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* PLAYER SECTION */}
          <main className="flex-1 bg-black flex flex-col overflow-y-auto scroll-smooth">
            {currentPage === 'vibecast' ? (
              <>
                <div className="w-full">
                  <HlsPlayer src={STREAM_URL} />
                </div>
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
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">Primary Feed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  <iframe 
                    src="https://play.sooplive.co.kr/benzo90/291320022/embed" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowFullScreen
                    className="absolute inset-0"
                    title="SoopLive Stream"
                  ></iframe>
                </div>
                <div className="p-4 md:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0 border-2 border-white/10 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-800 flex items-center justify-center text-lg font-bold">
                          S
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold leading-tight">SoopLive Secondary Feed</h2>
                        <p className="text-blue-400 text-sm font-bold uppercase tracking-wide">benzo90 Channel</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">SOOP</span>
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">Secondary</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* CHAT SECTION (Twitch style) */}
          <aside className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 bg-[#0e0e10] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[400px] md:h-full">
            <div className="h-10 md:h-12 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0 bg-[#18181b]">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrow-right-to-bracket text-zinc-400 text-xs"></i>
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-100">Stream Chat</span>
              </div>
              <i className="fa-solid fa-users text-zinc-500 text-xs"></i>
            </div>

            <div className="flex-1 bg-black relative">
              {currentPage === 'vibecast' ? (
                currentHost ? (
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
                )
              ) : (
                <div className="w-full h-full bg-[#0e0e10] flex flex-col items-center justify-center p-8 text-center">
                   <i className="fa-solid fa-comment-slash text-4xl text-zinc-800 mb-4"></i>
                   <h3 className="text-sm font-bold text-zinc-400 mb-2">Secondary Feed Chat</h3>
                   <p className="text-xs text-zinc-600">The chat for this feed is currently managed externally.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
