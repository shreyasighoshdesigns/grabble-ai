import React, { useState } from 'react';
import { Screenshot } from '../types';
import { MoreHorizontal, Download, Trash2, Check, X } from 'lucide-react';

interface ScreenshotCardProps {
  key?: React.Key;
  screenshot: Screenshot;
  onClick: () => void;
  onDeleteScreenshot?: (id: string) => void;
}

export function ScreenshotCard({ screenshot, onClick, onDeleteScreenshot }: ScreenshotCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = screenshot.url;
    a.download = screenshot.title || 'screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm && onDeleteScreenshot) {
      onDeleteScreenshot(screenshot.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  return (
    <div className="group relative break-inside-avoid mb-4 sm:mb-6 flex flex-col gap-2">
      {/* Image Container */}
      <div 
        onClick={onClick}
        className="relative rounded-2xl overflow-hidden bg-zinc-200 cursor-zoom-in"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', screenshot.id);
          e.dataTransfer.effectAllowed = 'copy';
        }}
      >
        <img 
          src={screenshot.url} 
          alt={screenshot.title} 
          className="w-full h-auto object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        
        {/* Actions Overlay */}
        {showDeleteConfirm ? (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-zinc-900/95 backdrop-blur-md rounded-full px-2 py-1 shadow-lg animate-in fade-in zoom-in-95 cursor-default" onClick={e => e.stopPropagation()}>
            <span className="text-xs font-semibold text-white px-1">Delete?</span>
            <button 
              type="button"
              onClick={handleDelete} 
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={cancelDelete} 
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDeleteScreenshot && (
              <button 
                type="button"
                onClick={handleDelete}
                className="p-2 bg-white/95 backdrop-blur-md text-zinc-600 hover:text-red-600 hover:bg-white rounded-full shadow-sm transition-all translate-y-1 group-hover:translate-y-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              type="button"
              onClick={handleDownload}
              className="p-2 bg-white/95 backdrop-blur-md text-zinc-900 hover:bg-white rounded-full shadow-sm transition-all translate-y-1 group-hover:translate-y-0 delay-75"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details below image */}
      <div className="flex items-start justify-between px-1">
        <div className="flex flex-col pr-2">
          <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
            {screenshot.title}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
            {screenshot.screenType}
          </p>
          {screenshot.colorPalette && screenshot.colorPalette.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {screenshot.colorPalette.slice(0, 5).map((color, idx) => (
                <div 
                  key={`${color}-${idx}`} 
                  className="w-3 h-3 rounded-full border border-black/10" 
                  style={{ backgroundColor: color }} 
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
        <button className="p-1.5 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
