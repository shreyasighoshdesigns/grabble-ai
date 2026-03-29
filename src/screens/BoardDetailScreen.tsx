import { useState } from 'react';
import { Screenshot, Board, SmartFolder } from '../types';
import { HomeFeed } from './HomeFeed';
import { ArrowLeft, Plus } from 'lucide-react';
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
  onDeleteScreenshot
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
        ? s.screenType === smartFolder.value 
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h2>
            <p className="text-sm text-zinc-500">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-[#84cc16] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Screenshots
        </button>
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
