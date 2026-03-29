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
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-8">Your saved ideas</h2>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-[#a3e635] text-zinc-900 font-bold text-sm font-medium rounded-xl">
              Your folders
            </button>
          </div>
          <button 
            onClick={onCreateBoard}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            Create
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Create Board Card */}
          <div 
            onClick={onCreateBoard}
            className="group cursor-pointer flex flex-col"
          >
            <div className="aspect-[4/3] bg-zinc-200 rounded-2xl overflow-hidden relative mb-2 flex items-center justify-center hover:bg-zinc-300 transition-colors">
              <div className="bg-white px-4 py-2 rounded-full font-semibold text-sm text-zinc-900 shadow-sm">
                Create
              </div>
            </div>
            <h3 className="font-semibold text-zinc-900 invisible">Create</h3>
          </div>

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
    </div>
  );
}
