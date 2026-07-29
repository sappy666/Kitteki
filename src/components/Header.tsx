import React from 'react';
import { ViewMode, SyncState } from '../types';
import { Plus, Grid, Calendar, Tag, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onOpenCreateModal: () => void;
  onOpenCategoryManager: () => void;
  syncState: SyncState;
  stampsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  onOpenCategoryManager,
  syncState,
  stampsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF5E8]/95 backdrop-blur-md border-b-2 border-[#2B2825]/15 transition-all text-[#2B2825]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Signature Editorial Style */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#FAF8F5] text-[#8C3B2B] flex items-center justify-center font-serif font-extrabold text-2xl border-2 border-[#2B2825] shadow-xs">
            P
          </div>
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2B2825] tracking-tight">
                Diario Postale
              </h1>
              <span className="font-script text-lg text-[#8C3B2B]">
                @sappy.error
              </span>
            </div>
            <p className="text-xs text-[#5C5650] font-serif italic">
              Colección de recuerdos postales • {stampsCount} estampillas
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Navigation Mode Switcher */}
          <div className="flex items-center border border-[#2B2825]/30 p-1 bg-[#F2EBD9] rounded-sm">
            <button
              onClick={() => onViewChange('album')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold transition-all ${
                currentView === 'album'
                  ? 'bg-[#2B2825] text-[#FAF5E8]'
                  : 'text-[#5C5650] hover:text-[#2B2825]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Álbum</span>
            </button>

            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold transition-all ${
                currentView === 'calendar'
                  ? 'bg-[#2B2825] text-[#FAF5E8]'
                  : 'text-[#5C5650] hover:text-[#2B2825]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Diario Mensual</span>
            </button>
          </div>

          {/* Category Manager Trigger */}
          <button
            onClick={onOpenCategoryManager}
            className="px-3 py-1.5 text-[#2B2825] bg-[#FAF8F5] hover:bg-[#F2EBD9] border border-[#2B2825]/30 rounded-sm transition-colors flex items-center gap-1.5 text-xs font-serif font-semibold"
            title="Categorías"
          >
            <Tag className="w-3.5 h-3.5 text-[#8C3B2B]" />
            <span className="hidden sm:inline">Categorías</span>
          </button>

          {/* Primary Create Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#8C3B2B] text-[#FAF5E8] text-xs font-serif font-bold rounded-sm hover:bg-[#722F22] transition-all flex items-center gap-1.5 active:scale-95 border border-[#2B2825]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Estampilla</span>
          </button>

        </div>
      </div>
    </header>
  );
};

