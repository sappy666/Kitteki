import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, FilterStyle, StampItem } from '../types';
import { downloadStampPNG } from '../lib/stampRenderer';
import { X, Download, Trash2, Edit3, Save, ArrowLeft, Calendar, Tag, MapPin, FileText } from 'lucide-react';

interface StampDetailModalProps {
  stamp: StampItem | null;
  onClose: () => void;
  onUpdate: (updatedStamp: StampItem) => void;
  onDelete: (stampId: string) => void;
  categories: Category[];
}

export const StampDetailModal: React.FC<StampDetailModalProps> = ({
  stamp,
  onClose,
  onUpdate,
  onDelete,
  categories,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Editable Form State
  const [title, setTitle] = useState<string>('');
  const [kanjiTitle, setKanjiTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [denomination, setDenomination] = useState<string>('');
  const [postmarkCity, setPostmarkCity] = useState<string>('');
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('sepia');
  const [frameColor, setFrameColor] = useState<string>('#F5F0E6');
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (stamp) {
      setTitle(stamp.title);
      setKanjiTitle(stamp.kanjiTitle || '');
      setDate(stamp.date);
      setCategory(stamp.category);
      setDenomination(stamp.denomination);
      setPostmarkCity(stamp.postmarkCity);
      setFilterStyle(stamp.filterStyle);
      setFrameColor(stamp.frameColor || '#F5F0E6');
      setNotes(stamp.notes || '');
      setIsEditing(false);
    }
  }, [stamp]);

  if (!stamp) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadStampPNG(stamp);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveEdit = () => {
    onUpdate({
      ...stamp,
      title,
      kanjiTitle,
      date,
      category,
      denomination,
      postmarkCity,
      filterStyle,
      frameColor,
      notes,
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-[#161616] text-[#E5E5E5] rounded-xl shadow-2xl border border-[#2D2D2D] overflow-hidden my-auto p-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D] mb-6">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-[#E5E5E5]">
                {stamp.kanjiTitle ? `${stamp.title} • ${stamp.kanjiTitle}` : stamp.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#282828] text-[#888888]">
                #{stamp.orderIndex + 1}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#282828] text-[#888888] hover:text-[#E5E5E5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Big Stamp Visual Display */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div
                style={{
                  filter: 'drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.5))',
                }}
              >
                <div
                  className="relative p-5 stamp-perforated-lg transition-transform hover:scale-[1.02] text-[#2B2927]"
                  style={{
                    backgroundColor: stamp.frameColor || '#F5F0E6',
                  }}
                >
                  <div className="bg-[#FAF8F5] border-2 border-[#2B2927] p-3 w-64 sm:w-72 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-xs text-[#2B2927] mb-1.5 font-serif">
                    <span className="font-bold text-red-800">
                      {stamp.kanjiTitle ? `日本郵便 • ${stamp.kanjiTitle}` : 'NIPPON POST'}
                    </span>
                    <span className="font-mono text-xs">{stamp.denomination}</span>
                  </div>

                  <div className="relative w-full aspect-[4/5] bg-neutral-200 border border-[#2B2927] overflow-hidden">
                    <img
                      src={stamp.imageUrl}
                      alt={stamp.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Postal Stamp Cancellation Mark */}
                    <div className="absolute bottom-1 right-1 w-24 h-24 pointer-events-none opacity-80 rotate-[-10deg]">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E293B]">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
                        <text x="50" y="32" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor">
                          {(stamp.postmarkCity || 'TOKYO').toUpperCase()}
                        </text>
                        <text x="50" y="52" fontSize="7" fontFamily="monospace" textAnchor="middle" fill="currentColor">
                          {stamp.date ? stamp.date.replace(/-/g, '.') : '2026.07.29'}
                        </text>
                        <text x="50" y="68" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">
                          • 郵便 •
                        </text>
                        <path d="M -20 50 Q 0 42 20 50 T 60 50 T 100 50 T 120 50" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
                      </svg>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-[#2B2927]/10">
                    <span className="font-serif font-bold text-lg text-[#C8372D]">{stamp.denomination}</span>
                    <span className="font-semibold text-xs truncate max-w-[70%] text-right">{stamp.title}</span>
                  </div>
                </div>
              </div>
            </div>

              {/* High Resolution PNG Download Action */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-6 w-full py-2.5 px-4 bg-[#B43C28] text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Generando PNG HD...' : 'Descargar Estampilla en Alta Resolución (PNG)'}
              </button>
            </div>

            {/* Right Column: Stamp Metadata or Edit Form */}
            <div className="md:col-span-6 flex flex-col justify-between h-full">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2D2D2D]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                      Detalles del Recuerdo
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-semibold text-[#B43C28] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-[#E5E5E5]">
                      <Tag className="w-4 h-4 text-[#888888]" />
                      <span className="font-medium text-[#888888]">Categoría:</span>
                      <span className="bg-[#282828] text-[#E5E5E5] border border-[#333333] text-xs px-2 py-0.5 rounded-full font-medium">
                        {stamp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#E5E5E5]">
                      <Calendar className="w-4 h-4 text-[#888888]" />
                      <span className="font-medium text-[#888888]">Fecha:</span>
                      <span className="font-mono text-xs">{stamp.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#E5E5E5]">
                      <MapPin className="w-4 h-4 text-[#888888]" />
                      <span className="font-medium text-[#888888]">Matasellos:</span>
                      <span>{stamp.postmarkCity || 'TOKYO'}</span>
                    </div>

                    {stamp.notes && (
                      <div className="pt-2 border-t border-[#2D2D2D]">
                        <div className="flex items-center gap-1.5 text-[#888888] text-xs mb-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="font-medium">Reflexión / Notas:</span>
                        </div>
                        <p className="p-3 bg-[#222222] border border-[#333333] rounded-md text-xs italic text-[#E5E5E5] leading-relaxed font-serif">
                          "{stamp.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Editing Mode */
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#888888] pb-1 border-b border-[#2D2D2D]">
                    Editar Estampilla
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Título</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Subtítulo Kanji</label>
                    <input
                      type="text"
                      value={kanjiTitle}
                      onChange={(e) => setKanjiTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Fecha</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Valor Facial</label>
                      <input
                        type="text"
                        value={denomination}
                        onChange={(e) => setDenomination(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Ciudad Matasellos</label>
                      <input
                        type="text"
                        value={postmarkCity}
                        onChange={(e) => setPostmarkCity(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A0A0A0] mb-0.5">Notas</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-[#888888] hover:text-[#E5E5E5]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-[#B43C28] text-white text-xs font-semibold rounded-md flex items-center gap-1 hover:bg-red-700"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar Cambios
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Delete Action */}
              <div className="pt-6 border-t border-[#2D2D2D] mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Eliminar esta estampilla del diario?')) {
                      onDelete(stamp.id);
                      onClose();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Estampilla
                </button>
                <span className="text-[11px] text-[#888888] font-serif">
                  Kitteki Collection • @sappy.error
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
