
import React, { useState, useEffect } from 'react';
import HlsPlayer from './components/HlsPlayer';

type Page = 'vibecast' | 'sooplive';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('vibecast');
  const [hostname, setHostname] = useState<string>('');
  
  // Channels Configuration
  const PRIMARY_M3U8_URL = "https://cdn-live-tv.ru/api/v1/channels/za-supersport-psl/tracks-v1a1/mono.ts.m3u8?token=1b665f489248e3db3b773793331b30f53a5cc1bc2e0ed95993385ecd0aa5936b.1770109393.58c3b1f9d5f9fb6dfc8733a3ade84764.314e4d304fa112119f45d681e0c97c5c.ea4d57c77a29d7d6e95a54a178c3b6c2.b27fe1fc21490475";
  const TWITCH_CHAT_CHANNEL = "jeskkii";
  const SOOP_EMBED_URL = "https://play.sooplive.co.kr/benzo90/291320022/embed";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050507] text-zinc-100 overflow-hidden font-sans">
      {/* HEADER - Twitch inspired */}
      <nav className="h-12 md:h-14 border-b border-white/5 bg-[#18181b] px-4 flex justify-between items-center flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
            onClick={() => setCurrentPage('vibecast')}
          >
            <i className="fa-solid fa-bolt-lightning text-white text-xs"></i>
          </div>
          <h1 className="text-sm md:text-base font-black tracking-tighter uppercase italic select-none">
            Vibe<span className="text-purple-500">Cast</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 mr-4 bg-black/40 p-1 rounded-md border border-white/5">
             <button 
                onClick={() => setCurrentPage('vibecast')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${currentPage === 'vibecast' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
             >
               Primary
             </button>
             <button 
                onClick={() => setCurrentPage('sooplive')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${currentPage === 'sooplive' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
             >
               SoopLive
             </button>
           </div>
           <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Live</span>
           </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT NAV (Desktop Only) */}
        <aside className="hidden lg:flex w-14 bg-[#1f1f23] flex-col items-center py-4 gap-4 border-r border-black/40 flex-shrink-0">
          <div className="text-[9px] font-black text-zinc-600 uppercase mb-2">Feeds</div>
          <button 
            onClick={() => setCurrentPage('vibecast')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${currentPage === 'vibecast' ? 'bg-purple-600 shadow-lg shadow-purple-900/40 rotate-3' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'}`}
          >
            <i className="fa-solid fa-v text-sm"></i>
          </button>
          <button 
            onClick={() => setCurrentPage('sooplive')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${currentPage === 'sooplive' ? 'bg-blue-600 shadow-lg shadow-blue-900/40 rotate-3' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'}`}
          >
            <i className="fa-solid fa-s text-sm"></i>
          </button>
        </aside>

        {/* MAIN STAGE */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          <main className="flex-1 bg-black flex flex-col overflow-y-auto overflow-x-hidden">
            {currentPage === 'vibecast' ? (
              <div className="flex-1 flex flex-col">
                <div className="w-full">
                  <HlsPlayer src={PRIMARY_M3U8_URL} />
                </div>
                <div className="p-4 md:p-6 border-b border-white/5 bg-[#0f0f12]">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full border-2 border-white/10 flex items-center justify-center font-black text-xl">P</div>
                        <div>
                          <h2 className="text-lg font-bold">VibeCast Primary Broadcast</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">M3U8 Feed</span>
                            <span className="text-zinc-600 text-xs font-bold uppercase">• High Quality Stream</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded font-bold text-xs transition-colors">Follow</button>
                        <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded font-bold text-xs transition-colors">Share</button>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="w-full aspect-video bg-black relative">
                  {/* SOOPLIVE PLAYER */}
                  <iframe 
                    src={SOOP_EMBED_URL}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    title="SoopLive Broadcast"
                  />
                </div>
                <div className="p-4 md:p-6 border-b border-white/5 bg-[#0f0f12]">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full border-2 border-white/10 flex items-center justify-center font-black text-xl">S</div>
                        <div>
                          <h2 className="text-lg font-bold">SoopLive Secondary Feed</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">benzo90</span>
                            <span className="text-zinc-600 text-xs font-bold uppercase">• Special Event</span>
                          </div>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </main>

          {/* CHAT SECTION (Twitch Style) */}
          <aside className="w-full md:w-[340px] lg:w-[360px] flex-shrink-0 bg-[#0e0e10] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[400px] md:h-auto">
            <div className="h-10 md:h-12 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0 bg-[#18181b]">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-comments text-zinc-500 text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Relay Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                <span className="text-[9px] font-black uppercase text-zinc-600">Secure</span>
              </div>
            </div>

            <div className="flex-1 bg-[#050507]">
              {hostname ? (
                <iframe
                  src={`https://www.twitch.tv/embed/${TWITCH_CHAT_CHANNEL}/chat?parent=${hostname}&darkpopout=true`}
                  height="100%"
                  width="100%"
                  className="border-0 w-full h-full"
                  title="Community Chat"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Handshaking Gateway...</p>
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
