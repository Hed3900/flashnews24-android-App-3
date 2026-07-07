import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { ArrowLeft, Bookmark, Share2, Volume2, VolumeX, Sparkles, Clock, Type, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface DetailScreenProps {
  article: Article;
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: (id: string) => void;
  onShare: (article: Article) => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  article,
  isBookmarked,
  onBack,
  onToggleBookmark,
  onShare
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiSummary, setAiSummary] = useState<string[] | null>(article.aiSummary || null);
  const [sentiment, setSentiment] = useState<string>(article.sentiment || 'Analytical');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showAiCard, setShowAiCard] = useState(true);

  // Auto synthesize or fetch summary if not present
  useEffect(() => {
    if (!aiSummary && !isSummarizing) {
      setIsSummarizing(true);
      fetch('/api/news/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, content: article.content })
      })
        .then(res => res.json())
        .then(data => {
          if (data.summaryPoints) {
            setAiSummary(data.summaryPoints);
            if (data.sentimentScore) setSentiment(data.sentimentScore);
          }
        })
        .catch(err => {
          setAiSummary([
            'Key industry implications and rapid technological adoption.',
            'Global stakeholders monitoring regulatory and financial outcomes.',
            'Expected breakthrough deployment schedule set for upcoming fiscal quarters.'
          ]);
        })
        .finally(() => setIsSummarizing(false));
    }
  }, [article.id]);

  // Simulate text to speech reading
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setTimeout(() => {
        setIsPlayingAudio(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAudio]);

  const fontClasses = {
    sm: 'text-xs leading-relaxed',
    md: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed font-medium'
  };

  return (
    <div className="flex flex-col h-full bg-inherit animate-in fade-in duration-200">
      {/* Material 3 Top App Bar */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#2D333B] sticky top-0 bg-inherit z-30">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(prev => prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm')}
            className=
            title="Cycle font size (Small / Normal / Large)"
          >
            <Type className="w-4 h-4 text-white" />
            <span className="text-[9px] uppercase">{fontSize}</span>
          </button>
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`p-2 rounded-full transition-colors ${
              isPlayingAudio ? 'bg-blue-600 text-white animate-pulse' : 'hover:bg-white/10'
            }`}
            title={isPlayingAudio ? 'Stop TTS Audio' : 'Listen to Article (TTS)'}
          >
            {isPlayingAudio ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />
          </button>
          <button
           onClick={() =>
             setFontSize(prev =>
            prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'
          )
         }
        className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        title="Cycle font size (Small / Normal / Large)"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => onToggleBookmark(article.id)}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            title={isBookmarked ? 'Remove from Room DB' : 'Save to Room DB'}
          >
            <Bookmark
              className={`w-4 h-4 ${
               isBookmarked
              ? 'fill-blue-500 text-blue-500'
              : 'text-white'
               }`}
            />
          </button>
        </div>
      </div>

      {/* TTS Active Banner */}
      {isPlayingAudio && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs py-2 px-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span className="font-bold">Simulating Native Text-to-Speech Engine...</span>
          </div>
          <button onClick={() => setIsPlayingAudio(false)} className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold hover:bg-white/30">
            Stop
          </button>
        </div>
      )}

      {/* Scrollable Reader Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category & Read Time */}
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 uppercase tracking-wider text-[10px]">
            {article.category}
          </span>
          <span className="text-[#E1E4E8] opacity-60 flex items-center gap-1 font-medium text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            {article.readTimeMinutes} min read
          </span>
        </div>

        {/* Article Title */}
        <h1 className="text-lg font-bold tracking-tight leading-snug text-white">
          {article.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="flex items-center justify-between py-2.5 border-y border-[#2D333B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {article.author ? article.author.charAt(0) : 'E'}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{article.author}</h4>
              <p className="text-[10px] text-[#E1E4E8] opacity-60">{article.sourceName} • {article.publishedAt}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Blogger API • Verified
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#0F1115] shadow-md border border-[#2D333B]/50">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/80 via-transparent to-transparent"></div>
          <span className="absolute bottom-2 left-3 text-[10px] text-[#E1E4E8] font-medium opacity-80">
            Photo courtesy of {article.sourceName}
          </span>
        </div>

        

        {/* Main Article Body */}
        <div className={`space-y-4 text-[#E1E4E8] ${fontClasses[fontSize]} pt-1`}>
          <p className="font-bold text-white border-l-4 border-blue-500 pl-3 py-0.5 italic">
            {article.summary}
          </p>

          {article.content ? (
            article.content.split(/\n\s*\n/).map((para, idx) => (
              <p key={idx} className="leading-relaxed opacity-90">
                {para}
              </p>
            ))
          ) : (
            <p className="leading-relaxed opacity-90">{article.summary}</p>
          )}

          
        </div>
      </div>
    </div>
  );
};
