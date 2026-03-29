import { useState } from 'react';
import { Screenshot, Board, SmartFolder, normalizeScreenType } from '../types';
import { HomeFeed } from './HomeFeed';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { AddToFolderModal } from '../components/AddToFolderModal';

interface BoardDetailScreenProps {
  board?: Board;
  smartFolder?: SmartFolder;
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  onBack: () => void;
  onAddExistingToBoard?: (boardId: string, screenshotIds: string[]) => void;
  onUploadNewToBoard?: (boardId: string, screenshot: Screenshot) => void;
  onAddExistingToSmartFolder?: (folder: SmartFolder, screenshotIds: string[]) => void;
  onUploadNewToSmartFolder?: (folder: SmartFolder, screenshot: Screenshot) => void;
  onDeleteScreenshot?: (id: string) => void;
  onDeleteBoard?: (id: string) => void;
}

export function BoardDetailScreen({ 
  board, 
  smartFolder, 
  screenshots, 
  onSelectScreenshot, 
  onBack,
  onAddExistingToBoard,
  onUploadNewToBoard,
  onAddExistingToSmartFolder,
  onUploadNewToSmartFolder,
  onDeleteScreenshot,
  onDeleteBoard
}: BoardDetailScreenProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  let filteredScreenshots: Screenshot[] = [];
  let title = '';
  let subtitle = '';

  if (board) {
    filteredScreenshots = board.screenshotIds
      .map(id => screenshots.find(s => s.id === id))
      .filter(Boolean) as Screenshot[];
    title = board.name;
    subtitle = `${filteredScreenshots.length} Pins`;
  } else if (smartFolder) {
    filteredScreenshots = screenshots.filter(s => 
      smartFolder.type === 'screenType' 
        ? normalizeScreenType(s.screenType) === smartFolder.value 
        : s.components?.includes(smartFolder.value)
    );
    title = smartFolder.name;
    subtitle = `${filteredScreenshots.length} Pins • AI Smart Folder`;
  }

  const handleAddExisting = (screenshotIds: string[]) => {
    if (board && onAddExistingToBoard) {
      onAddExistingToBoard(board.id, screenshotIds);
    } else if (smartFolder && onAddExistingToSmartFolder) {
      onAddExistingToSmartFolder(smartFolder, screenshotIds);
    }
    setIsAddModalOpen(false);
  };

  const handleUploadNew = (screenshot: Screenshot) => {
    if (board && onUploadNewToBoard) {
      onUploadNewToBoard(board.id, screenshot);
    } else if (smartFolder && onUploadNewToSmartFolder) {
      onUploadNewToSmartFolder(smartFolder, screenshot);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 w-full gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={onBack}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900 truncate">{title}</h2>
              <p className="text-xs sm:text-sm text-zinc-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-11 sm:ml-0">
            {board && onDeleteBoard && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this folder?')) {
                    onDeleteBoard(board.id);
                  }
                }}
                className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors"
                title="Delete Folder"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-[#84cc16] text-white hover:text-zinc-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4 text-inherit" />
              <span className="hidden sm:inline">Add Screenshots</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

      {filteredScreenshots.length > 0 ? (
        <HomeFeed 
          screenshots={filteredScreenshots} 
          onSelectScreenshot={onSelectScreenshot} 
          onDeleteScreenshot={onDeleteScreenshot}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <p>No pins in this folder yet.</p>
        </div>
      )}

      {isAddModalOpen && (
        <AddToFolderModal
          onClose={() => setIsAddModalOpen(false)}
          onAddExisting={handleAddExisting}
          onUploadNew={handleUploadNew}
          screenshots={screenshots}
          currentScreenshotIds={filteredScreenshots.map(s => s.id)}
        />
      )}
    </div>
  );
}
