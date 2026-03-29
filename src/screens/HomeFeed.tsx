import { useState } from 'react';
import { Screenshot } from '../types';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { categorizeScreenshot } from '../services/geminiService';
import { Loader2, Image as ImageIcon, Plus } from 'lucide-react';

interface HomeFeedProps {
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  onDeleteScreenshot?: (id: string) => void;
  onUpdateScreenshot?: (screenshot: Screenshot) => Promise<void>;
  onOpenUpload?: () => void;
}

export function HomeFeed({ screenshots, onSelectScreenshot, onDeleteScreenshot, onUpdateScreenshot, onOpenUpload }: HomeFeedProps) {
  const [filter, setFilter] = useState<'All' | 'Mobile' | 'Web'>('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleFilterClick = async (newFilter: 'All' | 'Mobile' | 'Web') => {
    setFilter(newFilter);
    if (newFilter === 'All' || !onUpdateScreenshot) return;

    // Isolate the ones lacking absolute category
    const uncategorized = screenshots.filter(s => !s.category && s.url?.startsWith('data:image'));
    if (uncategorized.length === 0) return;

    setIsAnalyzing(true);
    for (const s of uncategorized) {
      try {
        const parts = s.url.split(',');
        if (parts.length < 2) continue;
        
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const base64Data = parts[1];
        
        const detectedCategory = await categorizeScreenshot(base64Data, mimeType);
        await onUpdateScreenshot({ ...s, category: detectedCategory });
      } catch (error) {
        console.error("Failed to automatically categorize old screenshot:", error);
      }
    }
    setIsAnalyzing(false);
  };

  const filteredScreenshots = screenshots.filter(s => {
    if (filter === 'All') return true;
    if (s.category) return s.category === filter;
    
    // Fallback heuristic for older screenshots until they finish AI analysis
    const searchString = `${s.screenType} ${s.tags.join(' ')} ${s.customTags?.join(' ') || ''}`.toLowerCase();
    
    if (filter === 'Mobile') {
      return searchString.includes('mobile') || searchString.includes('ios') || searchString.includes('android') || searchString.includes('app');
    }
    if (filter === 'Web') {
      return searchString.includes('web') || searchString.includes('desktop') || searchString.includes('landing');
    }
    
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 truncate">Your Inspirations</h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full animate-pulse shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-[#a3e635]" />
              <span className="hidden sm:inline">Analyzing older images...</span>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => handleFilterClick('All')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${filter === 'All' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >All</button>
          <button
            onClick={() => handleFilterClick('Mobile')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${filter === 'Mobile' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >Mobile</button>
          <button
            onClick={() => handleFilterClick('Web')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${filter === 'Web' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >Web</button>
        </div>
      </div>

      {screenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[50vh]">
          <div className="relative w-48 h-48 mb-8 cursor-pointer group" onClick={onOpenUpload}>
            <div className="absolute inset-2 bg-[#f4fce3] border-2 border-zinc-900 rounded-3xl shadow-[4px_4px_0px_#27272a] transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
            <div className="absolute inset-2 bg-white border-2 border-dashed border-zinc-900 rounded-3xl flex items-center justify-center transform -rotate-2 group-hover:-rotate-4 transition-transform duration-300">
               <div className="bg-[#a3e635] p-4 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_#27272a] rotate-[-6deg] z-10 group-hover:scale-110 transition-transform duration-300">
                 <ImageIcon className="w-8 h-8 stroke-2 text-zinc-900" />
               </div>
               <div className="absolute -right-3 -top-3 w-10 h-10 border-2 border-zinc-900 bg-white rounded-full flex items-center justify-center shadow-[2px_2px_0px_#27272a] rotate-12 text-zinc-900 z-20 group-hover:rotate-45 transition-transform duration-300">
                 <Plus className="w-5 h-5 stroke-[3]" />
               </div>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">Your canvas is blank</h3>
          <p className="text-zinc-500 font-medium text-center max-w-sm">
            Upload your first screenshot, wireframe, or UI flow. Grabble AI will auto-tag and pull palettes for you.
          </p>
        </div>
      ) : filteredScreenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 font-medium h-[50vh]">
          No screens found for "{filter}".
        </div>
      ) : (
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6">
          {filteredScreenshots.map((screenshot) => (
            <ScreenshotCard 
              key={screenshot.id} 
              screenshot={screenshot} 
              onClick={() => onSelectScreenshot(screenshot)} 
              onDeleteScreenshot={onDeleteScreenshot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
