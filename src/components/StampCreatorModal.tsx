import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, FilterStyle, StampItem } from '../types';
import { X, Upload, Sparkles, Image as ImageIcon, Camera, RefreshCw, Check } from 'lucide-react';

interface StampCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stampData: Omit<StampItem, 'id' | 'createdAt' | 'orderIndex'>) => void;
  categories: Category[];
}

const FILTER_OPTIONS: { id: FilterStyle; label: string; desc: string }[] = [
  { id: 'sepia', label: 'Vintage Sepia', desc: 'Tono cálido envejecido' },
  { id: 'halftone', label: 'Puntos Halftone', desc: 'Textura imprenta postal' },
  { id: 'ukiyoe', label: 'Grabado Ilustrado', desc: 'Saturación y contraste' },
  { id: 'risograph', label: 'Tinta Risograph', desc: 'Doble tinta carmesí e índigo' },
  { id: 'monochrome', label: 'Tinta Monocroma', desc: 'Borde en tinta oscura' },
  { id: 'watercolor', label: 'Acuarela Suave', desc: 'Luz difuminada y suave' },
  { id: 'retroGrain', label: 'Grano 35mm', desc: 'Textura analógica vintage' },
];

const FRAME_COLORS = [
  { hex: '#F5F0E6', label: 'Carta d\'Epoca' },
  { hex: '#FAF5E8', label: 'Pergamena' },
  { hex: '#E5B20D', label: 'Giallo Poste' },
  { hex: '#C8372D', label: 'Rosso Corrente' },
  { hex: '#1E293B', label: 'Blu Poste' },
];

