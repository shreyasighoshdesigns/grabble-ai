import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateBoardModalProps {
  onClose: () => void;
  onComplete: (name: string) => void;
}

export function CreateBoardModal({ onClose, onComplete }: CreateBoardModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Create New Folder</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="boardName" className="block text-sm font-semibold text-zinc-900 mb-2">
              Folder Name
            </label>
            <input
              id="boardName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fintech Onboarding"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a3e635] focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 text-sm font-medium bg-[#a3e635] text-zinc-900 font-bold rounded-xl hover:bg-[#84cc16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
