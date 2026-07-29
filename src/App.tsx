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
    <div className="min-h-screen flex flex-col bg-paper-canvas text-[#2B2825] font-sans antialiased selection:bg-[#8C3B2B] selection:text-white">
      {/* Background Soft Paper Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(43, 40, 37, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(43, 40, 37, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
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
              
              {/* Filter Bar (Editorial Paper Style - No Chips) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b-2 border-[#2B2825]/15">
                <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto py-1 font-serif text-sm">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`pb-1 transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'border-b-2 border-[#8C3B2B] font-bold text-[#8C3B2B]'
                        : 'text-[#5C5650] hover:text-[#2B2825]'
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
                        className={`pb-1 transition-all shrink-0 flex items-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? 'border-b-2 border-[#8C3B2B] font-bold text-[#8C3B2B]'
                            : 'text-[#5C5650] hover:text-[#2B2825]'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-[#5C5650] font-serif italic hidden md:block">
                  Diario Postal de Recuerdos
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
                <div className="py-20 flex flex-col items-center justify-center text-center bg-[#FAF8F5] rounded-sm border-2 border-dashed border-[#2B2825]/20 p-8 shadow-2xs">
                  <div className="w-16 h-16 rounded-full bg-[#F2EBD9] flex items-center justify-center text-[#8C3B2B] mb-4 border border-[#2B2825]/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#2B2825] mb-1">
                    No hay estampillas en esta categoría
                  </h3>
                  <p className="text-xs text-[#5C5650] font-serif italic max-w-sm mb-6">
                    Agrega una nueva fotografía para crear una hermosa estampilla ilustrada vintage.
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 bg-[#8C3B2B] text-[#FAF5E8] text-xs font-serif font-bold rounded-sm hover:bg-[#722F22] transition-all shadow-xs flex items-center gap-2 border border-[#2B2825]"
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