export const StampCreatorModal: React.FC<StampCreatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [kanjiTitle, setKanjiTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Viajes');
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('sepia');
  const [denomination, setDenomination] = useState<string>('');
  const [postmarkCity, setPostmarkCity] = useState<string>('ROMA');
  const [frameColor, setFrameColor] = useState<string>('#F5F0E6');
  const [notes, setNotes] = useState<string>('');
  
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Image Upload
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setImageUrl(base64);
        // Default title if empty
        if (!title) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Generate Sample Image for instant testing
  const handleUseSample = () => {
    const samples = [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=600&q=80',
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setImageUrl(randomSample);
    if (!title) setTitle('Templo al Atardecer');
  };

  // Call Gemini AI server route to generate vintage metadata
  const handleAiAutoFill = async () => {
    if (!imageUrl && !title) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/stamp-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: title || 'Fotografía de recuerdo',
          imageBase64: imageUrl.startsWith('data:') ? imageUrl : undefined,
        }),
      });

      const data = await res.json();
      const meta = data.data || data.fallback;

      if (meta) {
        if (meta.suggestedTitle) setTitle(meta.suggestedTitle);
        if (meta.kanjiTitle) setKanjiTitle(meta.kanjiTitle);
        if (meta.denomination) setDenomination(meta.denomination);
        if (meta.postmarkCity) setPostmarkCity(meta.postmarkCity);
        if (meta.suggestedFilter && FILTER_OPTIONS.some((f) => f.id === meta.suggestedFilter)) {
          setFilterStyle(meta.suggestedFilter as FilterStyle);
        }
        if (meta.poeticNote) setNotes(meta.poeticNote);
      }
    } catch (err) {
      console.warn('AI Assist fallback:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    onSave({
      title: title || 'Mi Estampilla',
      kanjiTitle: kanjiTitle || '',
      date: date || new Date().toISOString().split('T')[0],
      category: category || categories[0]?.name || 'General',
      imageUrl,
      filterStyle,
      denomination: denomination || '',
      postmarkCity: postmarkCity || 'ROMA',
      postmarkStyle: 'classic',
      frameColor,
      notes,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#FAF5E8] text-[#2B2825] rounded-sm shadow-2xl border-2 border-[#2B2825] overflow-hidden my-auto max-h-[92vh] flex flex-col font-serif"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#2B2825]/15 bg-[#FAF5E8]">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2B2825] flex items-center gap-2">
                <span>Crear Estampilla</span>
                <span className="text-xs font-script font-normal text-[#8C3B2B]">
                  • Poste Italiane
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F2EBD9] text-[#5C5650] hover:text-[#2B2825] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Image Upload & Stamp Live Preview */}
            <div className="md:col-span-5 flex flex-col items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5C5650] self-start">
                1. Seleccionar Foto
              </label>

              {!imageUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-[4/5] border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#8C3B2B] bg-[#F2EBD9] scale-[0.99]'
                      : 'border-[#2B2825]/30 hover:border-[#2B2825] bg-[#FAF8F5]'
                  }`}
                >
                  <div className="p-3 bg-[#FAF5E8] rounded-full shadow-2xs text-[#8C3B2B] border border-[#2B2825]/20">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#2B2825]">
                      Arrastra tu foto aquí o haz clic
                    </p>
                    <p className="text-xs text-[#5C5650] mt-1 italic">
                      JPG, PNG, WebP de tus recuerdos diarios
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSample();
                    }}
                    className="mt-2 text-xs text-[#8C3B2B] underline font-bold hover:text-[#722F22]"
                  >
                    ¿Probar con foto de ejemplo?
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center group w-full">
                  {/* Live Stamp Preview Card */}
                  <div style={{ filter: 'drop-shadow(0px 6px 14px rgba(43, 40, 37, 0.2))' }}>
                    <div
                      className="p-3.5 stamp-perforated text-[#2B2927]"
                      style={{ backgroundColor: frameColor }}
                    >
                      <div className="bg-[#FAF8F5] border-2 border-[#2B2927] p-2.5 w-48 sm:w-56 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between text-[10px] text-[#2B2927] mb-1 font-serif">
                        <span className="font-bold text-[#8C3B2B]">
                          {kanjiTitle && kanjiTitle.trim() !== '' ? kanjiTitle : 'POSTE ITALIANE'}
                        </span>
                        <span className="font-serif italic text-[10px]">{category}</span>
                      </div>
                      <div className="relative w-full aspect-[4/5] bg-neutral-200 border border-[#2B2927] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover transition-all duration-300"
                          style={{
                            filter:
                              filterStyle === 'sepia'
                                ? 'sepia(0.85) contrast(1.1) brightness(0.95)'
                                : filterStyle === 'monochrome'
                                ? 'grayscale(1) contrast(1.35) brightness(0.9)'
                                : filterStyle === 'risograph'
                                ? 'contrast(1.4) saturate(2.2) hue-rotate(-15deg)'
                                : filterStyle === 'ukiyoe'
                                ? 'saturate(2.2) contrast(1.25) brightness(0.95)'
                                : filterStyle === 'halftone'
                                ? 'contrast(1.5) grayscale(0.7) brightness(1.05)'
                                : filterStyle === 'watercolor'
                                ? 'saturate(1.2) contrast(0.95) brightness(1.05)'
                                : filterStyle === 'retroGrain'
                                ? 'sepia(0.35) contrast(1.15) brightness(0.92)'
                                : 'none',
                          }}
                        />

                        {/* Postal Stamp Cancellation Mark */}
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-80 rotate-[-10deg]">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E293B]">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
                            <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
                            <text x="50" y="32" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor">
                              {(postmarkCity || 'ROMA').toUpperCase()}
                            </text>
                            <text x="50" y="52" fontSize="7" fontFamily="monospace" textAnchor="middle" fill="currentColor">
                              {date ? date.replace(/-/g, '.') : '2026.07.29'}
                            </text>
                            <text x="50" y="68" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">
                              • POSTE •
                            </text>
                            <path d="M -20 50 Q 0 42 20 50 T 60 50 T 100 50 T 120 50" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-full flex items-center justify-between mt-1.5 text-xs">
                        <span className="font-serif font-bold text-[#8C3B2B]">{denomination || ''}</span>
                        <span className="font-semibold text-[11px] truncate text-[#2B2825]">{title || 'Título'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="mt-3 text-xs text-[#5C5650] hover:text-[#2B2825] underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Cambiar foto
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {/* Vintage Auto-Fill button */}
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiLoading}
                  className="w-full py-2.5 px-4 bg-[#FAF8F5] text-[#2B2825] border border-[#2B2825]/30 text-xs font-bold rounded-sm hover:bg-[#F2EBD9] transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#8C3B2B]" />
                  {isAiLoading ? 'Sugeriendo Detalles...' : 'Autocompletar Detalles con IA'}
                </button>
              )}
            </div>

            {/* Right Column: Customization Controls */}
            <div className="md:col-span-7 flex flex-col gap-5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5C5650]">
                2. Personalizar Estampilla Vintage
              </label>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Título de la Memoria
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Vista desde el Duomo"
                    required
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] placeholder-[#888888] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Subtítulo Encabezado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={kanjiTitle}
                    onChange={(e) => setKanjiTitle(e.target.value)}
                    placeholder="ej. ROMA POSTE"
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] placeholder-[#888888] rounded-sm focus:outline-none focus:border-[#8C3B2B] font-serif"
                  />
                </div>
              </div>

              {/* Date, Category & Denomination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Fecha del Recuerdo
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Precio / Valor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    placeholder="ej. €0,80"
                    className="w-full px-2.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] placeholder-[#888888] rounded-sm focus:outline-none focus:border-[#8C3B2B] font-serif"
                  />
                </div>
              </div>

              {/* Artistic Filter Selector */}
              <div>
                <label className="block text-xs font-bold text-[#2B2825] mb-2">
                  Filtro Artístico Retro (Vista Previa en Vivo)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterStyle(f.id)}
                      className={`p-2 rounded-sm border text-left transition-all flex flex-col justify-between ${
                        filterStyle === f.id
                          ? 'border-[#8C3B2B] bg-[#F2EBD9] shadow-2xs font-bold'
                          : 'border-[#2B2825]/20 bg-[#FAF8F5] hover:bg-[#F2EBD9]'
                      }`}
                    >
                      <span className="text-xs text-[#2B2825]">{f.label}</span>
                      <span className="text-[10px] text-[#5C5650] italic mt-1 truncate">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Color & Postmark City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1.5">
                    Color de Papel de Marco
                  </label>
                  <div className="flex items-center gap-2">
                    {FRAME_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFrameColor(col.hex)}
                        className={`w-7 h-7 rounded-full border border-[#2B2825]/30 transition-transform flex items-center justify-center ${
                          frameColor === col.hex ? 'scale-110 ring-2 ring-[#8C3B2B]' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      >
                        {frameColor === col.hex && <Check className="w-3.5 h-3.5 text-neutral-800" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2825] mb-1">
                    Ciudad del Matasellos
                  </label>
                  <input
                    type="text"
                    value={postmarkCity}
                    onChange={(e) => setPostmarkCity(e.target.value)}
                    placeholder="ROMA, KYOTO, SANTIAGO"
                    className="w-full px-3 py-1.5 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] placeholder-[#888888] rounded-sm focus:outline-none focus:border-[#8C3B2B]"
                  />
                </div>
              </div>

              {/* Memory Notes */}
              <div>
                <label className="block text-xs font-bold text-[#2B2825] mb-1">
                  Notas de la Memoria / Reflexión (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Escribe un pequeño pensamiento sobre este día..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B2825]/30 text-[#2B2825] placeholder-[#888888] rounded-sm focus:outline-none focus:border-[#8C3B2B] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2B2825]/15">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#5C5650] hover:text-[#2B2825] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl}
                  className="px-6 py-2 bg-[#8C3B2B] text-[#FAF5E8] text-xs font-bold rounded-sm hover:bg-[#722F22] transition-all border border-[#2B2825] shadow-xs disabled:opacity-50"
                >
                  Guardar Estampilla en Álbum
                </button>
              </div>

            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
