import { Home, LayoutGrid, PlusCircle, Search, Palette } from 'lucide-react';
import { ViewState } from '../App';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenUpload: () => void;
  onOpenFindSimilar: () => void;
}

export function BottomNav({ currentView, onNavigate, onOpenUpload, onOpenFindSimilar }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 pt-2 flex items-end justify-around z-40" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 min-w-[3rem] py-1 ${currentView === 'home' ? 'text-zinc-900' : 'text-zinc-400'}`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={onOpenFindSimilar}
        className="flex flex-col items-center gap-0.5 min-w-[3rem] py-1 text-zinc-400"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium">Similar</span>
      </button>

      <button
        onClick={onOpenUpload}
        className="flex items-center justify-center w-12 h-12 bg-[#a3e635] text-zinc-900 font-bold rounded-full shadow-lg -mt-5 hover:bg-[#84cc16] transition-colors active:scale-95"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button
        onClick={() => onNavigate('boards')}
        className={`flex flex-col items-center gap-0.5 min-w-[3rem] py-1 ${currentView === 'boards' || currentView === 'boardDetail' ? 'text-zinc-900' : 'text-zinc-400'}`}
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[10px] font-medium">Folders</span>
      </button>

      <button
        onClick={() => onNavigate('moodboards')}
        className={`flex flex-col items-center gap-0.5 min-w-[3rem] py-1 ${currentView === 'moodboards' || currentView === 'moodboardDetail' ? 'text-zinc-900' : 'text-zinc-400'}`}
      >
        <Palette className="w-5 h-5" />
        <span className="text-[10px] font-medium">Boards</span>
      </button>
    </nav>
  );
}
