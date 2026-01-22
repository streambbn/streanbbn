
import React, { useState, useEffect } from 'react';
import StreamContainer from './components/StreamContainer';

const App: React.FC = () => {
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);

  // Handle mobile orientation changes for automatic fake fullscreen
  useEffect(() => {
    const handleOrientationChange = () => {
      // If we rotate to landscape on a mobile-sized device, enter fake fullscreen
      if (window.innerWidth < 1024) {
        if (window.orientation === 90 || window.orientation === -90) {
          setIsFakeFullscreen(true);
        } else {
          setIsFakeFullscreen(false);
        }
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const toggleFakeFullscreen = () => setIsFakeFullscreen(!isFakeFullscreen);

  return (
    <div className={`min-h-screen flex flex-col bg-[#09090b] ${isFakeFullscreen ? 'overflow-hidden' : ''}`}>
      {/* Navbar - Hidden in fake fullscreen */}
      {!isFakeFullscreen && (
        <nav className="h-16 border-b border-zinc-800 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <i className="fa-solid fa-music text-white"></i>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase neon-glow">VibeCast</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-purple-400 transition-colors text-zinc-100">Live Stream</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Schedule</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-full text-xs font-bold transition-all border border-zinc-700">
              Sign In
            </button>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-purple-600/20">
              Follow
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-center justify-center ${isFakeFullscreen ? 'p-0' : 'p-4 md:p-8 max-w-5xl mx-auto w-full'}`}>
        
        {/* Main Stream Player Column */}
        <div className="w-full space-y-8">
          <StreamContainer isFakeFullscreen={isFakeFullscreen} onExitFullscreen={() => setIsFakeFullscreen(false)} />
          
          {!isFakeFullscreen && (
            <div className="flex flex-col items-center gap-4">
              {/* Fake Fullscreen Toggle Button */}
              <button 
                onClick={toggleFakeFullscreen}
                className="group flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-purple-500/30 hover:border-purple-500 text-zinc-300 hover:text-white px-10 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-purple-500/5 active:scale-95"
              >
                <i className="fa-solid fa-expand text-purple-500 group-hover:scale-110 transition-transform text-lg"></i>
                <span className="font-black uppercase text-sm tracking-[0.2em]">Enlarge Player Mode</span>
              </button>
              
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest text-center">
                Interactive controls disabled for uninterrupted viewing
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Hidden in fake fullscreen */}
      {!isFakeFullscreen && (
        <footer className="mt-auto py-8 px-4 border-t border-zinc-800 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">&copy; 2024 VibeCast. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><i className="fa-brands fa-discord text-xl"></i></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><i className="fa-brands fa-instagram text-xl"></i></a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
