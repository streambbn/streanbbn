
import React from 'react';
import HlsPlayer from './components/HlsPlayer';

const App: React.FC = () => {
  const STREAM_URL = "https://1a-1791.com/live/4gf18j5s/live-hls/9t9f-w1z5/chunklist_i1_DVR.m3u8";
  const TWITCH_CHANNEL = "jeskkii";
  
  // Get current hostname for Twitch parent requirement
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-purple-500/30">
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic">
            Vibe<span className="text-purple-500">Cast</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white cursor-pointer transition-colors">Signal Map</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white cursor-pointer transition-colors">Relay Nodes</span>
           <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Secure Line</span>
           </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-24 md:pt-32 pb-12 md:pb-24 px-4 md:px-8 max-w-6xl mx-auto space-y-8 md:space-y-12">
        {/* SINGLE DOMINANT HLS PLAYER */}
        <div className="w-full">
          <HlsPlayer 
            src={STREAM_URL}
          />
        </div>

        {/* TWITCH CHAT SECTION */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
              <h3 className="text-xs md:text-sm font-black uppercase italic tracking-widest text-zinc-400">
                Interactive <span className="text-white">Relay</span> Feed
              </h3>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <i className="fa-brands fa-twitch text-[10px]"></i>
              <span className="text-[9px] font-black uppercase tracking-widest italic">{TWITCH_CHANNEL} // CHAT</span>
            </div>
          </div>
          
          <div className="relative w-full h-[500px] md:h-[650px] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl ring-1 ring-white/10 group hover:ring-purple-500/20 transition-all duration-700">
            <iframe
              src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?parent=${currentHost}&darkpopout=true`}
              height="100%"
              width="100%"
              className="border-0 w-full h-full"
              title="Twitch Chat Feed"
              allowFullScreen={false}
            />
            
            {/* AMBIENT GLOW EFFECT */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-purple-500/0 via-transparent to-purple-500/[0.02]"></div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic opacity-60">
              * Direct Twitch.tv bridge via encrypted secure gateway.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-zinc-700 font-bold uppercase">Status:</span>
              <span className="text-[8px] text-green-500 font-black uppercase animate-pulse">Connected</span>
            </div>
          </div>
        </div>

        {/* TECH STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {[
            { icon: 'fa-wave-square', title: 'HLS Protocol', desc: 'Chunk-based streaming ensuring stability under high-load network conditions.' },
            { icon: 'fa-microchip', title: 'Hardware Accel', desc: 'GPU-accelerated decoding via hls.js for low-latency visual performance.' },
            { icon: 'fa-shield-halved', title: 'Secure Relay', desc: 'Encrypted DVR handshake protocols protecting signal integrity.' }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] hover:bg-zinc-900/60 hover:border-purple-500/30 transition-all group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/10 transition-colors text-zinc-500 group-hover:text-purple-500">
                <i className={`fa-solid ${feature.icon} text-xl transition-all`}></i>
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-white/90">{feature.title}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase leading-relaxed tracking-wider">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-900 text-center opacity-40">
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] px-4">
          VIBECAST BROADCASTING GROUP // EST. 2024 // SIGNAL SECURE
        </p>
      </footer>
    </div>
  );
};

export default App;
