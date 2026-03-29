import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { MoodboardItem, MoodboardItemType, Moodboard, Screenshot } from '../types';
import { Plus, Image as ImageIcon, Type, CheckSquare, Palette, User, Link as LinkIcon, Sparkles, RotateCw, Copy, Trash2, Layers } from 'lucide-react';
import { generateInsightCard } from '../services/aiService';

interface MoodboardCanvasProps {
  moodboard: Moodboard;
  screenshots: Screenshot[];
  onUpdateItems: (items: MoodboardItem[]) => void;
  onOpenAddModal: () => void;
}

export function MoodboardCanvas({ moodboard, screenshots, onUpdateItems, onOpenAddModal }: MoodboardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<MoodboardItem[]>(moodboard.items || []);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'canvas' | 'item', itemId?: string } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Sync items when moodboard changes
  useEffect(() => {
    if (moodboard.items) {
      setItems(moodboard.items);
    } else {
      // Convert legacy screenshotIds to items if needed
      if (moodboard.screenshotIds && moodboard.screenshotIds.length > 0 && (!moodboard.items || moodboard.items.length === 0)) {
        const newItems: MoodboardItem[] = moodboard.screenshotIds.map((id, index) => {
          const screenshot = screenshots.find(s => s.id === id);
          return {
            id: `item-${id}`,
            type: 'image',
            x: 100 + (index % 4) * 320,
            y: 100 + Math.floor(index / 4) * 320,
            width: 300,
            height: 300,
            zIndex: index,
            content: { screenshotId: id, url: screenshot?.url }
          };
        });
        setItems(newItems);
        onUpdateItems(newItems);
      }
    }
  }, [moodboard.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      
      // Don't trigger if we're typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteItem(selectedItemId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const itemToDuplicate = items.find(i => i.id === selectedItemId);
        if (itemToDuplicate) {
          duplicateItem(itemToDuplicate);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        bringToFront(selectedItemId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, items]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.005;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, scale + delta), 5);
      
      // Calculate mouse position relative to container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Adjust position to zoom towards mouse
        const scaleRatio = newScale / scale;
        const newX = mouseX - (mouseX - position.x) * scaleRatio;
        const newY = mouseY - (mouseY - position.y) * scaleRatio;

        setPosition({ x: newX, y: newY });
      }
      setScale(newScale);
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey) || e.button === 0 && e.target === containerRef.current) {
      setIsDraggingCanvas(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      setSelectedItemId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingCanvas) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingCanvas(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleItemDragEnd = (id: string, info: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: item.x + info.offset.x / scale,
          y: item.y + info.offset.y / scale
        };
      }
      return item;
    });
    setItems(updatedItems);
    onUpdateItems(updatedItems);
  };

  const handleResizeStart = (e: React.PointerEvent, handle: string, item: MoodboardItem) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = item.width;
    const startHeight = item.height;
    const startItemX = item.x;
    const startItemY = item.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startItemX;
      let newY = startItemY;

      // Proportional resize for corners
      if (handle === 'se') {
        newWidth = Math.max(50, startWidth + deltaX);
        newHeight = startHeight * (newWidth / startWidth);
      } else if (handle === 'sw') {
        newWidth = Math.max(50, startWidth - deltaX);
        newHeight = startHeight * (newWidth / startWidth);
        newX = startItemX + (startWidth - newWidth);
      } else if (handle === 'ne') {
        newWidth = Math.max(50, startWidth + deltaX);
        newHeight = startHeight * (newWidth / startWidth);
        newY = startItemY + (startHeight - newHeight);
      } else if (handle === 'nw') {
        newWidth = Math.max(50, startWidth - deltaX);
        newHeight = startHeight * (newWidth / startWidth);
        newX = startItemX + (startWidth - newWidth);
        newY = startItemY + (startHeight - newHeight);
      }
      // Non-proportional for edges
      else if (handle === 'e') {
        newWidth = Math.max(50, startWidth + deltaX);
      } else if (handle === 'w') {
        newWidth = Math.max(50, startWidth - deltaX);
        newX = startItemX + deltaX;
      } else if (handle === 's') {
        newHeight = Math.max(50, startHeight + deltaY);
      } else if (handle === 'n') {
        newHeight = Math.max(50, startHeight - deltaY);
        newY = startItemY + deltaY;
      }

      setItems(prevItems => prevItems.map(i => 
        i.id === item.id ? { ...i, width: newWidth, height: newHeight, x: newX, y: newY } : i
      ));
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      setItems(prevItems => {
        onUpdateItems(prevItems);
        return prevItems;
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleRotateStart = (e: React.PointerEvent, item: MoodboardItem) => {
    e.stopPropagation();
    const rect = document.getElementById(`item-${item.id}`)?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let degrees = (angle * 180) / Math.PI - 90;
      
      if (moveEvent.shiftKey) {
          degrees = Math.round(degrees / 45) * 45;
      }

      setItems(prevItems => prevItems.map(i => 
        i.id === item.id ? { ...i, rotation: degrees } : i
      ));
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      setItems(prevItems => {
        onUpdateItems(prevItems);
        return prevItems;
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const duplicateItem = (item: MoodboardItem) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      x: item.x + 20,
      y: item.y + 20,
      zIndex: Math.max(0, ...items.map(i => i.zIndex)) + 1
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onUpdateItems(updatedItems);
    setSelectedItemId(newItem.id);
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(i => i.id !== id);
    setItems(updatedItems);
    onUpdateItems(updatedItems);
    setSelectedItemId(null);
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...items.map(i => i.zIndex));
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, zIndex: maxZ + 1 } : item
    );
    setItems(updatedItems);
    onUpdateItems(updatedItems);
  };

  const sendToBack = (id: string) => {
    const minZ = Math.min(0, ...items.map(i => i.zIndex));
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, zIndex: minZ - 1 } : item
    );
    setItems(updatedItems);
    onUpdateItems(updatedItems);
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'canvas' | 'item', itemId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, itemId });
    if (itemId) {
      setSelectedItemId(itemId);
    }
  };

  const addItem = (type: MoodboardItemType) => {
    if (type === 'image') {
      setIsMenuOpen(false);
      onOpenAddModal();
      return;
    }

    const newItem: MoodboardItem = {
      id: `item-${Date.now()}`,
      type,
      x: -position.x / scale + 100,
      y: -position.y / scale + 100,
      width: 300,
      height: type === 'text' ? 150 : 300,
      zIndex: Math.max(0, ...items.map(i => i.zIndex)) + 1,
      content: type === 'text' ? { text: 'New Note' } : {}
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onUpdateItems(updatedItems);
    setIsMenuOpen(false);
  };

  const handleGenerateAICard = async () => {
    setIsMenuOpen(false);
    if (items.length === 0) {
      alert("Add some items to the board first so AI can generate insights!");
      return;
    }
    setIsGenerating(true);
    try {
      const insightText = await generateInsightCard(items);
      const newItem: MoodboardItem = {
        id: `item-${Date.now()}`,
        type: 'text',
        x: -position.x / scale + window.innerWidth / 2 - 150,
        y: -position.y / scale + window.innerHeight / 2 - 100,
        width: 300,
        height: 200,
        zIndex: Math.max(0, ...items.map(i => i.zIndex)) + 1,
        content: { text: insightText }
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      onUpdateItems(updatedItems);
    } catch (error) {
      console.error("Failed to generate AI card", error);
      alert("Failed to generate AI card. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      id="moodboard-canvas-container"
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => handleContextMenu(e, 'canvas')}
      style={{ 
        touchAction: 'none',
        backgroundColor: moodboard.bgType === 'color' ? moodboard.bgValue : (moodboard.bgType === 'image' ? 'transparent' : '#F4F4F5'),
        backgroundImage: moodboard.bgType === 'image' ? `url(${moodboard.bgValue})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dot Grid Background */}
      {(!moodboard.bgType || moodboard.bgType === 'dots') && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'radial-gradient(#E4E4E7 2px, transparent 2px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
          }}
        />
      )}

      {/* Canvas Layer */}
      <motion.div
        className="absolute origin-top-left"
        style={{
          x: position.x,
          y: position.y,
          scale: scale
        }}
      >
        {items.map(item => (
          <motion.div
            id={`item-${item.id}`}
            key={item.id}
            drag
            dragMomentum={false}
            onDragStart={() => bringToFront(item.id)}
            onDragEnd={(_, info) => handleItemDragEnd(item.id, info)}
            className={`absolute group ${item.type === 'image' || item.type === 'palette' ? '' : 'bg-white rounded-[12px] border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow'}`}
            style={{
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              zIndex: item.zIndex,
              rotate: item.rotation || 0
            }}
            whileDrag={{ scale: 1.02, boxShadow: item.type === 'image' ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedItemId(item.id);
            }}
            onContextMenu={(e) => handleContextMenu(e, 'item', item.id)}
          >
            {/* Selection Overlay (Canva style) */}
            {selectedItemId === item.id && (
              <>
                {/* Border */}
                <div className="absolute inset-0 border-[1.5px] border-[#a3e635] pointer-events-none z-10" />
                
                {/* Corner Handles */}
                <div className="absolute -top-[7px] -left-[7px] w-3.5 h-3.5 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-nwse-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'nw', item)} />
                <div className="absolute -top-[7px] -right-[7px] w-3.5 h-3.5 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-nesw-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'ne', item)} />
                <div className="absolute -bottom-[7px] -left-[7px] w-3.5 h-3.5 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-nesw-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'sw', item)} />
                <div className="absolute -bottom-[7px] -right-[7px] w-3.5 h-3.5 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-nwse-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'se', item)} />
                
                {/* Edge Handles */}
                <div className="absolute top-1/2 -left-[5px] w-2.5 h-6 -translate-y-1/2 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-ew-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'w', item)} />
                <div className="absolute top-1/2 -right-[5px] w-2.5 h-6 -translate-y-1/2 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-ew-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'e', item)} />
                <div className="absolute -top-[5px] left-1/2 w-6 h-2.5 -translate-x-1/2 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-ns-resize z-20" onPointerDown={(e) => handleResizeStart(e, 'n', item)} />
                <div className="absolute -bottom-[5px] left-1/2 w-6 h-2.5 -translate-x-1/2 bg-white border-[1.5px] border-[#a3e635] rounded-full shadow-sm cursor-ns-resize z-20" onPointerDown={(e) => handleResizeStart(e, 's', item)} />

                {/* Rotation Handle */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-zinc-200 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-600 shadow-md z-20 hover:bg-zinc-50 transition-colors" onPointerDown={(e) => handleRotateStart(e, item)}>
                  <RotateCw className="w-3.5 h-3.5" />
                </div>

                {/* Floating Toolbar */}
                <div className="absolute -top-12 left-0 bg-white rounded-lg shadow-md border border-zinc-200 px-1 py-1 flex items-center gap-1 cursor-default z-30" onPointerDown={e => e.stopPropagation()}>
                  <button onClick={() => duplicateItem(item)} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-zinc-100 rounded text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-zinc-200 mx-1" />
                  <button onClick={() => bringToFront(item.id)} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Bring Forward"><Layers className="w-4 h-4" /></button>
                </div>
              </>
            )}

            {/* Render item content based on type */}
            <div className={`w-full h-full overflow-hidden flex flex-col ${item.type === 'image' || item.type === 'palette' ? '' : 'p-4'}`}>
              {item.type === 'image' && (
                <img 
                  src={item.content.url} 
                  alt="" 
                  className="w-full h-full object-cover pointer-events-none" 
                  style={{
                    opacity: item.content.opacity ?? 1,
                    border: item.content.border ? '4px solid white' : 'none',
                    boxShadow: item.content.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
                    borderRadius: item.content.border ? '8px' : '0px'
                  }}
                />
              )}
              {item.type !== 'image' && (
                <div 
                  style={{
                    width: 300,
                    height: item.height / (item.width / 300),
                    transform: `scale(${item.width / 300})`,
                    transformOrigin: 'top left'
                  }}
                  className="flex flex-col"
                >
                  {item.type === 'text' && (
                    <div 
                      className="w-full h-full text-[#111111] font-sans outline-none" 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newText = e.currentTarget.textContent || '';
                        setItems(prev => {
                          const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, text: newText } } : i);
                          onUpdateItems(updated);
                          return updated;
                        });
                      }}
                    >
                      {item.content.text || 'Type something...'}
                    </div>
                  )}
                  {item.type === 'checklist' && (
                    <div className="w-full h-full flex flex-col gap-2">
                      <div 
                        className="font-semibold text-zinc-900 mb-2" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newTitle = e.currentTarget.textContent || 'Checklist';
                          setItems(prev => {
                            const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, title: newTitle } } : i);
                            onUpdateItems(updated);
                            return updated;
                          });
                        }}
                      >
                        {item.content.title || 'Checklist'}
                      </div>
                      {(item.content.tasks || [{text: 'Task 1', checked: false}, {text: 'Task 2', checked: false}, {text: 'Task 3', checked: false}]).map((task: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={task.checked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setItems(prev => {
                                const updated = prev.map(it => {
                                  if (it.id === item.id) {
                                    const newTasks = [...(it.content.tasks || [])];
                                    newTasks[i] = { ...newTasks[i], checked };
                                    return { ...it, content: { ...it.content, tasks: newTasks } };
                                  }
                                  return it;
                                });
                                onUpdateItems(updated);
                                return updated;
                              });
                            }}
                            className="w-4 h-4 rounded border-zinc-300 text-[#84cc16] focus:ring-[#a3e635]" 
                          />
                          <div 
                            className="flex-1 text-sm text-zinc-700 outline-none" 
                            contentEditable 
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newText = e.currentTarget.textContent || '';
                              setItems(prev => {
                                const updated = prev.map(it => {
                                  if (it.id === item.id) {
                                    const newTasks = [...(it.content.tasks || [])];
                                    newTasks[i] = { ...newTasks[i], text: newText };
                                    return { ...it, content: { ...it.content, tasks: newTasks } };
                                  }
                                  return it;
                                });
                                onUpdateItems(updated);
                                return updated;
                              });
                            }}
                          >
                            {task.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === 'palette' && (
                    <div className="w-full h-full flex flex-col">
                      <div className="flex flex-1 gap-2">
                        {(item.content.colors || ['#4F7DF3', '#EAEAEA', '#111111', '#FAFAFA']).map((color: string, idx: number) => (
                          <div key={idx} className="flex-1 rounded-lg shadow-sm border border-zinc-200/50 flex flex-col justify-end p-2 relative overflow-hidden group/color" style={{ backgroundColor: color }}>
                            <input 
                              type="color" 
                              value={color}
                              onChange={(e) => {
                                const newColors = [...(item.content.colors || ['#4F7DF3', '#EAEAEA', '#111111', '#FAFAFA'])];
                                newColors[idx] = e.target.value;
                                setItems(prev => prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, colors: newColors } } : i));
                              }}
                              onBlur={() => setItems(prev => { onUpdateItems(prev); return prev; })}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="text-[10px] font-mono bg-white/80 backdrop-blur-sm px-1 py-0.5 rounded text-zinc-900 text-center pointer-events-none opacity-0 group-hover/color:opacity-100 transition-opacity">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.type === 'persona' && (
                    <div className="w-full h-full flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden">
                          <User className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <div 
                            className="font-semibold text-zinc-900 outline-none" 
                            contentEditable 
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newName = e.currentTarget.textContent || 'Persona Name';
                              setItems(prev => {
                                const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, name: newName } } : i);
                                onUpdateItems(updated);
                                return updated;
                              });
                            }}
                          >
                            {item.content.name || 'Persona Name'}
                          </div>
                          <div 
                            className="text-xs text-zinc-500 outline-none" 
                            contentEditable 
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newRole = e.currentTarget.textContent || 'Role / Title';
                              setItems(prev => {
                                const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, role: newRole } } : i);
                                onUpdateItems(updated);
                                return updated;
                              });
                            }}
                          >
                            {item.content.role || 'Role / Title'}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="text-sm text-zinc-700 outline-none flex-1" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newDetails = e.currentTarget.textContent || '';
                          setItems(prev => {
                            const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, details: newDetails } } : i);
                            onUpdateItems(updated);
                            return updated;
                          });
                        }}
                      >
                        {item.content.details || 'Add persona details, goals, and frustrations here...'}
                      </div>
                    </div>
                  )}
                  {item.type === 'link' && (
                    <div className="w-full h-full flex flex-col gap-2 justify-center items-center text-center">
                      <div className="w-10 h-10 bg-[#f4fce3] text-[#84cc16] rounded-full flex items-center justify-center mb-2">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <div 
                        className="font-medium text-zinc-900 outline-none w-full" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newTitle = e.currentTarget.textContent || 'Link Title';
                          setItems(prev => {
                            const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, title: newTitle } } : i);
                            onUpdateItems(updated);
                            return updated;
                          });
                        }}
                      >
                        {item.content.title || 'Link Title'}
                      </div>
                      <a 
                        href={item.content.url || '#'} 
                        className="text-xs text-[#a3e635] hover:underline outline-none w-full truncate" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newUrl = e.currentTarget.textContent || 'https://example.com';
                          setItems(prev => {
                            const updated = prev.map(i => i.id === item.id ? { ...i, content: { ...i.content, url: newUrl } } : i);
                            onUpdateItems(updated);
                            return updated;
                          });
                        }}
                      >
                        {item.content.url || 'https://example.com'}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Inspector Panel */}
      {selectedItemId && items.find(i => i.id === selectedItemId)?.type === 'image' && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-xl border border-zinc-200 p-4 w-64 z-50 flex flex-col gap-4">
          <div className="font-semibold text-zinc-900 text-sm">Image Settings</div>
          
          {/* Opacity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-500 font-medium">Opacity</label>
              <span className="text-xs text-zinc-700 font-mono">{Math.round((items.find(i => i.id === selectedItemId)?.content.opacity ?? 1) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={items.find(i => i.id === selectedItemId)?.content.opacity ?? 1}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, content: { ...i.content, opacity: val } } : i));
              }}
              onPointerUp={() => setItems(prev => { onUpdateItems(prev); return prev; })}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Border */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 font-medium">Border</label>
            <input 
              type="checkbox" 
              checked={items.find(i => i.id === selectedItemId)?.content.border ?? false}
              onChange={(e) => {
                const val = e.target.checked;
                const updated = items.map(i => i.id === selectedItemId ? { ...i, content: { ...i.content, border: val } } : i);
                setItems(updated);
                onUpdateItems(updated);
              }}
              className="w-4 h-4 rounded border-zinc-300 text-[#84cc16] focus:ring-[#a3e635]"
            />
          </div>

          {/* Shadow */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 font-medium">Shadow</label>
            <input 
              type="checkbox" 
              checked={items.find(i => i.id === selectedItemId)?.content.shadow ?? false}
              onChange={(e) => {
                const val = e.target.checked;
                const updated = items.map(i => i.id === selectedItemId ? { ...i, content: { ...i.content, shadow: val } } : i);
                setItems(updated);
                onUpdateItems(updated);
              }}
              className="w-4 h-4 rounded border-zinc-300 text-[#84cc16] focus:ring-[#a3e635]"
            />
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 w-48 flex flex-col gap-1"
          >
            <button onClick={() => addItem('image')} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 rounded-xl text-sm text-zinc-700 transition-colors text-left w-full">
              <ImageIcon className="w-4 h-4" /> Image
            </button>
            <button onClick={() => addItem('text')} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 rounded-xl text-sm text-zinc-700 transition-colors text-left w-full">
              <Type className="w-4 h-4" /> Note
            </button>
            <button onClick={() => addItem('checklist')} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 rounded-xl text-sm text-zinc-700 transition-colors text-left w-full">
              <CheckSquare className="w-4 h-4" /> Checklist
            </button>
            <button onClick={() => addItem('palette')} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 rounded-xl text-sm text-zinc-700 transition-colors text-left w-full">
              <Palette className="w-4 h-4" /> Color Palette
            </button>
            <div className="h-px bg-zinc-100 my-1" />
            <button 
              onClick={handleGenerateAICard}
              disabled={isGenerating}
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#f4fce3] rounded-xl text-sm text-[#84cc16] font-medium transition-colors text-left w-full disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate AI Card'}
            </button>
          </motion.div>
        )}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-[#a3e635] text-zinc-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#84cc16] transition-all flex items-center gap-2 font-medium"
        >
          <Plus className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-45' : ''}`} />
          Add Content
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Delete Item</h3>
            <p className="text-zinc-500 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const updatedItems = items.filter(i => i.id !== itemToDelete);
                  setItems(updatedItems);
                  onUpdateItems(updatedItems);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[200] bg-white border border-zinc-200 shadow-xl rounded-lg py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'item' && contextMenu.itemId ? (
            <>
              <button 
                onClick={() => {
                  const item = items.find(i => i.id === contextMenu.itemId);
                  if (item) duplicateItem(item);
                  setContextMenu(null);
                }} 
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
              <button 
                onClick={() => {
                  bringToFront(contextMenu.itemId!);
                  setContextMenu(null);
                }} 
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Bring to Front
              </button>
              <button 
                onClick={() => {
                  sendToBack(contextMenu.itemId!);
                  setContextMenu(null);
                }} 
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 rotate-180" /> Send to Back
              </button>
              <div className="h-px bg-zinc-200 my-1" />
              <button 
                onClick={() => {
                  deleteItem(contextMenu.itemId!);
                  setContextMenu(null);
                }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { addItem('image'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Add Image
              </button>
              <button onClick={() => { addItem('text'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2">
                <Type className="w-4 h-4" /> Add Note
              </button>
              <button onClick={() => { addItem('checklist'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Add Checklist
              </button>
              <button onClick={() => { addItem('palette'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Add Palette
              </button>
              <div className="h-px bg-zinc-200 my-1" />
              <button 
                onClick={() => { handleGenerateAICard(); setContextMenu(null); }} 
                disabled={isGenerating}
                className="w-full text-left px-4 py-2 text-sm text-[#84cc16] hover:bg-[#f4fce3] flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate AI Card'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
