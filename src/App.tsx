import React, { useState, useEffect } from 'react';
import { Category, StampItem, ViewMode, SyncState } from './types';
import {
  loadStamps,
  saveStamps,
  loadCategories,
  saveCategories,
  subscribeSyncState,
} from './lib/storage';
import { Header } from './components/Header';
import { StampCard } from './components/StampCard';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { StampCreatorModal } from './components/StampCreatorModal';
import { StampDetailModal } from './components/StampDetailModal';
import { CategoryManager } from './components/CategoryManager';
import { Footer } from './components/Footer';
import { downloadStampPNG } from './lib/stampRenderer';
import { Plus, Tag, Sparkles, Filter, Layers } from 'lucide-react';

export default function App() {
  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({ status: 'synced' });

  // View & Filter States
  const [currentView, setCurrentView] = useState<ViewMode>('album');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null);

  // Initialize data
  useEffect(() => {
    const loadedStamps = loadStamps();
    const loadedCats = loadCategories();
    setStamps(loadedStamps);
    setCategories(loadedCats);

    const unsubscribe = subscribeSyncState((state) => {
      setSyncState(state);
    });

    return () => unsubscribe();
  }, []);

  // Filter stamps by selected category
  const filteredStamps = stamps.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  // Reorder Handler (Move Left / Move Right)
  const handleMoveStamp = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stamps.length) return;

    const newStamps = [...stamps];
    const temp = newStamps[index];
    newStamps[index] = newStamps[targetIndex];
    newStamps[targetIndex] = temp;

    // Re-index orderIndex
    const reindexed = newStamps.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    setStamps(reindexed);
    saveStamps(reindexed);
  };

  // Add New Stamp
  const handleCreateStamp = (data: Omit<StampItem, 'id' | 'createdAt' | 'orderIndex'>) => {
    const newStamp: StampItem = {
      ...data,
      id: `stamp-${Date.now()}`,
      createdAt: Date.now(),
      orderIndex: stamps.length,
    };

    const updated = [newStamp, ...stamps].map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    setStamps(updated);
    saveStamps(updated);
  };

  // Update Stamp
  const handleUpdateStamp = (updatedStamp: StampItem) => {
    const updated = stamps.map((s) => (s.id === updatedStamp.id ? updatedStamp : s));
    setStamps(updated);
    saveStamps(updated);
    setSelectedStamp(updatedStamp);
  };

  // Delete Stamp
  const handleDeleteStamp = (stampId: string) => {
    const updated = stamps.filter((s) => s.id !== stampId);
    setStamps(updated);
    saveStamps(updated);
  };

  // Save Categories
  const handleSaveCategories = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    saveCategories(updatedCats);
  };

  // Import Backup Data
  const handleImportData = (newStamps: StampItem[], newCats: Category[]) => {
    setStamps(newStamps);
    setCategories(newCats);
    saveStamps(newStamps);
    saveCategories(newCats);
  };

  const getCategoryColor = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.color : '#3b82f6';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#E5E5E5] font-sans antialiased selection:bg-[#B43C28] selection:text-white">
      {/* Background Grid Pattern (Dark Stamp Album Sheet) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Header */}
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenCategoryManager={() => setIsCategoryOpen(true)}
          syncState={syncState}
          stampsCount={stamps.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          
          {/* View Mode 1: Album Grid Sheet */}
          {currentView === 'album' && (
            <div className="space-y-6">
              
              {/* Filter & Organization Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#161616] p-3 sm:p-4 rounded-xl border border-[#2D2D2D]">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
                  <span className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5" /> Filtrar:
                  </span>

                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-[#B43C28] text-white shadow-2xs'
                        : 'bg-[#222222] text-[#E5E5E5] hover:bg-[#2A2A2A] border border-[#333333]'
                    }`}
                  >
                    Todas ({stamps.length})
                  </button>

                  {categories.map((cat) => {
                    const count = stamps.filter((s) => s.category === cat.name).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? 'bg-[#B43C28] text-white shadow-2xs'
                            : 'bg-[#222222] text-[#E5E5E5] hover:bg-[#2A2A2A] border border-[#333333]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                        <span className="opacity-60 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-[#888888] font-mono hidden md:block">
                  Ordene arrastrando o moviendo las estampillas
                </div>
              </div>

              {/* Stamp Collection Grid (Stamp Sheet) */}
              {filteredStamps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-4">
                  {filteredStamps.map((stamp, idx) => (
                    <StampCard
                      key={stamp.id}
                      stamp={stamp}
                      categoryColor={getCategoryColor(stamp.category)}
                      onSelect={(s) => setSelectedStamp(s)}
                      onDownload={(s) => downloadStampPNG(s)}
                      onMoveLeft={() => handleMoveStamp(idx, 'left')}
                      onMoveRight={() => handleMoveStamp(idx, 'right')}
                      isFirst={idx === 0}
                      isLast={idx === filteredStamps.length - 1}
                    />
                  ))}
                </div>
              ) : (
                /* Empty Category / Album State */
                <div className="py-20 flex flex-col items-center justify-center text-center bg-[#161616]/80 rounded-xl border border-dashed border-[#2D2D2D] p-8">
                  <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center shadow-xs text-[#B43C28] mb-4 border border-[#333333]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#E5E5E5] mb-1">
                    No hay estampillas en esta categoría
                  </h3>
                  <p className="text-xs text-[#888888] max-w-sm mb-6">
                    Sube una foto para convertirla automáticamente en una hermosa estampilla retro y completar tu álbum.
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 bg-[#B43C28] text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Crear Nueva Estampilla
                  </button>
                </div>
              )}

            </div>
          )}

          {/* View Mode 2: Monthly Calendar View */}
          {currentView === 'calendar' && (
            <MonthlyCalendarView
              stamps={stamps}
              categories={categories}
              onSelectStamp={(s) => setSelectedStamp(s)}
              onAddNewForDate={(dateStr) => {
                setIsCreateOpen(true);
              }}
              onDownloadStamp={(s) => downloadStampPNG(s)}
            />
          )}

        </main>

        {/* Minimalist Footer with Signature */}
        <Footer
          stamps={stamps}
          categories={categories}
          onImportData={handleImportData}
        />
      </div>

      {/* Modals */}
      <StampCreatorModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateStamp}
        categories={categories}
      />

      <StampDetailModal
        stamp={selectedStamp}
        onClose={() => setSelectedStamp(null)}
        onUpdate={handleUpdateStamp}
        onDelete={handleDeleteStamp}
        categories={categories}
      />

      <CategoryManager
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
}
