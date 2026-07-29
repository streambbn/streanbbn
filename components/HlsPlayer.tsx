
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  onUrlChange?: (newUrl: string) => void;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, onUrlChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>(src);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    setInputUrl(src);
  }, [src]);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hlsRef.current = hls;

      let networkRetries = 0;
      const MAX_RETRIES = 3;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setError(null);
        video.play().catch((e) => {
          console.log("Autoplay prevented:", e);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkRetries < MAX_RETRIES) {
                networkRetries++;
                console.warn(`HLS Network error encountered (attempt ${networkRetries}/${MAX_RETRIES}). Recovering...`);
                setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.startLoad();
                  }
                }, 2000);
              } else {
                console.error("Max HLS network retries reached.");
                setIsLoading(false);
                setError("Network error: Stream link may have expired or requires CORS authorization.");
                hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media error encountered, recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable stream error:", data.details);
              setIsLoading(false);
              setError("Fatal stream error. The live feed could not be loaded.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setError(null);
        video.play().catch((e) => console.log("Autoplay prevented:", e));
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setError("Native video playback error.");
      });
    } else {
      setIsLoading(false);
      setError("HLS playback is not supported in this browser.");
    }
  };

  useEffect(() => {
    loadStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, retryCount]);

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && onUrlChange) {
      onUrlChange(inputUrl.trim());
      setIsEditingUrl(false);
    }
  };

  return (
    <div className="w-full bg-black relative group overflow-hidden">
      <div className="relative aspect-video bg-black shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          muted
          autoPlay
          playsInline
        />

        {/* Loading Spinner */}
        {isLoading && !error && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-20">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Connecting Live Feed...</p>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center z-30 gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-zinc-200 tracking-wider">Stream Connection Error</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1">{error}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={handleManualRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-rotate-right text-xs"></i>
                Retry Connection
              </button>
              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-link text-xs"></i>
                {isEditingUrl ? 'Cancel' : 'Update URL'}
              </button>
            </div>

            {isEditingUrl && (
              <form onSubmit={handleUrlSubmit} className="w-full max-w-lg mt-2 flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste valid M3U8 URL..."
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded uppercase"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quality Overlay Header */}
        {!error && (
          <div className="absolute top-4 left-4 pointer-events-none z-30 flex gap-2">
            <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live Feed
            </div>
            <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white">
              HLS Master
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HlsPlayer;

