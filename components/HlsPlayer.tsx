
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  onUrlChange?: (newUrl: string) => void;
}

interface QualityLevel {
  id: number;
  height: number;
  bitrate: number;
  name: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, onUrlChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [lowLatency, setLowLatency] = useState<boolean>(false); // Default to Smooth Mode to prevent lag
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>(src);

  // Quality levels state
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1); // -1 is Auto
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const hlsRef = useRef<Hls | null>(null);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputUrl(src);
  }, [src]);

  const streamToLoad = useProxy && src.startsWith('http')
    ? `/api/proxy?url=${encodeURIComponent(src)}`
    : src;

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
        lowLatencyMode: lowLatency,
        liveSyncDuration: lowLatency ? 3 : 14, // 14s delay behind live head for ultra-stable playback
        liveMaxLatencyDuration: lowLatency ? 8 : 28,
        maxBufferLength: lowLatency ? 10 : 45, // 45s buffer cushion in smooth mode
        maxMaxBufferLength: lowLatency ? 20 : 90,
        maxBufferSize: 100 * 1024 * 1024, // 100MB max buffer allowance
        highBufferWatchdogPeriod: 2,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        abrEmaFastLive: 3,
        abrEmaSlowLive: 9,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hlsRef.current = hls;

      let networkRetries = 0;
      const MAX_RETRIES = 2;

      hls.loadSource(streamToLoad);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        setError(null);

        // Parse available quality levels
        if (data.levels && data.levels.length > 0) {
          const parsedLevels: QualityLevel[] = data.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height || 0,
            bitrate: lvl.bitrate || 0,
            name: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`
          }));
          setLevels(parsedLevels);
        } else {
          setLevels([]);
        }

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
                }, 1500);
              } else {
                console.error("Max HLS network retries reached.");
                setIsLoading(false);
                setError("Network/CORS error: Stream server blocked direct connection or stream token expired.");
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
              setError("Fatal stream error. The live feed could not be decoded.");
              hls.destroy();
              break;
          }
        } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          // Non-fatal buffer stall recovery
          console.warn("Buffer stall detected, recovering load...");
          hls.startLoad();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamToLoad;
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
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
      }
    };
  }, [src, useProxy, lowLatency, retryCount]);

  // Handle Quality Level Change
  const handleQualityChange = (levelId: number) => {
    setSelectedLevel(levelId);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
    }
  };

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
    <div className="w-full bg-black relative group overflow-hidden select-none">
      <div className="relative aspect-video bg-black shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          muted
          autoPlay
          playsInline
          onWaiting={() => {
            // Auto stall recovery nudge
            if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
            stallTimerRef.current = setTimeout(() => {
              if (hlsRef.current) {
                console.log("Nudging playback to resolve buffer waiting lag...");
                hlsRef.current.startLoad();
              }
            }, 2500);
          }}
          onPlaying={() => {
            if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
          }}
        />

        {/* Loading Spinner */}
        {isLoading && !error && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-20 pointer-events-none">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Optimizing Stream Buffer...</p>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center z-30 gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-zinc-200 tracking-wider">Stream Connection Failure</h3>
              <p className="text-xs text-zinc-400 max-w-md mt-1">{error}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={handleManualRetry}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-rotate-right text-xs"></i>
                Retry
              </button>
              <button
                onClick={() => setUseProxy(!useProxy)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${useProxy ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}
              >
                <i className="fa-solid fa-shield-halved text-xs"></i>
                {useProxy ? 'Proxy Mode: ON' : 'Proxy Mode: OFF'}
              </button>
              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-link text-xs"></i>
                {isEditingUrl ? 'Cancel' : 'Change URL'}
              </button>
            </div>

            {isEditingUrl && (
              <form onSubmit={handleUrlSubmit} className="w-full max-w-lg mt-2 flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste valid M3U8 URL..."
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded uppercase"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        )}

        {/* Header Overlay Controls */}
        {!error && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Live
              </div>
              <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1 border border-white/10">
                <span>HLS Stream</span>
                {useProxy && <span className="text-purple-400 text-[9px] font-mono">(Proxy)</span>}
              </div>
            </div>

            {/* Performance & Quality Toolbar */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setLowLatency(!lowLatency)}
                title={lowLatency ? "Low Latency (Fast, may stutter)" : "Stable Buffer Mode (12-15s Delay, Zero Stutter)"}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 border ${
                  lowLatency 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <i className={`fa-solid ${lowLatency ? 'fa-bolt' : 'fa-gauge-high'}`}></i>
                <span>{lowLatency ? 'Low-Latency' : '12s Stable Buffer'}</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white p-1.5 rounded transition-colors text-xs"
                title="Playback Settings"
              >
                <i className="fa-solid fa-sliders"></i>
              </button>
            </div>
          </div>
        )}

        {/* Quality & Settings Dropdown */}
        {showSettings && !error && (
          <div className="absolute top-12 right-3 z-40 bg-zinc-900/95 border border-white/10 backdrop-blur-md rounded-lg p-3 w-56 text-xs text-zinc-200 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold uppercase text-[10px] text-zinc-400 tracking-wider">Playback Optimization</span>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Quality Selector */}
            {levels.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Resolution Quality</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={-1}>Auto (Adaptive)</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name} {lvl.bitrate ? `(${Math.round(lvl.bitrate / 1000)} kbps)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mode Controls */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Buffer Mode</span>
                <button
                  onClick={() => setLowLatency(!lowLatency)}
                  className="text-[10px] font-bold uppercase text-purple-400 hover:underline"
                >
                  {lowLatency ? 'Low Latency' : 'Smooth (6s)'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">CORS Proxy</span>
                <button
                  onClick={() => setUseProxy(!useProxy)}
                  className="text-[10px] font-bold uppercase text-purple-400 hover:underline"
                >
                  {useProxy ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <button
              onClick={handleManualRetry}
              className="mt-1 w-full bg-purple-600 hover:bg-purple-500 text-white py-1 rounded text-xs font-bold uppercase tracking-wider text-center"
            >
              Re-Sync Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HlsPlayer;


