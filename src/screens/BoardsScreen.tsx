import { useState } from 'react';
import { Board, Screenshot, SmartFolder } from '../types';
import { Folder, Sparkles } from 'lucide-react';

interface BoardsScreenProps {
  boards: Board[];
  screenshots: Screenshot[];
  smartFolders: SmartFolder[];
  onCreateBoard: () => void;
  onSelectBoard: (board: Board) => void;
  onSelectSmartFolder: (folder: SmartFolder) => void;
  onDropToBoard?: (boardId: string, screenshotId: string) => void;
  onDropToSmartFolder?: (folder: SmartFolder, screenshotId: string) => void;
}

export function BoardsScreen({ 
  boards, 
  screenshots, 
  smartFolders, 
  onCreateBoard, 
  onSelectBoard, 
  onSelectSmartFolder,
  onDropToBoard,
  onDropToSmartFolder
}: BoardsScreenProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const renderBoardImages = (boardScreenshots: Screenshot[]) => {
    if (boardScreenshots.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400">
          <Folder className="w-8 h-8" />
        </div>
      );
    }

    const img1 = boardScreenshots[0]?.url;
    const img2 = boardScreenshots[1]?.url;
    const img3 = boardScreenshots[2]?.url;

    return (
      <div className="flex h-full w-full gap-0.5 bg-white">
        <div className="w-2/3 h-full bg-zinc-200">
          {img1 && <img src={img1} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
        </div>
        <div className="w-1/3 h-full flex flex-col gap-0.5">
          <div className="h-1/2 bg-zinc-200">
            {img2 && <img src={img2} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
          </div>
          <div className="h-1/2 bg-zinc-200">
            {img3 && <img src={img3} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-10 w-full gap-3">
        <div className="flex flex-col items-start min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-1 sm:mb-2">Your Folders</h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-lg">
            Organize your UI inspirations into folders or let Grabble AI categorize them smartly.
          </p>
        </div>
        <button
          onClick={onCreateBoard}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-zinc-900 text-[#a3e635] text-sm font-bold rounded-full hover:bg-zinc-800 shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          Add Folder
        </button>
      </div>

      {screenshots.length === 0 && boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[50vh]">
          <div className="relative w-48 h-48 mb-8 group">
            <div className="absolute inset-2 bg-blue-100 border-2 border-zinc-900 rounded-3xl shadow-[4px_4px_0px_#27272a] transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
            <div className="absolute inset-2 bg-white border-2 border-zinc-900 rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_#27272a] transform rotate-2 group-hover:rotate-4 transition-transform duration-300">
               <div className="bg-blue-300 p-4 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_#27272a] rotate-[6deg] z-10 group-hover:scale-110 transition-transform duration-300">
                 <Folder className="w-8 h-8 stroke-2 text-zinc-900" />
               </div>
               <div className="absolute -left-3 -bottom-3 w-10 h-10 border-2 border-zinc-900 bg-white rounded-full flex items-center justify-center shadow-[2px_2px_0px_#27272a] -rotate-12 text-zinc-900 z-20 group-hover:-rotate-45 transition-transform duration-300">
                 <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-zinc-900" />
               </div>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">Nothing to organize yet</h3>
          <p className="text-zinc-500 font-medium text-center max-w-sm">
            Upload some designs to let our AI build smart folders, or create your own custom folders.
          </p>
        </div>
      ) : (
        <>
          <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

          {/* User Boards */}
          {boards.map((board) => {
            const boardScreenshots = board.screenshotIds
              .map(id => screenshots.find(s => s.id === id))
              .filter(Boolean) as Screenshot[];

            return (
              <div 
                key={board.id} 
                className="group cursor-pointer flex flex-col"
                onClick={() => onSelectBoard(board)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(board.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                  const screenshotId = e.dataTransfer.getData('text/plain');
                  if (screenshotId && onDropToBoard) {
                    onDropToBoard(board.id, screenshotId);
                  }
                }}
              >
                <div className={`aspect-[4/3] rounded-2xl overflow-hidden relative mb-2 border transition-colors ${dragOverId === board.id ? 'border-[#a3e635] ring-2 ring-[#a3e635] ring-offset-2' : 'border-zinc-200'}`}>
                  {renderBoardImages(boardScreenshots)}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                </div>
                <h3 className="font-semibold text-zinc-900 truncate">{board.name}</h3>
                <p className="text-xs text-zinc-500">{board.screenshotIds.length} Pins</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Folders */}
      <div className="pt-8 border-t border-zinc-200">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#a3e635]" />
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">AI Smart Folders</h2>
        </div>
        
          {smartFolders.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {smartFolders.map((folder) => {
                const folderScreenshots = screenshots.filter(s => 
                  folder.type === 'screenType' 
                    ? s.screenType === folder.value 
                    : s.components?.includes(folder.value)
                );

                return (
                  <div 
                    key={`${folder.type}-${folder.value}`} 
                    className="group cursor-pointer flex flex-col relative"
                    onClick={() => onSelectSmartFolder(folder)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(`smart-${folder.type}-${folder.value}`);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverId(null);
                      const screenshotId = e.dataTransfer.getData('text/plain');
                      if (screenshotId && onDropToSmartFolder) {
                        onDropToSmartFolder(folder, screenshotId);
                      }
                    }}
                  >
                    <div className={`aspect-[4/3] rounded-2xl overflow-hidden relative mb-2 border transition-colors ${dragOverId === `smart-${folder.type}-${folder.value}` ? 'border-[#a3e635] ring-2 ring-[#a3e635] ring-offset-2' : 'border-zinc-200'}`}>
                      {renderBoardImages(folderScreenshots)}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-zinc-900 truncate">{folder.name}</h3>
                    <p className="text-xs text-zinc-500">{folder.count} Pins</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
              <Sparkles className="w-8 h-8 mb-3 text-zinc-400" />
              <p className="font-medium">No smart folders yet</p>
              <p className="text-sm mt-1">Upload screenshots and AI will organize them here</p>
            </div>
          )}
        </div>
      </>
      )}
    </div>
  );
}
