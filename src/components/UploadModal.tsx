import React, { useState, useRef } from 'react';
import { Screenshot } from '../types';
import { analyzeScreenshot } from '../services/geminiService';
import { X, UploadCloud, Loader2, Sparkles, CheckCircle2, Tag } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onComplete: (screenshot: Screenshot) => void;
}

export function UploadModal({ onClose, onComplete }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<Partial<Screenshot> | null>(null);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setIsAnalyzing(true);
    
    const compressImage = (file: File): Promise<{ base64: string, width: number, height: number, colors: string[] }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
            }
            
            // Instantly extract literal image colors offline
            const extractColors = () => {
              if (!ctx) return [];
              const imageData = ctx.getImageData(0, 0, width, height).data;
              const colorCounts = new Map<string, number>();
              
              for (let i = 0; i < imageData.length; i += 40) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];
                if (a < 128) continue;
                if (r > 245 && g > 245 && b > 245) continue; // Deprioritize massive white backgrounds
                
                const round = (val: number) => Math.min(255, Math.round(val / 32) * 32);
                const rr = round(r);
                const gg = round(g);
                const bb = round(b);
                const hex = `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
                
                const isGrayscale = Math.abs(r-g) < 20 && Math.abs(g-b) < 20;
                const weight = isGrayscale ? 0.1 : 1;
                colorCounts.set(hex, (colorCounts.get(hex) || 0) + weight);
              }

              return Array.from(colorCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(entry => entry[0]);
            };

            resolve({
              base64: canvas.toDataURL('image/jpeg', 0.5),
              width: img.width,
              height: img.height,
              colors: extractColors()
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      const { base64: compressedBase64, width, height, colors } = await compressImage(file);
      setPreviewUrl(compressedBase64);
      
      const base64Data = compressedBase64.split(',')[1];
      const data = await analyzeScreenshot(base64Data, 'image/jpeg', file.name, { width, height }, colors);
      setAnalyzedData({ ...data, customTags: [] });
    } catch (error: any) {
      console.error("Gemini Analysis failed:", error);
      alert(`Gemini Intelligence Error:\n${error.message || "Failed to analyze image"}\n\nPlease check your .env file or Google Cloud permissions.`);
      setPreviewUrl(null); // Reset UI so they don't get trapped if AI is completely unavailable
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !analyzedData) return;
    
    const tagToAdd = newTag.trim().substring(0, 50);
    const currentCustomTags = analyzedData.customTags || [];
    
    if (!currentCustomTags.includes(tagToAdd) && currentCustomTags.length < 20) {
      setAnalyzedData({
        ...analyzedData,
        customTags: [...currentCustomTags, tagToAdd]
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!analyzedData) return;
    const currentCustomTags = analyzedData.customTags || [];
    setAnalyzedData({
      ...analyzedData,
      customTags: currentCustomTags.filter(t => t !== tagToRemove)
    });
  };

  const handleSave = () => {
    if (!previewUrl || !analyzedData) return;
    
    const newScreenshot: Screenshot = {
      id: Math.random().toString(36).substring(7),
      url: previewUrl,
      title: (analyzedData.title || 'Untitled').substring(0, 100),
      tags: (analyzedData.tags || []).slice(0, 20).map(t => t.substring(0, 50)),
      customTags: (analyzedData.customTags || []).slice(0, 20).map(t => t.substring(0, 50)),
      screenType: (analyzedData.screenType || 'Unknown').substring(0, 50),
      category: analyzedData.category || 'Mobile',
      components: (analyzedData.components || []).slice(0, 20).map(c => c.substring(0, 50)),
      colorPalette: (analyzedData.colorPalette || []).slice(0, 10).map(c => c.substring(0, 10)),
      dateAdded: new Date().toISOString(),
    };
    
    onComplete(newScreenshot);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Upload Inspiration</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!previewUrl ? (
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors pointer-events-none ${
                isDragging ? 'border-[#a3e635] bg-[#f4fce3]/50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2 pointer-events-auto">Click or drag screenshot here</h3>
              <p className="text-zinc-500 text-sm max-w-sm pointer-events-auto">
                Upload a UI screenshot. Gemini will automatically analyze it to extract tags, colors, and components.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 px-6 py-2 bg-[#a3e635] text-zinc-900 font-bold rounded-xl pointer-events-auto shadow-sm hover:bg-[#84cc16] transition-colors"
               >
                Select File
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="bg-zinc-100 rounded-2xl overflow-hidden aspect-[3/4] relative shadow-inner">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col">
                {isAnalyzing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#a3e635]" />
                    <p className="font-medium text-zinc-900">Analyzing with Gemini...</p>
                    <p className="text-sm mt-1">Extracting UI components and colors</p>
                  </div>
                ) : analyzedData ? (
                  <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Analysis Complete
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Suggested Title</label>
                      <input 
                        type="text" 
                        value={analyzedData.title || ''} 
                        onChange={(e) => setAnalyzedData({...analyzedData, title: e.target.value})}
                        className="w-full text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2 focus:border-[#a3e635] outline-none transition-colors bg-transparent"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Platform</label>
                        <div className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {analyzedData.category || 'Mobile'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Screen Type</label>
                        <div className="inline-flex px-3 py-1.5 bg-zinc-100 text-zinc-800 rounded-lg text-sm font-medium">
                          {analyzedData.screenType}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Auto-Generated Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {analyzedData.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-[#f4fce3] text-[#3f6212] rounded-lg text-sm font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-500" />
                        Custom Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(analyzedData.customTags || []).map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1 group">
                            {tag}
                            <button 
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="opacity-0 group-hover:opacity-100 hover:text-emerald-900 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <form onSubmit={handleAddTag} className="flex gap-2">
                        <input 
                          type="text" 
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          placeholder="Add a custom tag..."
                          className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          maxLength={50}
                        />
                        <button 
                          type="submit"
                          disabled={!newTag.trim() || (analyzedData.customTags?.length || 0) >= 20}
                          className="px-3 py-1.5 bg-[#a3e635] text-zinc-900 font-bold rounded-lg text-sm font-medium hover:bg-[#84cc16] disabled:opacity-50 transition-colors"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Detected Components</label>
                      <div className="flex flex-wrap gap-2">
                        {analyzedData.components?.map(comp => (
                          <span key={comp} className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Color Palette</label>
                      <div className="flex gap-3">
                        {analyzedData.colorPalette?.map(color => (
                          <div key={color} className="group relative">
                            <div 
                              className="w-10 h-10 rounded-full shadow-sm border border-zinc-200"
                              style={{ backgroundColor: color }}
                            />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#a3e635] text-zinc-900 font-bold text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                              {color}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {previewUrl && !isAnalyzing && analyzedData && (
          <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
            <button 
              onClick={() => { setPreviewUrl(null); setAnalyzedData(null); }}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium bg-[#a3e635] text-zinc-900 font-bold rounded-xl hover:bg-[#84cc16] transition-colors shadow-sm"
            >
              Save to Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
