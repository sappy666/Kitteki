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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-[#FAF5E8] text-[#2B2825] rounded-sm shadow-2xl border-2 border-[#2B2825] overflow-hidden my-auto p-6 sm:p-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#2B2825]/15 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-xl text-[#2B2825]">
                {stamp.kanjiTitle ? `${stamp.title} • ${stamp.kanjiTitle}` : stamp.title}
              </span>
              <span className="text-xs font-serif italic text-[#5C5650]">
                N° {stamp.orderIndex + 1}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F2EBD9] text-[#5C5650] hover:text-[#2B2825] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Big Stamp Visual Display */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div
                style={{
                  filter: 'drop-shadow(0px 8px 18px rgba(43, 40, 37, 0.2))',
                }}
              >
                <div
                  className="relative p-5 stamp-perforated-lg transition-transform hover:scale-[1.02] text-[#2B2825]"
                  style={{
                    backgroundColor: stamp.frameColor || '#FAF5E8',
                  }}
                >
                  <div className="bg-[#FAF8F5] border-2 border-[#2B2825] p-3 w-64 sm:w-72 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-xs text-[#2B2825] mb-1.5 font-serif">
                    <span className="font-bold text-[#8C3B2B]">
                      {stamp.kanjiTitle && stamp.kanjiTitle.trim() !== '' ? stamp.kanjiTitle : 'POSTE ITALIANE'}
                    </span>
                    <span className="font-serif italic text-xs">{stamp.category}</span>
                  </div>

                  <div className="relative w-full aspect-[4/5] bg-neutral-200 border border-[#2B2825] overflow-hidden">
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
                          {(stamp.postmarkCity || 'ROMA').toUpperCase()}
                        </text>
                        <text x="50" y="52" fontSize="7" fontFamily="monospace" textAnchor="middle" fill="currentColor">
                          {stamp.date ? stamp.date.replace(/-/g, '.') : '2026.07.29'}
                        </text>
                        <text x="50" y="68" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">
                          • POSTE •
                        </text>
                        <path d="M -20 50 Q 0 42 20 50 T 60 50 T 100 50 T 120 50" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
                      </svg>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-[#2B2825]/10">
                    <span className="font-serif font-bold text-lg text-[#8C3B2B]">{stamp.denomination || ''}</span>
                    <span className="font-semibold text-xs truncate max-w-[70%] text-right text-[#2B2825]">{stamp.title}</span>
                  </div>
                </div>
              </div>
            </div>

              {/* High Resolution PNG Download Action */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-6 w-full py-2.5 px-4 bg-[#8C3B2B] text-[#FAF5E8] text-xs font-serif font-bold rounded-sm hover:bg-[#722F22] transition-all shadow-xs flex items-center justify-center gap-2 border border-[#2B2825]"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Generando PNG HD...' : 'Descargar Estampilla en PNG'}
              </button>
            </div>

            {/* Right Column: Stamp Metadata or Edit Form */}
            <div className="md:col-span-6 flex flex-col justify-between h-full">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B2825]/20">
                    <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#5C5650]">
                      Detalles del Recuerdo
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-serif font-bold text-[#8C3B2B] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>

                  <div className="space-y-3 text-sm font-serif">
                    <div className="flex items-center gap-2 text-[#2B2825]">
                      <Tag className="w-4 h-4 text-[#8C3B2B]" />
                      <span className="font-bold text-[#5C5650]">Categoría:</span>
                      <span className="text-xs font-semibold italic text-[#2B2825]">
                        {stamp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#2B2825]">
                      <Calendar className="w-4 h-4 text-[#8C3B2B]" />
                      <span className="font-bold text-[#5C5650]">Fecha:</span>
                      <span className="text-xs font-mono">{stamp.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#2B2825]">
                      <MapPin className="w-4 h-4 text-[#8C3B2B]" />
                      <span className="font-bold text-[#5C5650]">Matasellos:</span>
                      <span>{stamp.postmarkCity || 'ROMA'}</span>
                    </div>

                    {stamp.notes && (
                      <div className="pt-2 border-t border-[#2B2825]/15">
                        <div className="flex items-center gap-1.5 text-[#5C5650] text-xs mb-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#8C3B2B]" />
                          <span className="font-bold">Notas de viaje:</span>
                        </div>
                        <p className="p-3.5 bg-[#FAF8F5] border border-[#2B2825]/20 rounded-sm text-sm text-[#2B2825] leading-relaxed font-script italic">
                          "{stamp.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Editing Mode */
                <div className="space-y-3 font-serif">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5C5650] pb-1 border-b border-[#2B2825]/20">
                    Editar Estampilla
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Título</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Subtítulo Encabezado</label>
                    <input
                      type="text"
                      value={kanjiTitle}
                      onChange={(e) => setKanjiTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm font-serif focus:outline-none focus:border-[#8C3B2B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Fecha</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
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
                      <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Precio / Valor</label>
                      <input
                        type="text"
                        value={denomination}
                        onChange={(e) => setDenomination(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm font-serif focus:outline-none focus:border-[#8C3B2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Ciudad Matasellos</label>
                      <input
                        type="text"
                        value={postmarkCity}
                        onChange={(e) => setPostmarkCity(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2825] mb-0.5">Notas</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm resize-none focus:outline-none focus:border-[#8C3B2B]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-[#5C5650] hover:text-[#2B2825]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-[#8C3B2B] text-[#FAF5E8] text-xs font-bold rounded-sm flex items-center gap-1 hover:bg-[#722F22]"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar Cambios
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Delete Action */}
              <div className="pt-6 border-t border-[#2B2825]/15 mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Eliminar esta estampilla del diario?')) {
                      onDelete(stamp.id);
                      onClose();
                    }
                  }}
                  className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1 font-serif"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Estampilla
                </button>
                <span className="text-xs text-[#5C5650] font-script">
                  Diario Postale • @sappy.error
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
