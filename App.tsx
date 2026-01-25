
import React from 'react';
import StreamContainer from './components/StreamContainer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-purple-500/30">
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-bolt-lightning text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            Vibe<span className="text-purple-500">Cast</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white cursor-pointer transition-colors">Network</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white cursor-pointer transition-colors">Satellites</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white cursor-pointer transition-colors">Status</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-32 pb-24 px-4 md:px-8 max-w-5xl mx-auto space-y-24">
        {/* HERO HEADER */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Kick Signal Matrix Alpha</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
            Signal <span className="text-purple-500">Relay</span>
          </h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.1em] leading-relaxed max-w-md mx-auto">
            Monitoring multi-channel broadcasts via standard Kick protocols. Real-time visual data processing.
          </p>
        </header>

        {/* FEED 1: TAKE FROM (LOCKED & THEATER MODE) */}
        <StreamContainer 
          title="Primary Stream" 
          subtitle="Main Intelligence Feed // Node Alpha (LOCKED)"
          channel="takefrom"
          accentColor="purple"
          isLocked={true}
          allowFakeFullscreen={true}
        />

        {/* FEED 2: TAKE FROM (OPEN) */}
        <StreamContainer 
          title="Secondary Feed" 
          subtitle="Auxiliary Visual Monitoring // Node Gamma"
          channel="takefrom"
          accentColor="blue"
        />

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            { icon: 'fa-lock', title: 'Interaction Lock', desc: 'Secure view-only mode prevents accidental player interference.' },
            { icon: 'fa-maximize', title: 'Theater Mode', desc: 'Immersive windowed fullscreen for focused monitoring.' },
            { icon: 'fa-infinity', title: 'Always Live', desc: 'Auto-reconnection logic handled by host servers.' }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] hover:bg-zinc-900/60 transition-all group">
              <i className={`fa-solid ${feature.icon} text-xl text-purple-500 mb-6 group-hover:scale-110 transition-transform`}></i>
              <h3 className="font-black text-sm uppercase tracking-widest mb-2">{feature.title}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase leading-relaxed tracking-wider">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-900 text-center opacity-40">
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em]">&copy; 2024 VIBECAST SIGNAL SYSTEMS // GLOBAL BROADCASTING UNIT</p>
      </footer>
    </div>
  );
};

export default App;
