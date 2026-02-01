import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-3 glass rounded-2xl w-[95%] max-w-7xl flex items-center justify-between animate-slide-up">
            <div
                className="flex items-center gap-3 text-2xl font-bold tracking-tight cursor-pointer group"
                onClick={() => navigate('/')}
            >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow group-hover:scale-110 transition-transform duration-500">
                    <Play className="text-white fill-white" size={24} />
                </div>
                <span className="text-gradient font-bold tracking-ultra">
                    NEXUS
                </span>
            </div>

            <div className="hidden md:flex items-center gap-10">
                <button onClick={() => navigate('/')} className="text-sm font-semibold text-text-muted hover:text-white hover:text-glow transition-all duration-300">Home</button>
                <button className="text-sm font-semibold text-text-muted hover:text-white hover:text-glow transition-all duration-300">Movies</button>
                <button className="text-sm font-semibold text-text-muted hover:text-white hover:text-glow transition-all duration-300">TV Shows</button>
                <button className="text-sm font-semibold text-white text-glow">Trending</button>
            </div>

            <div className="flex items-center gap-6">
                <form onSubmit={handleSearch} className="relative hidden sm:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Nexus..."
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all w-64 md:w-80"
                    />
                </form>
                <button className="md:hidden text-text-muted hover:text-white">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
