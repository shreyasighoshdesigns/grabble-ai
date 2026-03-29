import { useState, useEffect, useMemo } from 'react';
import { Screenshot, Board, SmartFolder, Moodboard } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './screens/HomeFeed';
import { BoardsScreen } from './screens/BoardsScreen';
import { BoardDetailScreen } from './screens/BoardDetailScreen';
import { MoodboardsScreen } from './screens/MoodboardsScreen';
import { MoodboardDetailScreen } from './screens/MoodboardDetailScreen';
import { UploadModal } from './components/UploadModal';
import { DetailModal } from './components/DetailModal';
import { FindSimilarModal } from './components/FindSimilarModal';
import { CreateBoardModal } from './components/CreateBoardModal';
import { CreateMoodboardModal } from './components/CreateMoodboardModal';
import { LandingPage } from './screens/LandingPage';
import { SearchResults } from './screens/SearchResults';
import { auth, logOut, getRedirectResult } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createUserProfile, getScreenshots, getBoards, getMoodboards, addScreenshot, addBoard, updateBoard, updateScreenshot, deleteScreenshot, addMoodboard, updateMoodboard, deleteMoodboard } from './services/firebaseService';
import { Loader2 } from 'lucide-react';

export type ViewState = 'landing' | 'home' | 'boards' | 'search' | 'boardDetail' | 'moodboards' | 'moodboardDetail';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFindSimilarOpen, setIsFindSimilarOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateMoodboardOpen, setIsCreateMoodboardOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  // Board Detail State
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedSmartFolder, setSelectedSmartFolder] = useState<SmartFolder | null>(null);
  const [selectedMoodboard, setSelectedMoodboard] = useState<Moodboard | null>(null);

  // Compute Smart Folders
  const smartFolders = useMemo(() => {
    const folders: SmartFolder[] = [];
    
    // Group by screenType
    const screenTypes = new Map<string, number>();
    screenshots.forEach(s => {
      if (s.screenType) {
        screenTypes.set(s.screenType, (screenTypes.get(s.screenType) || 0) + 1);
      }
    });
    
    screenTypes.forEach((count, type) => {
      if (count >= 1) {
        folders.push({ name: `${type}s`, type: 'screenType', value: type, count });
      }
    });

    // Group by components
    const components = new Map<string, number>();
    screenshots.forEach(s => {
      s.components?.forEach(c => {
        components.set(c, (components.get(c) || 0) + 1);
      });
    });

    components.forEach((count, comp) => {
      if (count >= 1) {
        folders.push({ name: `${comp}s`, type: 'component', value: comp, count });
      }
    });

    return folders.sort((a, b) => b.count - a.count);
  }, [screenshots]);

  useEffect(() => {
    // Check for redirect result first
    getRedirectResult(auth).catch((error) => {
      console.error("Error from redirect sign in:", error);
      setAsyncError(error instanceof Error ? error : new Error(String(error)));
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (currentUser) {
        setIsDataLoading(true);
        try {
          await createUserProfile(currentUser);
          const [userScreenshots, userBoards, userMoodboards] = await Promise.all([
            getScreenshots(currentUser.uid),
            getBoards(currentUser.uid),
            getMoodboards(currentUser.uid)
          ]);
          setScreenshots(userScreenshots);
          setBoards(userBoards);
          setMoodboards(userMoodboards);
          setView(currentView => currentView === 'landing' ? 'home' : currentView);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAsyncError(error instanceof Error ? error : new Error(String(error)));
        } finally {
          setIsDataLoading(false);
        }
      } else {
        setView('landing');
        setScreenshots([]);
        setBoards([]);
        setMoodboards([]);
      }
    });

    return () => unsubscribe();
  }, []);

  if (asyncError) {
    throw asyncError;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setView('search');
    } else {
      setView('home');
    }
  };

  const handleUploadComplete = async (newScreenshot: Screenshot) => {
    if (user) {
      try {
        await addScreenshot(user.uid, newScreenshot);
        setScreenshots([newScreenshot, ...screenshots]);
      } catch (error) {
        console.error("Error saving screenshot:", error);
      }
    }
    setIsUploadOpen(false);
  };

  const handleCreateBoard = async (name: string, initialScreenshotIds: string[] = []) => {
    if (user) {
      try {
        const coverUrl = initialScreenshotIds.length > 0 ? screenshots.find(s => s.id === initialScreenshotIds[0])?.url : undefined;
        
        const newBoard: Board = {
          id: Math.random().toString(36).substring(7),
          name: name.substring(0, 100),
          screenshotIds: initialScreenshotIds,
          dateCreated: new Date().toISOString(),
        };
        
        if (coverUrl) {
          newBoard.coverUrl = coverUrl;
        }

        await addBoard(user.uid, newBoard);
        setBoards([newBoard, ...boards]);
      } catch (error) {
        console.error("Error creating board:", error);
      }
    }
    setIsCreateBoardOpen(false);
  };

  const handleAddExistingToBoard = async (boardId: string, screenshotIds: string[]) => {
    if (!user) return;
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newScreenshotIds = [...new Set([...board.screenshotIds, ...screenshotIds])];
    const updatedBoard = { ...board, screenshotIds: newScreenshotIds };

    try {
      await updateBoard(user.uid, updatedBoard);
      setBoards(boards.map(b => b.id === boardId ? updatedBoard : b));
      if (selectedBoard?.id === boardId) {
        setSelectedBoard(updatedBoard);
      }
    } catch (error) {
      console.error("Error updating board:", error);
    }
  };

  const handleUploadNewToBoard = async (boardId: string, screenshot: Screenshot) => {
    if (!user) return;
    try {
      await addScreenshot(user.uid, screenshot);
      setScreenshots([screenshot, ...screenshots]);
      
      const board = boards.find(b => b.id === boardId);
      if (board) {
        const updatedBoard = { ...board, screenshotIds: [...board.screenshotIds, screenshot.id] };
        await updateBoard(user.uid, updatedBoard);
        setBoards(boards.map(b => b.id === boardId ? updatedBoard : b));
        if (selectedBoard?.id === boardId) {
          setSelectedBoard(updatedBoard);
        }
      }
    } catch (error) {
      console.error("Error saving screenshot to board:", error);
    }
  };

  const handleAddExistingToSmartFolder = async (folder: SmartFolder, screenshotIds: string[]) => {
    if (!user) return;
    try {
      const updatedScreenshots = [...screenshots];
      for (const id of screenshotIds) {
        const screenshot = updatedScreenshots.find(s => s.id === id);
        if (screenshot) {
          if (folder.type === 'screenType') {
            screenshot.screenType = folder.value;
          } else if (folder.type === 'component') {
            if (!screenshot.components) screenshot.components = [];
            if (!screenshot.components.includes(folder.value)) {
              screenshot.components.push(folder.value);
            }
          }
          await updateScreenshot(user.uid, screenshot);
        }
      }
      setScreenshots(updatedScreenshots);
    } catch (error) {
      console.error("Error updating screenshots for smart folder:", error);
    }
  };

  const handleUploadNewToSmartFolder = async (folder: SmartFolder, screenshot: Screenshot) => {
    if (!user) return;
    try {
      if (folder.type === 'screenType') {
        screenshot.screenType = folder.value;
      } else if (folder.type === 'component') {
        if (!screenshot.components) screenshot.components = [];
        if (!screenshot.components.includes(folder.value)) {
          screenshot.components.push(folder.value);
        }
      }
      await addScreenshot(user.uid, screenshot);
      setScreenshots([screenshot, ...screenshots]);
    } catch (error) {
      console.error("Error saving screenshot to smart folder:", error);
    }
  };

  const handleCreateMoodboard = async (name: string, description: string) => {
    if (!user) return;
    const newMoodboard: Moodboard = {
      id: Math.random().toString(36).substring(7),
      name,
      description,
      screenshotIds: [],
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    };
    try {
      await addMoodboard(user.uid, newMoodboard);
      setMoodboards([...moodboards, newMoodboard]);
      setIsCreateMoodboardOpen(false);
    } catch (error) {
      console.error("Error creating moodboard:", error);
    }
  };

  const handleAddExistingToMoodboard = async (moodboardId: string, screenshotIds: string[]) => {
    if (!user) return;
    const moodboard = moodboards.find(m => m.id === moodboardId);
    if (!moodboard) return;

    const newIds = screenshotIds.filter(id => !moodboard.screenshotIds.includes(id));
    if (newIds.length === 0) return;

    const updatedMoodboard = {
      ...moodboard,
      screenshotIds: [...moodboard.screenshotIds, ...newIds],
      dateUpdated: new Date().toISOString()
    };

    try {
      await updateMoodboard(user.uid, updatedMoodboard);
      setMoodboards(moodboards.map(m => m.id === moodboardId ? updatedMoodboard : m));
      if (selectedMoodboard?.id === moodboardId) {
        setSelectedMoodboard(updatedMoodboard);
      }
    } catch (error) {
      console.error("Error adding to moodboard:", error);
    }
  };

  const handleUploadNewToMoodboard = async (moodboardId: string, screenshot: Screenshot) => {
    if (!user) return;
    try {
      await addScreenshot(user.uid, screenshot);
      setScreenshots([screenshot, ...screenshots]);
      await handleAddExistingToMoodboard(moodboardId, [screenshot.id]);
    } catch (error) {
      console.error("Error saving screenshot to moodboard:", error);
    }
  };

  const handleRemoveFromMoodboard = async (moodboardId: string, screenshotId: string) => {
    if (!user) return;
    const moodboard = moodboards.find(m => m.id === moodboardId);
    if (!moodboard) return;

    const updatedMoodboard = {
      ...moodboard,
      screenshotIds: moodboard.screenshotIds.filter(id => id !== screenshotId),
      dateUpdated: new Date().toISOString()
    };

    try {
      await updateMoodboard(user.uid, updatedMoodboard);
      setMoodboards(moodboards.map(m => m.id === moodboardId ? updatedMoodboard : m));
      if (selectedMoodboard?.id === moodboardId) {
        setSelectedMoodboard(updatedMoodboard);
      }
    } catch (error) {
      console.error("Error removing from moodboard:", error);
    }
  };

  const handleReorderMoodboard = async (moodboardId: string, newOrder: string[]) => {
    if (!user) return;
    const moodboard = moodboards.find(m => m.id === moodboardId);
    if (!moodboard) return;

    const updatedMoodboard = {
      ...moodboard,
      screenshotIds: newOrder,
      dateUpdated: new Date().toISOString()
    };

    try {
      await updateMoodboard(user.uid, updatedMoodboard);
      setMoodboards(moodboards.map(m => m.id === moodboardId ? updatedMoodboard : m));
      if (selectedMoodboard?.id === moodboardId) {
        setSelectedMoodboard(updatedMoodboard);
      }
    } catch (error) {
      console.error("Error reordering moodboard:", error);
    }
  };

  const handleReorderMoodboards = async (reorderedMoodboards: Moodboard[]) => {
    if (!user) return;
    
    // Update local state immediately for snappy UI
    setMoodboards(reorderedMoodboards);

    // Update each moodboard's order in the database
    try {
      await Promise.all(reorderedMoodboards.map((moodboard, index) => {
        const updatedMoodboard = { ...moodboard, order: index };
        return updateMoodboard(user.uid, updatedMoodboard);
      }));
    } catch (error) {
      console.error("Error reordering moodboards:", error);
      // Optionally, we could revert the state here if it fails
    }
  };

  const handleAddToBoard = async (boardId: string) => {
    if (!user || !selectedScreenshot) return;
    
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    if (board.screenshotIds.includes(selectedScreenshot.id)) return;

    if (board.screenshotIds.length >= 100) {
      console.error('Board is full (max 100 screenshots)');
      return;
    }

    const updatedBoard = {
      ...board,
      screenshotIds: [...board.screenshotIds, selectedScreenshot.id],
      coverUrl: board.coverUrl || selectedScreenshot.url // Set cover if it doesn't have one
    };

    try {
      await updateBoard(user.uid, updatedBoard);
      setBoards(boards.map(b => b.id === boardId ? updatedBoard : b));
    } catch (error) {
      console.error("Error adding to board:", error);
    }
  };

  const handleDropToBoard = async (boardId: string, screenshotId: string) => {
    if (!user) return;
    
    const board = boards.find(b => b.id === boardId);
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!board || !screenshot) return;

    if (board.screenshotIds.includes(screenshotId)) return;

    if (board.screenshotIds.length >= 100) {
      console.error('Board is full (max 100 screenshots)');
      return;
    }

    const updatedBoard = {
      ...board,
      screenshotIds: [...board.screenshotIds, screenshotId],
      coverUrl: board.coverUrl || screenshot.url
    };

    try {
      await updateBoard(user.uid, updatedBoard);
      setBoards(boards.map(b => b.id === boardId ? updatedBoard : b));
    } catch (error) {
      console.error("Error adding to board via drag and drop:", error);
    }
  };

  const handleDropToSmartFolder = async (folder: SmartFolder, screenshotId: string) => {
    if (!user) return;
    
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) return;

    let updatedScreenshot = { ...screenshot };

    if (folder.type === 'screenType') {
      if (screenshot.screenType === folder.value) return;
      updatedScreenshot.screenType = folder.value;
    } else if (folder.type === 'component') {
      const components = screenshot.components || [];
      if (components.includes(folder.value)) return;
      updatedScreenshot.components = [...components, folder.value];
    }

    try {
      await updateScreenshot(user.uid, updatedScreenshot);
      setScreenshots(screenshots.map(s => s.id === screenshotId ? updatedScreenshot : s));
    } catch (error) {
      console.error("Error updating screenshot via smart folder drop:", error);
    }
  };

  const handleUpdateScreenshot = async (updatedScreenshot: Screenshot) => {
    if (!user) return;
    try {
      setScreenshots(screenshots.map(s => s.id === updatedScreenshot.id ? updatedScreenshot : s));
      if (selectedScreenshot?.id === updatedScreenshot.id) {
        setSelectedScreenshot(updatedScreenshot);
      }
      await updateScreenshot(user.uid, updatedScreenshot);
    } catch (error) {
      console.error("Error updating screenshot:", error);
    }
  };

  const handleDeleteScreenshot = async (screenshotId: string) => {
    if (!user) return;
    try {
      await deleteScreenshot(user.uid, screenshotId);
      setScreenshots(screenshots.filter(s => s.id !== screenshotId));
      setSelectedScreenshot(null);
    } catch (error) {
      console.error("Error deleting screenshot:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#a3e635]" />
      </div>
    );
  }

  if (!user || view === 'landing') {
    return <LandingPage onEnterApp={() => setView('home')} />;
  }

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
      {view !== 'moodboardDetail' && (
        <Sidebar 
          currentView={view} 
          onNavigate={setView} 
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenFindSimilar={() => setIsFindSimilarOpen(true)}
          boards={boards}
          smartFolders={smartFolders}
          moodboards={moodboards}
          onDropToBoard={handleDropToBoard}
          onDropToSmartFolder={handleDropToSmartFolder}
          onSelectBoard={(board) => {
            setSelectedBoard(board);
            setSelectedSmartFolder(null);
            setSelectedMoodboard(null);
            setView('boardDetail');
          }}
          onSelectSmartFolder={(folder) => {
            setSelectedSmartFolder(folder);
            setSelectedBoard(null);
            setSelectedMoodboard(null);
            setView('boardDetail');
          }}
          onSelectMoodboard={(moodboard) => {
            setSelectedMoodboard(moodboard);
            setSelectedBoard(null);
            setSelectedSmartFolder(null);
            setView('moodboardDetail');
          }}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${view === 'moodboardDetail' ? '' : 'pb-16 md:pb-0'}`}>
        {view !== 'moodboardDetail' && (
          <Topbar 
            searchQuery={searchQuery} 
            onSearch={handleSearch} 
            user={user}
            onLogout={logOut}
            onOpenFilters={() => {
              setView('search');
              setIsFilterOpen(true);
            }}
          />
        )}
        
        <main className={`flex-1 overflow-y-auto ${view === 'moodboardDetail' ? '' : 'p-4 sm:p-6 md:p-8'}`}>
          <div className={view === 'moodboardDetail' ? 'h-full' : 'max-w-7xl mx-auto'}>
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#a3e635]" />
                <p>Loading your inspiration...</p>
              </div>
            ) : (
              <>
                {view === 'home' && (
                  <HomeFeed 
                    screenshots={screenshots} 
                    onSelectScreenshot={setSelectedScreenshot} 
                    onDeleteScreenshot={handleDeleteScreenshot}
                    onUpdateScreenshot={handleUpdateScreenshot}
                  />
                )}
                {view === 'boards' && (
                  <BoardsScreen 
                    boards={boards} 
                    screenshots={screenshots}
                    smartFolders={smartFolders}
                    onCreateBoard={() => setIsCreateBoardOpen(true)} 
                    onSelectBoard={(board) => {
                      setSelectedBoard(board);
                      setSelectedSmartFolder(null);
                      setView('boardDetail');
                    }}
                    onSelectSmartFolder={(folder) => {
                      setSelectedSmartFolder(folder);
                      setSelectedBoard(null);
                      setView('boardDetail');
                    }}
                    onDropToBoard={handleDropToBoard}
                    onDropToSmartFolder={handleDropToSmartFolder}
                  />
                )}
                {view === 'boardDetail' && (
                  <BoardDetailScreen
                    board={selectedBoard || undefined}
                    smartFolder={selectedSmartFolder || undefined}
                    screenshots={screenshots}
                    onSelectScreenshot={setSelectedScreenshot}
                    onBack={() => setView('boards')}
                    onAddExistingToBoard={handleAddExistingToBoard}
                    onUploadNewToBoard={handleUploadNewToBoard}
                    onAddExistingToSmartFolder={handleAddExistingToSmartFolder}
                    onUploadNewToSmartFolder={handleUploadNewToSmartFolder}
                    onDeleteScreenshot={handleDeleteScreenshot}
                  />
                )}
                {view === 'search' && (
                  <SearchResults 
                    query={searchQuery} 
                    screenshots={screenshots} 
                    onSelectScreenshot={setSelectedScreenshot} 
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    onDeleteScreenshot={handleDeleteScreenshot}
                  />
                )}
                {view === 'moodboards' && (
                  <MoodboardsScreen
                    moodboards={moodboards}
                    screenshots={screenshots}
                    onCreateMoodboard={() => setIsCreateMoodboardOpen(true)}
                    onSelectMoodboard={(moodboard) => {
                      setSelectedMoodboard(moodboard);
                      setSelectedBoard(null);
                      setSelectedSmartFolder(null);
                      setView('moodboardDetail');
                    }}
                    onReorderMoodboards={handleReorderMoodboards}
                  />
                )}
                {view === 'moodboardDetail' && selectedMoodboard && (
                  <MoodboardDetailScreen
                    moodboard={selectedMoodboard}
                    screenshots={screenshots}
                    onSelectScreenshot={setSelectedScreenshot}
                    onBack={() => setView('moodboards')}
                    onAddExistingToMoodboard={handleAddExistingToMoodboard}
                    onUploadNewToMoodboard={handleUploadNewToMoodboard}
                    onRemoveFromMoodboard={handleRemoveFromMoodboard}
                    onReorderMoodboard={handleReorderMoodboard}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {view !== 'moodboardDetail' && (
        <BottomNav 
          currentView={view} 
          onNavigate={setView} 
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenFindSimilar={() => setIsFindSimilarOpen(true)}
        />
      )}

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onComplete={handleUploadComplete} 
        />
      )}

      {selectedScreenshot && (
        <DetailModal 
          screenshot={selectedScreenshot} 
          boards={boards}
          onClose={() => setSelectedScreenshot(null)} 
          onAddToBoard={handleAddToBoard}
          onUpdateScreenshot={handleUpdateScreenshot}
          onDeleteScreenshot={handleDeleteScreenshot}
          onCreateBoard={() => setIsCreateBoardOpen(true)}
        />
      )}

      {isFindSimilarOpen && (
        <FindSimilarModal 
          screenshots={screenshots}
          onClose={() => setIsFindSimilarOpen(false)} 
          onSelectScreenshot={(s) => {
            setIsFindSimilarOpen(false);
            setSelectedScreenshot(s);
          }}
        />
      )}

      {isCreateBoardOpen && (
        <CreateBoardModal 
          onClose={() => setIsCreateBoardOpen(false)}
          onComplete={(name) => handleCreateBoard(name, selectedScreenshot ? [selectedScreenshot.id] : [])}
        />
      )}

      {isCreateMoodboardOpen && (
        <CreateMoodboardModal
          onClose={() => setIsCreateMoodboardOpen(false)}
          onCreate={handleCreateMoodboard}
        />
      )}
    </div>
  );
}
