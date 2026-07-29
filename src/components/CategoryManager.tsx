import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';
import { X, Plus, Edit2, Trash2, Check, Tag } from 'lucide-react';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategories: (updatedCategories: Category[]) => void;
}

const CATEGORY_COLOR_PALETTE = [
  '#3b82f6', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#d97706', '#ec4899', '#556b2f', '#1e293b'
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [catList, setCatList] = useState<Category[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Category Form
  const [newName, setNewName] = useState<string>('');
  const [newKanji, setNewKanji] = useState<string>('');
  const [newColor, setNewColor] = useState<string>('#3b82f6');

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      kanjiName: newKanji.trim() || undefined,
      color: newColor,
      orderIndex: catList.length,
    };

    const updated = [...catList, newCat];
    setCatList(updated);
    onSaveCategories(updated);

    setNewName('');
    setNewKanji('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (catList.length <= 1) {
      alert('Debes mantener al menos una categoría.');
      return;
    }
    const updated = catList.filter((c) => c.id !== catId);
    setCatList(updated);
    onSaveCategories(updated);
  };

  const handleUpdateCategory = (catId: string, updatedName: string, updatedKanji?: string, updatedColor?: string) => {
    const updated = catList.map((c) =>
      c.id === catId
        ? {
            ...c,
            name: updatedName || c.name,
            kanjiName: updatedKanji !== undefined ? updatedKanji : c.kanjiName,
            color: updatedColor || c.color,
          }
        : c
    );
    setCatList(updated);
    onSaveCategories(updated);
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-[#161616] text-[#E5E5E5] rounded-xl shadow-2xl border border-[#2D2D2D] overflow-hidden my-auto p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D] mb-5">
            <h3 className="text-base font-serif font-bold text-[#E5E5E5] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#B43C28]" />
              <span>Gestor de Categorías (分類)</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#282828] text-[#888888] hover:text-[#E5E5E5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="mb-6 p-4 bg-[#222222] rounded-lg border border-[#333333]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-2">
              Nueva Categoría
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre (ej. Mascotas)"
                required
                className="px-3 py-1.5 text-xs bg-[#161616] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:outline-none focus:border-[#B43C28]"
              />
              <input
                type="text"
                value={newKanji}
                onChange={(e) => setNewKanji(e.target.value)}
                placeholder="Kanji (ej. ペット)"
                className="px-3 py-1.5 text-xs bg-[#161616] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md font-serif focus:outline-none focus:border-[#B43C28]"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {CATEGORY_COLOR_PALETTE.slice(0, 5).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewColor(col)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#B43C28] text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Categoría
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#888888] mb-2">
              Categorías Actuales ({catList.length})
            </label>
            {catList.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-[#222222] rounded-lg border border-[#333333] shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div>
                    <span className="text-xs font-semibold text-[#E5E5E5]">{cat.name}</span>
                    {cat.kanjiName && (
                      <span className="text-[10px] text-[#888888] font-serif ml-2">({cat.kanjiName})</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1 text-[#888888] hover:text-red-400 transition-colors"
                  title="Eliminar Categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#2D2D2D] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#B43C28] text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-all"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
