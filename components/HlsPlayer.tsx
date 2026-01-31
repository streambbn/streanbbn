
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src }) => {
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
    <div className="w-full bg-black relative group">
      <div className="relative aspect-video bg-black overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black cursor-pointer"
          controls
          muted
          autoPlay
          playsInline
        />

        {/* LIVE LABEL OVERLAY */}
        <div className="absolute top-4 left-4 pointer-events-none z-30 flex gap-2">
          <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white">
            Live
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white">
            1080p
          </div>
        </div>

        {/* SCANLINE SUBTLE EFFECT */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-10 bg-[length:100%_2px] opacity-20"></div>
      </div>
    </div>
  );
};

export default HlsPlayer;
