
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, title, subtitle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support for HLS (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="w-full space-y-4 group">
      <div className="flex justify-between items-end px-2">
        <div>
          <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
            {title.split(' ')[0]} <span className="text-purple-500">{title.split(' ').slice(1).join(' ')}</span>
          </h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Protocol:</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">HLS // M3U8</span>
        </div>
      </div>

      <div className="relative aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl ring-1 ring-white/10 group-hover:ring-purple-500/20 transition-all duration-700">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          muted
          autoPlay
          playsInline
        />

        {/* TOP OVERLAY */}
        <div className="absolute top-4 md:top-8 left-4 md:left-8 pointer-events-none z-30">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">Signal Active</span>
          </div>
        </div>

        {/* SCANLINE EFFECT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
      </div>
      
      <div className="flex items-center gap-4 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-circle-info text-purple-500 text-xs"></i>
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic">
          High-bitrate HLS encryption active. Use player controls for manual volume modulation.
        </p>
      </div>
    </div>
  );
};

export default HlsPlayer;
