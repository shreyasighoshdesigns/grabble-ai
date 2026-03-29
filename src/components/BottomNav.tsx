import { Home, LayoutGrid, PlusCircle, Search, User } from 'lucide-react';
import { ViewState } from '../App';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenUpload: () => void;
  onOpenFindSimilar: () => void;
}

export function BottomNav({ currentView, onNavigate, onOpenUpload, onOpenFindSimilar }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-40 pb-safe">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-zinc-900' : 'text-zinc-400'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </button>
      
      <button 
        onClick={onOpenFindSimilar}
        className="flex flex-col items-center gap-1 text-zinc-400"
      >
        <Search className="w-6 h-6" />
        <span className="text-[10px] font-medium">Similar</span>
      </button>

      <button 
        onClick={onOpenUpload}
        className="flex items-center justify-center w-12 h-12 bg-[#a3e635] text-zinc-900 font-bold rounded-full shadow-lg -mt-5 hover:bg-[#84cc16] transition-colors"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button 
        onClick={() => onNavigate('boards')}
        className={`flex flex-col items-center gap-1 ${currentView === 'boards' ? 'text-zinc-900' : 'text-zinc-400'}`}
      >
        <LayoutGrid className="w-6 h-6" />
        <span className="text-[10px] font-medium">Folders</span>
      </button>
      
      <button 
        className="flex flex-col items-center gap-1 text-zinc-400"
      >
        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden border border-zinc-300">
          <User className="w-4 h-4 text-zinc-500" />
        </div>
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
}
