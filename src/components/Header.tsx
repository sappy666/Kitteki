import React from 'react';
import { ViewMode, SyncState } from '../types';
import { Plus, Grid, Calendar, Tag, Cloud, CloudCheck, RefreshCw } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full bg-[#121212]/90 backdrop-blur-md border-b border-[#2D2D2D] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Signature */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B43C28] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm border border-red-900/40">
            切
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg sm:text-xl text-[#E5E5E5] tracking-tight">
                Kitteki <span className="font-sans text-xs font-normal text-[#888888]">/ 切手日記</span>
              </h1>
              <span className="text-[11px] font-medium font-mono text-[#E5E5E5] bg-[#221A18] border border-[#B43C28]/40 px-2 py-0.5 rounded-full">
                @sappy.error
              </span>
            </div>
            <p className="text-[11px] text-[#888888] font-sans">
              Diario de Estampillas Digitales Vintage • {stampsCount} recuerdos
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Auto Sync Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Cloud Auto-Sync Indicator */}
          <div
            className="flex items-center gap-1.5 text-[11px] font-mono text-[#A0A0A0] bg-[#1E1E1E] px-2.5 py-1 rounded-full border border-[#2D2D2D]"
            title="Sincronización en la nube activa"
          >
            {syncState.status === 'syncing' ? (
              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span>
              {syncState.status === 'syncing'
                ? 'Sincronizando...'
                : syncState.lastSyncedAt
                ? `En nube (${syncState.lastSyncedAt})`
                : 'Sincronizado'}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#1E1E1E] p-1 rounded-lg border border-[#2D2D2D]">
            <button
              onClick={() => onViewChange('album')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'album'
                  ? 'bg-[#2D2D2D] text-white shadow-xs'
                  : 'text-[#888888] hover:text-[#E5E5E5]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Álbum</span>
            </button>

            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                currentView === 'calendar'
                  ? 'bg-[#2D2D2D] text-white shadow-xs'
                  : 'text-[#888888] hover:text-[#E5E5E5]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Diario Mensual</span>
            </button>
          </div>

          {/* Category Manager Trigger */}
          <button
            onClick={onOpenCategoryManager}
            className="p-2 text-[#E5E5E5] bg-[#1E1E1E] hover:bg-[#282828] rounded-lg border border-[#2D2D2D] shadow-xs transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Editar Categorías"
          >
            <Tag className="w-3.5 h-3.5 text-[#B43C28]" />
            <span className="hidden sm:inline">Categorías</span>
          </button>

          {/* Primary Create Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#B43C28] text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Estampilla</span>
          </button>

        </div>
      </div>
    </header>
  );
};
