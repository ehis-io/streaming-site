import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';

interface PlayerProps {
    url: string;
    onClose?: () => void;
}

const Player: React.FC<PlayerProps> = ({ url }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isEmbed, setIsEmbed] = useState(false);

    useEffect(() => {
        // Simple heuristic to detect if it's an embed URL
        const embedKeywords = ['/embed/', 'player', 'iframe', 'vidsrc', 'vidlink'];
        const isEmbedUrl = embedKeywords.some(kw => url.includes(kw)) && !url.includes('.m3u8') && !url.includes('.mp4');
        setIsEmbed(isEmbedUrl);

        if (isEmbedUrl) return;

        if (!videoRef.current) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(url);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current?.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                });
                setIsPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('Fatal error, destroying HLS instance');
                            hls.destroy();
                            break;
                    }
                }
            });

            return () => {
                hls.destroy();
            };
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = url;
            videoRef.current.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        }
    }, [url]);

    // Apply volume changes to video element
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const time = (Number(e.target.value) / 100) * videoRef.current.duration;
            videoRef.current.currentTime = time;
            setProgress(Number(e.target.value));
        }
    };

    if (isEmbed) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-black">
                <iframe
                    src={url}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                />
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group border border-white/10 shadow-2xl shadow-black">
            <video
                ref={videoRef}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
            />

            {/* Custom Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 gap-4">

                {/* Progress Bar */}
                <div className="w-full">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                        </button>
                        <div className="flex items-center gap-4">
                            <SkipBack size={20} className="text-white/60 hover:text-white cursor-pointer" />
                            <SkipForward size={20} className="text-white/60 hover:text-white cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2 group/volume">
                            <Volume2 size={20} className="text-white/60" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 h-1 bg-white/20 appearance-none accent-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Settings size={20} className="text-white/60 hover:text-white cursor-pointer" />
                        <Maximize size={20} className="text-white/60 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
