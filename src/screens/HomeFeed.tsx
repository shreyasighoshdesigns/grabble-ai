import { useState } from 'react';
import { Screenshot } from '../types';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { categorizeScreenshot } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

interface HomeFeedProps {
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  onDeleteScreenshot?: (id: string) => void;
  onUpdateScreenshot?: (screenshot: Screenshot) => Promise<void>;
}

export function HomeFeed({ screenshots, onSelectScreenshot, onDeleteScreenshot, onUpdateScreenshot }: HomeFeedProps) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">For You</h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#a3e635]" />
              <span className="hidden sm:inline">Analyzing older images...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleFilterClick('All')} 
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === 'All' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >All</button>
          <button 
            onClick={() => handleFilterClick('Mobile')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors hidden sm:block ${filter === 'Mobile' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >Mobile</button>
          <button 
            onClick={() => handleFilterClick('Web')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors hidden sm:block ${filter === 'Web' ? 'bg-[#a3e635] text-zinc-900 font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >Web</button>
        </div>
      </div>

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
    </div>
  );
}
