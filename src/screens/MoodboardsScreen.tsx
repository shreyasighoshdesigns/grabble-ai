import React, { useMemo } from 'react';
import { Moodboard, Screenshot } from '../types';
import { Plus, LayoutTemplate, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MoodboardsScreenProps {
  moodboards: Moodboard[];
  screenshots: Screenshot[];
  onCreateMoodboard: () => void;
  onSelectMoodboard: (moodboard: Moodboard) => void;
  onReorderMoodboards?: (moodboards: Moodboard[]) => void;
}

interface SortableMoodboardCardProps {
  moodboard: Moodboard; 
  screenshots: Screenshot[]; 
  onSelect: (m: Moodboard) => void;
  renderImages: (s: Screenshot[]) => React.ReactNode;
}

const SortableMoodboardCard: React.FC<SortableMoodboardCardProps> = ({ 
  moodboard, 
  screenshots, 
  onSelect,
  renderImages
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: moodboard.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const boardScreenshots = moodboard.screenshotIds
    .map(id => screenshots.find(s => s.id === id))
    .filter(Boolean) as Screenshot[];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group flex flex-col relative"
    >
      <div 
        onClick={() => onSelect(moodboard)}
        className="cursor-pointer aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden relative mb-2 border border-zinc-200 shadow-sm"
      >
        {renderImages(boardScreenshots)}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-zinc-600" />
      </div>

      <h3 className="font-semibold text-zinc-900 text-sm truncate">{moodboard.name}</h3>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-zinc-500">{moodboard.screenshotIds.length} items</p>
        <p className="text-xs text-zinc-400">
          {new Date(moodboard.dateUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export function MoodboardsScreen({ 
  moodboards, 
  screenshots, 
  onCreateMoodboard, 
  onSelectMoodboard,
  onReorderMoodboards
}: MoodboardsScreenProps) {

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedMoodboards = useMemo(() => {
    return [...moodboards].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime();
    });
  }, [moodboards]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedMoodboards.findIndex((m) => m.id === active.id);
      const newIndex = sortedMoodboards.findIndex((m) => m.id === over.id);
      
      const newOrder = arrayMove(sortedMoodboards, oldIndex, newIndex) as Moodboard[];
      if (onReorderMoodboards) {
        onReorderMoodboards(newOrder);
      }
    }
  };

  const renderMoodboardImages = (boardScreenshots: Screenshot[]) => {
    if (boardScreenshots.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
          <LayoutTemplate className="w-8 h-8" />
        </div>
      );
    }

    const img1 = boardScreenshots[0]?.url;
    const img2 = boardScreenshots[1]?.url;
    const img3 = boardScreenshots[2]?.url;

    return (
      <div className="flex h-full w-full gap-0.5 bg-white">
        <div className="w-2/3 h-full bg-zinc-100">
          {img1 && <img src={img1} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
        </div>
        <div className="w-1/3 h-full flex flex-col gap-0.5">
          <div className="h-1/2 bg-zinc-100">
            {img2 && <img src={img2} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
          </div>
          <div className="h-1/2 bg-zinc-100">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-1 sm:mb-2">Moodboards</h2>
          <p className="text-sm sm:text-base text-zinc-500 text-left max-w-lg">
            Visually organize screenshots and inspiration into boards for projects, themes, and case studies.
          </p>
        </div>
        <button
          onClick={onCreateMoodboard}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-zinc-900 text-[#a3e635] text-sm font-bold rounded-full hover:bg-zinc-800 shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          Create
        </button>
      </div>

      {moodboards.length === 0 && screenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[50vh]">
          <div className="relative w-48 h-48 mb-8 group">
            <div className="absolute inset-2 bg-purple-100 border-2 border-zinc-900 rounded-3xl shadow-[4px_4px_0px_#27272a] transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
            <div className="absolute inset-2 bg-white border-2 border-zinc-900 rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_#27272a] transform -rotate-2 group-hover:-rotate-4 transition-transform duration-300 p-4">
               <div className="w-full h-full border-2 border-zinc-900 bg-zinc-50 rounded-2xl overflow-hidden shadow-[4px_4px_0px_#27272a] flex flex-col group-hover:scale-105 transition-transform duration-300">
                 <div className="h-6 border-b-2 border-zinc-900 bg-purple-300 flex items-center px-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-zinc-900" />
                 </div>
                 <div className="flex-1 p-2 flex gap-2 w-full">
                    <div className="w-1/2 h-full border-2 border-zinc-900 bg-rose-200 rounded-xl"></div>
                    <div className="w-1/2 h-full flex flex-col gap-2">
                      <div className="w-full h-1/2 border-2 border-zinc-900 bg-yellow-200 rounded-xl"></div>
                      <div className="w-full h-1/2 border-2 border-zinc-900 bg-blue-200 rounded-xl"></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">Blank canvas awaiting</h3>
          <p className="text-zinc-500 font-medium text-center max-w-sm">
            Upload your first designs and start curating your next brilliant moodboard.
          </p>
        </div>
      ) : (
        <div>


        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortedMoodboards.map(m => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">


              {/* Moodboard Cards */}
              {sortedMoodboards.map(moodboard => (
                <SortableMoodboardCard
                  key={moodboard.id}
                  moodboard={moodboard}
                  screenshots={screenshots}
                  onSelect={onSelectMoodboard}
                  renderImages={renderMoodboardImages}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      )}
    </div>
  );
}
