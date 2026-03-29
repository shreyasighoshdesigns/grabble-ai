import { Home, LayoutGrid, PlusCircle, Search, Sparkles, Folder, ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { ViewState } from '../App';
import { Board, SmartFolder, Moodboard } from '../types';
import { useState } from 'react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenUpload: () => void;
  onOpenFindSimilar: () => void;
  boards: Board[];
  smartFolders: SmartFolder[];
  moodboards: Moodboard[];
  onDropToBoard: (boardId: string, screenshotId: string) => void;
  onDropToSmartFolder?: (folder: SmartFolder, screenshotId: string) => void;
  onSelectBoard: (board: Board) => void;
  onSelectSmartFolder: (folder: SmartFolder) => void;
  onSelectMoodboard: (moodboard: Moodboard) => void;
}

export function Sidebar({ 
  currentView, 
  onNavigate, 
  onOpenUpload, 
  onOpenFindSimilar,
  boards,
  smartFolders,
  moodboards,
  onDropToBoard,
  onDropToSmartFolder,
  onSelectBoard,
  onSelectSmartFolder,
  onSelectMoodboard
}: SidebarProps) {
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [isYourFoldersExpanded, setIsYourFoldersExpanded] = useState(false);
  const [isSmartFoldersExpanded, setIsSmartFoldersExpanded] = useState(false);

  return (
    <aside className="w-64 bg-zinc-950 bg-gradient-to-b from-white/[0.03] to-transparent border-r border-zinc-800 flex flex-col h-full hidden md:flex relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="p-6 relative z-10 w-full select-none cursor-pointer group">
        <div className="flex items-center text-white leading-none relative">
          <img src="/grabble-logo-dark.png" alt="Grabble AI Logo" className="h-[2.5rem] transition-transform group-hover:scale-105 z-10 object-contain" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 space-y-4 pb-4 relative z-10">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'home' ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            Home Feed
          </button>
          
          <div>
            <button
              onClick={() => {
                onNavigate('boards');
                setIsYourFoldersExpanded(true);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'boards' || currentView === 'boardDetail' ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-5 h-5" />
                All Folders
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsYourFoldersExpanded(!isYourFoldersExpanded);
                }}
                className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              >
                {isYourFoldersExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            
            {isYourFoldersExpanded && (
              <div className="mt-2 ml-4 pl-4 border-l border-zinc-800 space-y-4">
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Your Folders
                  </div>
                  <div className="space-y-1 mt-1">
                    {boards.map(board => (
                      <div
                        key={board.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverBoardId(board.id);
                        }}
                        onDragLeave={() => setDragOverBoardId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverBoardId(null);
                          const screenshotId = e.dataTransfer.getData('text/plain');
                          if (screenshotId) {
                            onDropToBoard(board.id, screenshotId);
                          }
                        }}
                        onClick={() => onSelectBoard(board)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          dragOverBoardId === board.id ? 'bg-[#a3e635]/20 text-[#bef264]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Folder className="w-4 h-4" />
                        <span className="truncate">{board.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Smart Folders
                  </div>
                  <div className="space-y-1 mt-1">
                    {smartFolders.length > 0 ? (
                      smartFolders.slice(0, 5).map(folder => (
                        <div
                          key={`${folder.type}-${folder.value}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverBoardId(`smart-${folder.type}-${folder.value}`);
                          }}
                          onDragLeave={() => setDragOverBoardId(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverBoardId(null);
                            const screenshotId = e.dataTransfer.getData('text/plain');
                            if (screenshotId) {
                              onDropToSmartFolder?.(folder, screenshotId);
                            }
                          }}
                          onClick={() => onSelectSmartFolder(folder)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                            dragOverBoardId === `smart-${folder.type}-${folder.value}` ? 'bg-[#a3e635]/20 text-[#bef264]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="w-4 h-4 rounded bg-[#a3e635]/20 flex items-center justify-center border border-[#a3e635]/30">
                            <Sparkles className="w-2.5 h-2.5 text-[#bef264]" />
                          </div>
                          <span className="truncate">{folder.name}</span>
                          <span className="ml-auto text-xs text-zinc-500">{folder.count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-zinc-600">
                        Upload screenshots to see AI folders
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => onNavigate('moodboards')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'moodboards' || currentView === 'moodboardDetail' ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5" />
                Moodboards
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-2 border-t border-zinc-800 relative z-10">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          AI Tools
        </div>
        <button
          onClick={onOpenFindSimilar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
          Find Similar UI
        </button>
      </div>

      <div className="p-4 border-t border-zinc-800 relative z-10">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/10"
        >
          <PlusCircle className="w-5 h-5" />
          Upload
        </button>
      </div>
    </aside>
  );
}
