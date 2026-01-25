
import React from 'react';

interface StreamContainerProps {
  channel: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

const StreamContainer: React.FC<StreamContainerProps> = ({ 
  channel, 
  title, 
  subtitle = "Direct Kick.com Integration",
  accentColor = "purple"
}) => {
  const embedUrl = `https://player.kick.com/${channel}?autoplay=true&muted=false`;

  return (
    <div className="group relative w-full space-y-4">
      <div className="flex justify-between items-end px-2">
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter">
            {title.split(' ')[0]} <span className={`text-${accentColor}-500`}>{title.split(' ').slice(1).join(' ')}</span>
          </h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Channel:</span>
           <span className={`text-[9px] font-black uppercase tracking-widest text-${accentColor}-400 underline decoration-zinc-800`}>{channel}</span>
        </div>
      </div>

      <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen={true}
          scrolling="no"
        />

        {/* OVERLAYS */}
        <div className="absolute top-6 left-6 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75`}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">Live Stream</span>
           </div>
        </div>
      </div>
      
      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-2 italic">
        * If playback doesn't start, please click the player to unmute/activate.
      </p>
    </div>
  );
};

export default StreamContainer;
