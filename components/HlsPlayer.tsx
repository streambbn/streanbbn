
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
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Fatal network error encountered, trying to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error encountered, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable error");
                hls.destroy();
                break;
            }
          }
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
    <div className="w-full bg-black relative group overflow-hidden">
      <div className="relative aspect-video bg-black shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          muted
          autoPlay
          playsInline
        />
        
        {/* Quality Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none z-30 flex gap-2">
          <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Live
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white">
            Source
          </div>
        </div>
      </div>
    </div>
  );
};

export default HlsPlayer;
