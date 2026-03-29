import React, { useState, useRef } from 'react';
import { Screenshot } from '../types';
import { X, UploadCloud, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { analyzeScreenshot } from '../services/geminiService';

interface AddToFolderModalProps {
  onClose: () => void;
  onAddExisting: (screenshotIds: string[]) => void;
  onUploadNew: (screenshot: Screenshot) => void;
  screenshots: Screenshot[];
  currentScreenshotIds: string[];
}

export function AddToFolderModal({ onClose, onAddExisting, onUploadNew, screenshots, currentScreenshotIds }: AddToFolderModalProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableScreenshots = screenshots.filter(s => !currentScreenshotIds.includes(s.id));

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleAddExisting = () => {
    if (selectedIds.size > 0) {
      onAddExisting(Array.from(selectedIds));
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setIsAnalyzing(true);
    
    const compressImage = (file: File): Promise<string> => {
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
            
            resolve(canvas.toDataURL('image/jpeg', 0.5));
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      const compressedBase64 = await compressImage(file);
      const base64Data = compressedBase64.split(',')[1];
      const data = await analyzeScreenshot(base64Data, 'image/jpeg');
      
      const newScreenshot: Screenshot = {
        id: Math.random().toString(36).substring(7),
        url: compressedBase64,
        title: data.title || 'Untitled',
        tags: data.tags || [],
        customTags: [],
        screenType: data.screenType || 'Unknown',
        components: data.components || [],
        colorPalette: data.colorPalette || [],
        dateAdded: new Date().toISOString(),
      };

      onUploadNew(newScreenshot);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Add to Folder</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex border-b border-zinc-100 px-6">
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'existing' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Select Existing
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Upload New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-6">
              {availableScreenshots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {availableScreenshots.map(screenshot => (
                    <div 
                      key={screenshot.id}
                      onClick={() => toggleSelection(screenshot.id)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedIds.has(screenshot.id) ? 'border-[#a3e635]' : 'border-transparent hover:border-zinc-200'
                      }`}
                    >
                      <img src={screenshot.url} alt={screenshot.title} className="w-full h-full object-cover" />
                      {selectedIds.has(screenshot.id) && (
                        <div className="absolute top-2 right-2 bg-[#a3e635] text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <ImageIcon className="w-12 h-12 mb-4 text-zinc-300" />
                  <p>No other screenshots available.</p>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging ? 'border-[#a3e635] bg-[#f4fce3]' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-10 h-10 text-[#a3e635] animate-spin mb-4" />
                  <p className="text-zinc-900 font-medium">Analyzing UI with AI...</p>
                  <p className="text-sm text-zinc-500 mt-1">Extracting components and colors</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-900 font-medium text-lg">Click or drag image to upload</p>
                  <p className="text-sm text-zinc-500 mt-2">Supports JPG, PNG, WebP</p>
                </>
              )}
            </div>
          )}
        </div>

        {activeTab === 'existing' && (
          <div className="p-6 border-t border-zinc-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExisting}
              disabled={selectedIds.size === 0}
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-[#84cc16] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
