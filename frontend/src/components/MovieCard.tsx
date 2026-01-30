import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star } from 'lucide-react';

interface MovieCardProps {
    id: string | number;
    title: string;
    poster: string;
    rating?: number;
    year?: string;
    type: 'movie' | 'tv';
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, poster, rating, year, type }) => {
    const navigate = useNavigate();

    return (
        <div
            className="group relative flex flex-col gap-3 cursor-pointer animate-slide-up"
            onClick={() => navigate(`/${type}/${id}`)}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl glass-card group-hover:shadow-primary transition-all duration-500">
                <img
                    src={poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-primary/40 mx-auto mb-4">
                        <Play className="text-white fill-white ml-1" size={28} />
                    </div>
                    <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Nexus Stream</p>
                        <h4 className="font-bold text-sm line-clamp-2">{title}</h4>
                    </div>
                </div>

                {rating && (
                    <div className="absolute top-4 right-4 glass px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                        <Star size={14} className="fill-yellow-400" />
                        {rating.toFixed(1)}
                    </div>
                )}

                <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider group-hover:scale-110 transition-transform duration-300">
                    {type}
                </div>
            </div>

            <div className="px-1 group-hover:translate-x-1 transition-transform duration-300">
                <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-glow">
                    {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold">
                        {year ? year.split('-')[0] : 'N/A'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                        {type}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
