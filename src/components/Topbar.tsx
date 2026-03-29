import { Search, Bell, User, LogOut, Filter } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  user: any;
  onLogout: () => void;
  onOpenFilters?: () => void;
}

export function Topbar({ searchQuery, onSearch, user, onLogout, onOpenFilters }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl flex items-center gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder="Search inspiration (e.g., 'fintech onboarding screen')"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-zinc-100 hover:bg-zinc-200/50 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-500"
          />
        </div>
        {onOpenFilters && (
          <button 
            onClick={onOpenFilters}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            title="Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
          <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden border border-zinc-300">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5 text-zinc-500" />
            )}
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
