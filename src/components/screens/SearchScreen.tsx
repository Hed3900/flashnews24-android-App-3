import React, { useState } from 'react';
import { Article } from '../../types';
import { Search, X, Sparkles, Clock, ArrowRight, TrendingUp } from 'lucide-react';

interface SearchScreenProps {
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onClose: () => void;
}

const TRENDING_KEYWORDS = ['Gemini 3.5', 'Android 16', 'Quantum', 'Energy', 'Europe', 'Space', 'James Webb', 'Tokyo'];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  allArticles,
  onSelectArticle,
  onClose
}) => {
  const [query, setQuery] = useState('');

  const filtered = query.trim() === '' 
    ? [] 
    : allArticles.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) || 
        a.summary.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="flex flex-col h-full bg-inherit animate-in fade-in duration-200">
      {/* Material 3 Search App Bar */}
      <div className="p-3 border-b border-[#2D333B] sticky top-0 bg-inherit z-30 flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-[#E1E4E8] opacity-60 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search headlines, AI, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-[#0F1115] text-xs text-white rounded-[24px] pl-10 pr-9 py-2.5 outline-none border border-[#2D333B] focus:border-blue-500 transition-all font-medium placeholder:text-[#E1E4E8]/40"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-[#E1E4E8] opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold text-blue-400 px-2 py-1 hover:opacity-80 transition-opacity"
        >
          Cancel
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {query.trim() === '' ? (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-[11px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                Trending Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setQuery(kw)}
                    className="px-3.5 py-1.5 rounded-[24px] bg-[#0F1115] text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all text-[#E1E4E8] border border-[#2D333B] shadow-sm"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-[24px] bg-[#1A1D23] border border-[#2D333B] text-center space-y-2 mt-6 shadow-xl">
              <Sparkles className="w-6 h-6 text-blue-500 mx-auto" />
              <h4 className="text-xs font-bold text-white">Live Room Database Search</h4>
              <p className="text-[11px] text-[#E1E4E8] opacity-60 leading-relaxed max-w-[260px] mx-auto">
                Queries are executed instantly against SQLite using Flow reactive filters in the MVVM repository layer.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Search className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-white">No results for "{query}"</h4>
            <p className="text-xs text-[#E1E4E8] opacity-60 mt-1">Try another keyword from the trending list.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-[#E1E4E8] opacity-60 uppercase tracking-wider">
              <span>Search Results</span>
              <span>{filtered.length} found</span>
            </div>

            {filtered.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="bg-[#1A1D23] rounded-[24px] p-3.5 shadow-2xl border border-[#2D333B] hover:border-blue-500/40 transition-all cursor-pointer flex gap-3 group"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#0F1115] flex-shrink-0 border border-[#2D333B]/50">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 mb-0.5">
                      <span className="uppercase tracking-wider">{art.sourceName}</span>
                      <span className="text-[#E1E4E8] opacity-60 font-normal">{art.category}</span>
                    </div>
                    <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
                      {art.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[#2D333B] text-[10px] text-[#E1E4E8] opacity-60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 opacity-70" />
                      {art.readTimeMinutes}m read
                    </span>
                    <span className="text-blue-400 font-bold flex items-center gap-0.5">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
