import React, { useState, useEffect, useMemo } from 'react';
import { Screenshot } from '../types';
import { ScreenshotCard } from '../components/ScreenshotCard';
import { searchScreenshots } from '../services/geminiService';
import { Loader2, Sparkles, Filter, X } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  onDeleteScreenshot?: (id: string) => void;
}

export function SearchResults({ query, screenshots, onSelectScreenshot, isFilterOpen, setIsFilterOpen, onDeleteScreenshot }: SearchResultsProps) {
  const [results, setResults] = useState<Screenshot[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedScreenType, setSelectedScreenType] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const uniqueScreenTypes = useMemo(() => Array.from(new Set(screenshots.map(s => s.screenType))).filter(Boolean).sort(), [screenshots]);
  const uniqueComponents = useMemo(() => Array.from(new Set(screenshots.flatMap(s => s.components))).filter(Boolean).sort(), [screenshots]);
  const uniqueColors = useMemo(() => Array.from(new Set(screenshots.flatMap(s => s.colorPalette))).filter(Boolean).sort(), [screenshots]);

  useEffect(() => {
    let isMounted = true;

    const performSearch = async () => {
      let filteredScreenshots = screenshots;
      if (selectedScreenType) {
        filteredScreenshots = filteredScreenshots.filter(s => s.screenType === selectedScreenType);
      }
      if (selectedComponent) {
        filteredScreenshots = filteredScreenshots.filter(s => s.components.includes(selectedComponent));
      }
      if (selectedColor) {
        filteredScreenshots = filteredScreenshots.filter(s => s.colorPalette.includes(selectedColor));
      }

      if (!query.trim()) {
        setResults(filteredScreenshots);
        return;
      }

      if (filteredScreenshots.length === 0) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const matchedIds = await searchScreenshots(query, filteredScreenshots);
        if (isMounted) {
          const matchedScreenshots = matchedIds
            .map(id => filteredScreenshots.find(s => s.id === id))
            .filter((s): s is Screenshot => s !== undefined);
          setResults(matchedScreenshots);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (isMounted) {
          // Fallback to simple text search
          const lowerQuery = query.toLowerCase();
          const fallbackResults = filteredScreenshots.filter(s => 
            s.title.toLowerCase().includes(lowerQuery) ||
            s.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
            (s.customTags || []).some(t => t.toLowerCase().includes(lowerQuery)) ||
            s.components.some(c => c.toLowerCase().includes(lowerQuery))
          );
          setResults(fallbackResults);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    const debounceTimer = setTimeout(performSearch, 500);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [query, screenshots, selectedScreenType, selectedComponent, selectedColor]);

  const clearFilters = () => {
    setSelectedScreenType('');
    setSelectedComponent('');
    setSelectedColor('');
  };

  const hasActiveFilters = selectedScreenType || selectedComponent || selectedColor;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#a3e635] shrink-0" />
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 truncate">
            {query ? `AI Results for "${query}"` : "All Screenshots"}
          </h2>
        </div>
        
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            hasActiveFilters || isFilterOpen 
              ? 'bg-[#f4fce3] text-[#84cc16] border border-indigo-200' 
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-[#a3e635] rounded-full">
              {[selectedScreenType, selectedComponent, selectedColor].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {isFilterOpen && (
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900">Filter Results</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Screen Type</label>
              <select 
                value={selectedScreenType} 
                onChange={(e) => setSelectedScreenType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
              >
                <option value="">All Types</option>
                {uniqueScreenTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Component</label>
              <select 
                value={selectedComponent} 
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
              >
                <option value="">All Components</option>
                {uniqueComponents.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Color Palette</label>
              <select 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
              >
                <option value="">All Colors</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#a3e635]" />
          <p>Analyzing screenshots with Gemini...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6">
          {results.map((screenshot) => (
            <ScreenshotCard 
              key={screenshot.id} 
              screenshot={screenshot} 
              onClick={() => onSelectScreenshot(screenshot)} 
              onDeleteScreenshot={onDeleteScreenshot}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No matching screenshots found.</p>
          <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}
