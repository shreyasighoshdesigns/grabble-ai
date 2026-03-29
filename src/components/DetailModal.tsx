import React, { useState } from 'react';
import { Screenshot, Board } from '../types';
import { X, Layers, Palette, Calendar, Sparkles, Download, Share2, MoreHorizontal, PlusCircle, Check, Tag, Trash2, Copy } from 'lucide-react';

interface DetailModalProps {
  screenshot: Screenshot;
  boards: Board[];
  onClose: () => void;
  onAddToBoard: (boardId: string) => void;
  onUpdateScreenshot?: (screenshot: Screenshot) => void;
  onDeleteScreenshot?: (id: string) => void;
  onCreateBoard?: () => void;
}

export function DetailModal({ screenshot, boards, onClose, onAddToBoard, onUpdateScreenshot, onDeleteScreenshot, onCreateBoard }: DetailModalProps) {
  const [showBoards, setShowBoards] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const response = await fetch(screenshot.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = screenshot.url;
    a.download = screenshot.title || 'screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPalette = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const swatchSize = 80;
    const padding = 40;
    const gap = 24;
    
    // Scale for high DPI
    const scale = 2;
    const width = padding * 2 + (swatchSize * screenshot.colorPalette.length) + (gap * (screenshot.colorPalette.length - 1));
    const height = padding * 2 + swatchSize + 60;

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(screenshot.title || 'Color Palette', padding, padding - 10);

    // Draw circular swatches
    screenshot.colorPalette.forEach((color, index) => {
      const centerX = padding + (swatchSize + gap) * index + swatchSize / 2;
      const centerY = padding + 20 + swatchSize / 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, swatchSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Light border around circles
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Hex code
      ctx.fillStyle = '#52525b';
      ctx.font = '500 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), centerX, centerY + swatchSize / 2 + 25);
    });

    // Create download link
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${screenshot.title || 'palette'}-colors.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !onUpdateScreenshot) return;
    
    const tagToAdd = newTag.trim().substring(0, 50);
    const currentCustomTags = screenshot.customTags || [];
    
    if (!currentCustomTags.includes(tagToAdd) && currentCustomTags.length < 20) {
      onUpdateScreenshot({
        ...screenshot,
        customTags: [...currentCustomTags, tagToAdd]
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!onUpdateScreenshot) return;
    const currentCustomTags = screenshot.customTags || [];
    onUpdateScreenshot({
      ...screenshot,
      customTags: currentCustomTags.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Image Section */}
        <div className="w-full md:w-2/3 h-[40%] md:h-full shrink-0 bg-zinc-100 relative flex items-center justify-center overflow-hidden group">
          <img 
            src={screenshot.url} 
            alt={screenshot.title} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
          
          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={onClose} className="p-2.5 bg-white/90 backdrop-blur-md text-zinc-900 hover:bg-white rounded-full shadow-sm transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {onDeleteScreenshot && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-3 shadow-sm">
                    <span className="text-sm font-medium text-zinc-700">Delete?</span>
                    <button onClick={() => onDeleteScreenshot(screenshot.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)} 
                    className="p-2.5 bg-white/90 backdrop-blur-md text-zinc-600 hover:text-red-600 hover:bg-white rounded-full shadow-sm transition-all"
                    title="Delete Screenshot"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )
              )}
              <button 
                onClick={handleCopy}
                className="p-2.5 bg-white/90 backdrop-blur-md text-zinc-900 hover:bg-white rounded-full shadow-sm transition-all"
                title="Copy Image"
              >
                {isCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleDownload}
                className="p-2.5 bg-white/90 backdrop-blur-md text-zinc-900 hover:bg-white rounded-full shadow-sm transition-all"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/3 bg-white flex flex-col flex-1 h-[60%] md:h-full border-t md:border-t-0 md:border-l border-zinc-100 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  {screenshot.screenType}
                </div>
                <button className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 leading-tight mb-2">{screenshot.title}</h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar className="w-4 h-4" />
                {new Date(screenshot.dateAdded).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* AI Tags */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a3e635]" />
                AI Generated Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {screenshot.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-[#f4fce3] text-[#3f6212] rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                Custom Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(screenshot.customTags || []).map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1 group">
                    {tag}
                    {onUpdateScreenshot && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-0 group-hover:opacity-100 hover:text-emerald-900 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {onUpdateScreenshot && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTag(e as any);
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    maxLength={50}
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag as any}
                    disabled={!newTag.trim() || (screenshot.customTags?.length || 0) >= 20}
                    className="px-3 py-1.5 bg-[#a3e635] text-zinc-900 font-bold rounded-lg text-sm font-medium hover:bg-[#84cc16] disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Components */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Detected Components</h3>
              <div className="flex flex-wrap gap-2">
                {screenshot.components.map(comp => (
                  <span key={comp} className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm hover:bg-zinc-200 transition-colors cursor-pointer">
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-zinc-500" />
                  Color Palette
                </h3>
                <button 
                  onClick={handleDownloadPalette}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                  title="Download Palette Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3">
                {screenshot.colorPalette.map(color => (
                  <div key={color} className="group relative cursor-pointer">
                    <div 
                      className="w-12 h-12 rounded-full shadow-sm border border-zinc-200 hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: color }}
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#a3e635] text-zinc-900 font-bold text-xs py-1.5 px-2.5 rounded-md pointer-events-none whitespace-nowrap z-10 font-mono">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          <div className="shrink-0 p-6 border-t border-zinc-100 bg-zinc-50/50 relative">
            {showBoards ? (
              <div className="absolute bottom-full left-6 right-6 mb-2 bg-white rounded-xl shadow-xl border border-zinc-100 p-2 max-h-64 flex flex-col animate-in slide-in-from-bottom-2">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2 flex-shrink-0">
                  Select a Folder
                </div>
                <div className="overflow-y-auto flex-1">
                  {boards.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-zinc-500 text-center">
                      No folders created yet.
                    </div>
                  ) : (
                    boards.map(board => {
                      const isAdded = board.screenshotIds.includes(screenshot.id);
                      return (
                        <button
                          key={board.id}
                          onClick={() => {
                            if (!isAdded) {
                              onAddToBoard(board.id);
                              setShowBoards(false);
                            }
                          }}
                          disabled={isAdded}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="font-medium truncate">{board.name}</span>
                          {isAdded && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      );
                    })
                  )}
                </div>
                {onCreateBoard && (
                  <button
                    onClick={() => {
                      setShowBoards(false);
                      onCreateBoard();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#84cc16] hover:bg-[#f4fce3] rounded-lg transition-colors mt-1 border-t border-zinc-100 flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create new folder
                  </button>
                )}
              </div>
            ) : null}
            <button 
              onClick={() => setShowBoards(!showBoards)}
              className="w-full py-3.5 bg-zinc-900 hover:bg-[#84cc16] text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Save to Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
