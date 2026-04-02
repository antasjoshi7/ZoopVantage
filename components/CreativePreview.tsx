
import React, { useState, useRef } from 'react';
import { Icons } from '../constants';

interface CreativePreviewProps {
    videoUrl: string;
    adName: string;
    className?: string;
    showPlayButton?: boolean;
    aspectRatio?: string;
}

const CreativePreview: React.FC<CreativePreviewProps> = ({
    videoUrl,
    adName,
    className = "",
    showPlayButton = true,
    aspectRatio = "aspect-[9/16]"
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className={`relative overflow-hidden group/preview ${aspectRatio} ${className} bg-black`}>
            <video
                ref={videoRef}
                src={videoUrl}
                className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'opacity-100' : 'opacity-70 group-hover/preview:opacity-90'}`}
                preload="metadata"
                loop
                playsInline
                muted={!isPlaying} // Mute when it's just a "screenshot" or if user hasn't explicitly unmuted? 
                // Actually, if they click play, we probably want sound. But auto-playing metadata version should be muted.
                onClick={togglePlay}
            />

            {!isPlaying && showPlayButton && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center group/playbtn"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,215,0,0.3)] transform group-hover/playbtn:scale-110 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                    </div>
                </button>
            )}

            {isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/preview:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                </button>
            )}

            {!isPlaying && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-widest">
                    PREVIEW
                </div>
            )}
        </div>
    );
};

export default CreativePreview;
