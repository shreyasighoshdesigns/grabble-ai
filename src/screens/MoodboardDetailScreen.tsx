import React, { useState, useRef, useEffect } from 'react';
import { Screenshot, Moodboard, MoodboardItem } from '../types';
import { ArrowLeft, MoreHorizontal, Share2, Sparkles, LayoutGrid, Type as TypeIcon, Download, Palette } from 'lucide-react';
import { MoodboardCanvas } from '../components/MoodboardCanvas';
import { updateMoodboard } from '../services/firebaseService';
import { auth } from '../firebase';
import { generateMoodboardTitle, generateMoodboardDescription, clusterMoodboardItems } from '../services/aiService';
import { AddToFolderModal } from '../components/AddToFolderModal';
import { toPng, toJpeg } from 'html-to-image';

interface MoodboardDetailScreenProps {
  moodboard: Moodboard;
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  onBack: () => void;
  onAddExistingToMoodboard: (moodboardId: string, screenshotIds: string[]) => void;
  onUploadNewToMoodboard: (moodboardId: string, screenshot: Screenshot) => void;
  onRemoveFromMoodboard: (moodboardId: string, screenshotId: string) => void;
  onReorderMoodboard: (moodboardId: string, newOrder: string[]) => void;
}

export function MoodboardDetailScreen({ 
  moodboard, 
  screenshots, 
  onSelectScreenshot, 
  onBack,
  onAddExistingToMoodboard,
  onUploadNewToMoodboard,
}: MoodboardDetailScreenProps) {
  
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);
  const [localBgValue, setLocalBgValue] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
      if (bgMenuRef.current && !bgMenuRef.current.contains(event.target as Node)) {
        setIsBgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateItems = async (items: MoodboardItem[]) => {
    if (!auth.currentUser) return;
    try {
      await updateMoodboard(auth.currentUser.uid, { ...moodboard, items });
    } catch (error) {
      console.error("Failed to update moodboard items", error);
    }
  };

  const handleGenerateTitle = async () => {
    if (!auth.currentUser || !moodboard.items || moodboard.items.length === 0) return;
    setIsGenerating(true);
    setIsAiMenuOpen(false);
    try {
      const newTitle = await generateMoodboardTitle(moodboard.items);
      await updateMoodboard(auth.currentUser.uid, { ...moodboard, name: newTitle });
    } catch (error) {
      console.error("Failed to generate title", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClusterItems = async () => {
    if (!auth.currentUser || !moodboard.items || moodboard.items.length === 0) return;
    setIsGenerating(true);
    setIsAiMenuOpen(false);
    try {
      const newItems = await clusterMoodboardItems(moodboard.items);
      await handleUpdateItems(newItems);
    } catch (error) {
      console.error("Failed to cluster items", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddExisting = async (screenshotIds: string[]) => {
    onAddExistingToMoodboard(moodboard.id, screenshotIds);
    
    // Add to canvas as well
    const newItems: MoodboardItem[] = screenshotIds.map((id, index) => {
      const screenshot = screenshots.find(s => s.id === id);
      return {
        id: `item-${Date.now()}-${index}`,
        type: 'image',
        x: 100 + (index * 20),
        y: 100 + (index * 20),
        width: 300,
        height: 300,
        zIndex: (moodboard.items?.length || 0) + index + 1,
        content: { screenshotId: id, url: screenshot?.url }
      };
    });
    
    await handleUpdateItems([...(moodboard.items || []), ...newItems]);
    setIsAddModalOpen(false);
  };

  const handleUploadNew = async (screenshot: Screenshot) => {
    onUploadNewToMoodboard(moodboard.id, screenshot);
    
    // Add to canvas
    const newItem: MoodboardItem = {
      id: `item-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 300,
      height: 300,
      zIndex: (moodboard.items?.length || 0) + 1,
      content: { screenshotId: screenshot.id, url: screenshot.url }
    };
    
    await handleUpdateItems([...(moodboard.items || []), newItem]);
    setIsAddModalOpen(false);
  };

  const handleDownload = async (format: 'png' | 'jpeg') => {
    setIsDownloadMenuOpen(false);
    const element = document.getElementById('moodboard-canvas-container');
    if (!element) return;

    const bgColor = moodboard.bgType === 'color' ? (moodboard.bgValue || '#F4F4F5') : (moodboard.bgType === 'image' ? 'transparent' : '#F4F4F5');

    try {
      const dataUrl = format === 'png' 
        ? await toPng(element, { quality: 1, backgroundColor: bgColor })
        : await toJpeg(element, { quality: 0.9, backgroundColor: bgColor });
      
      const link = document.createElement('a');
      link.download = `${moodboard.name || 'moodboard'}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download moodboard:', err);
      alert('Failed to download moodboard. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div className="flex flex-col">
            <input 
              type="text" 
              defaultValue={moodboard.name}
              onBlur={(e) => {
                if (auth.currentUser && e.target.value !== moodboard.name) {
                  updateMoodboard(auth.currentUser.uid, { ...moodboard, name: e.target.value });
                }
              }}
              className="text-xl font-bold tracking-tight text-zinc-900 bg-transparent border-none outline-none hover:bg-zinc-50 focus:bg-zinc-50 rounded px-2 py-1 -ml-2 transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={bgMenuRef}>
            <button 
              onClick={() => setIsBgMenuOpen(!isBgMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <Palette className="w-4 h-4" />
              Background
            </button>
            
            {isBgMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-zinc-200 p-4 z-50 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-2 block">Background Type</label>
                  <div className="flex gap-2">
                    <button onClick={() => auth.currentUser && updateMoodboard(auth.currentUser.uid, { ...moodboard, bgType: 'dots' })} className={`flex-1 py-1.5 text-xs rounded-md border ${(!moodboard.bgType || moodboard.bgType === 'dots') ? 'border-[#a3e635] bg-[#f4fce3] text-[#3f6212]' : 'border-zinc-200 hover:bg-zinc-50'}`}>Dots</button>
                    <button onClick={() => auth.currentUser && updateMoodboard(auth.currentUser.uid, { ...moodboard, bgType: 'color' })} className={`flex-1 py-1.5 text-xs rounded-md border ${moodboard.bgType === 'color' ? 'border-[#a3e635] bg-[#f4fce3] text-[#3f6212]' : 'border-zinc-200 hover:bg-zinc-50'}`}>Color</button>
                    <button onClick={() => auth.currentUser && updateMoodboard(auth.currentUser.uid, { ...moodboard, bgType: 'image' })} className={`flex-1 py-1.5 text-xs rounded-md border ${moodboard.bgType === 'image' ? 'border-[#a3e635] bg-[#f4fce3] text-[#3f6212]' : 'border-zinc-200 hover:bg-zinc-50'}`}>Image</button>
                  </div>
                </div>
                
                {moodboard.bgType === 'color' && (
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2 block">Color</label>
                    <input 
                      type="color" 
                      value={localBgValue !== null ? localBgValue : (moodboard.bgValue || '#F4F4F5')} 
                      onChange={(e) => setLocalBgValue(e.target.value)}
                      onBlur={() => {
                        if (auth.currentUser && localBgValue !== null) {
                          updateMoodboard(auth.currentUser.uid, { ...moodboard, bgValue: localBgValue });
                          setLocalBgValue(null);
                        }
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                )}

                {moodboard.bgType === 'image' && (
                  <div>
                    <label className="text-xs font-medium text-zinc-500 mb-2 block">Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={localBgValue !== null ? localBgValue : (moodboard.bgValue || '')} 
                      onChange={(e) => setLocalBgValue(e.target.value)}
                      onBlur={() => {
                        if (auth.currentUser && localBgValue !== null) {
                          updateMoodboard(auth.currentUser.uid, { ...moodboard, bgValue: localBgValue });
                          setLocalBgValue(null);
                        }
                      }}
                      className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635] mb-2"
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !auth.currentUser) return;
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const MAX_SIZE = 1920;
                              
                              if (width > height && width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              } else if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, width, height);
                                ctx.drawImage(img, 0, 0, width, height);
                              }
                              
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                              updateMoodboard(auth.currentUser!.uid, { ...moodboard, bgValue: compressedBase64 });
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="w-full py-2 text-xs font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
                        Upload Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={downloadMenuRef}>
            <button 
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            {isDownloadMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50">
                <button 
                  onClick={() => handleDownload('png')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left"
                >
                  Download as PNG
                </button>
                <button 
                  onClick={() => handleDownload('jpeg')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left"
                >
                  Download as JPEG
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          
          <div className="relative" ref={aiMenuRef}>
            <button 
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#84cc16] rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'AI Actions'}
            </button>
            
            {isAiMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50">
                <button 
                  onClick={handleGenerateTitle}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left"
                >
                  <TypeIcon className="w-4 h-4 text-zinc-400" />
                  Generate Title
                </button>
                <button 
                  onClick={handleClusterItems}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left"
                >
                  <LayoutGrid className="w-4 h-4 text-zinc-400" />
                  Auto-Cluster Items
                </button>
              </div>
            )}
          </div>

          <button
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600 ml-2"
            title="More Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <MoodboardCanvas 
          moodboard={{ ...moodboard, bgValue: localBgValue !== null ? localBgValue : moodboard.bgValue }} 
          screenshots={screenshots} 
          onUpdateItems={handleUpdateItems} 
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </div>

      {isAddModalOpen && (
        <AddToFolderModal
          onClose={() => setIsAddModalOpen(false)}
          onAddExisting={handleAddExisting}
          onUploadNew={handleUploadNew}
          screenshots={screenshots}
          currentScreenshotIds={moodboard.items?.filter(i => i.type === 'image').map(i => i.content.screenshotId as string) || []}
        />
      )}
    </div>
  );
}
