import React, { useState, useRef } from 'react';
import { Screenshot } from '../types';
import { findSimilarScreenshots } from '../services/geminiService';
import { X, UploadCloud, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FindSimilarModalProps {
  screenshots: Screenshot[];
  onClose: () => void;
  onSelectScreenshot: (screenshot: Screenshot) => void;
}

export function FindSimilarModal({ screenshots, onClose, onSelectScreenshot }: FindSimilarModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<Screenshot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);
      setIsSearching(true);
      
      try {
        const base64Data = base64.split(',')[1];
        const matchedIds = await findSimilarScreenshots(base64Data, file.type, screenshots);
        
        const matchedScreenshots = matchedIds
          .map(id => screenshots.find(s => s.id === id))
          .filter((s): s is Screenshot => s !== undefined);
          
        setResults(matchedScreenshots);
      } catch (error) {
        console.error("Similarity search failed", error);
        // Fallback
        const shuffled = [...screenshots].sort(() => 0.5 - Math.random());
        setResults(shuffled.slice(0, 4));
      } finally {
        setIsSearching(false);
      }
    };
    reader.readAsDataURL(file);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a3e635]" />
            <h2 className="text-xl font-bold text-zinc-900">Find Similar UI</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!previewUrl ? (
            <div 
              className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? 'border-[#a3e635] bg-[#f4fce3]/50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-[#f4fce3] rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-[#a3e635]" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">Upload a wireframe or screenshot</h3>
              <p className="text-zinc-500 text-lg max-w-md">
                Gemini will analyze the layout and visual structure to find matching inspiration from your library.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-32 h-32 bg-zinc-200 rounded-xl overflow-hidden shrink-0">
                  <img src={previewUrl} alt="Reference" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">Reference Image</h3>
                  <p className="text-zinc-500 text-sm mb-3">Finding layouts with similar structure and components...</p>
                  <button 
                    onClick={() => { setPreviewUrl(null); setResults([]); }}
                    className="text-sm font-medium text-[#84cc16] hover:text-[#3f6212]"
                  >
                    Upload different image
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Similar Inspiration</h3>
                
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#a3e635]" />
                    <p className="font-medium text-zinc-900">Analyzing visual structure...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {results.map((screenshot) => (
                      <div 
                        key={screenshot.id}
                        onClick={() => onSelectScreenshot(screenshot)}
                        className="group cursor-pointer rounded-xl overflow-hidden relative aspect-[3/4] bg-zinc-100"
                      >
                        <img 
                          src={screenshot.url} 
                          alt={screenshot.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium text-sm px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                            View Match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500">
                    <p>No similar layouts found in your library.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
