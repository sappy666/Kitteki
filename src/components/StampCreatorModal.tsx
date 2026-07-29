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

const FILTER_OPTIONS: { id: FilterStyle; label: string; kanji: string; desc: string }[] = [
  { id: 'sepia', label: 'Vintage Sepia', kanji: 'セピア', desc: 'Tono cálido envejecido' },
  { id: 'halftone', label: 'Showa Dither', kanji: '網点', desc: 'Puntos de imprenta postal' },
  { id: 'ukiyoe', label: 'Ukiyo-e Wood', kanji: '浮世絵', desc: 'Saturación y grabado' },
  { id: 'risograph', label: 'Risograph Ink', kanji: '孔版画', desc: 'Tinta bicolor bermellón/índigo' },
  { id: 'monochrome', label: 'Tinta Sumi-e', kanji: '墨絵', desc: 'Trazos en tinta negra' },
  { id: 'watercolor', label: 'Acuarela', kanji: '水彩', desc: 'Resplandor suave y difuminado' },
  { id: 'retroGrain', label: 'Grano 35mm', kanji: '粒状', desc: 'Textura analógica vintage' },
];

const FRAME_COLORS = [
  { hex: '#F5F0E6', label: 'Washi Blanco' },
  { hex: '#EAE5D9', label: 'Pergamino' },
  { hex: '#F2E2CE', label: 'Té Matcha Suave' },
  { hex: '#E65243', label: 'Rojo Carmesí' },
  { hex: '#2C3E55', label: 'Azul Índigo' },
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
  const [denomination, setDenomination] = useState<string>('¥80');
  const [postmarkCity, setPostmarkCity] = useState<string>('TOKYO');
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
      kanjiTitle: kanjiTitle || '記憶',
      date: date || new Date().toISOString().split('T')[0],
      category: category || categories[0]?.name || 'General',
      imageUrl,
      filterStyle,
      denomination: denomination || '¥80',
      postmarkCity: postmarkCity || 'TOKYO',
      postmarkStyle: 'classic',
      frameColor,
      notes,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#161616] text-[#E5E5E5] rounded-xl shadow-2xl border border-[#2D2D2D] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D2D] bg-[#121212]">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#E5E5E5] flex items-center gap-2">
                <span>新しい切手</span>
                <span className="text-xs font-normal text-[#888888] font-sans">
                  • Convertir Foto en Estampilla Digital
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#282828] text-[#888888] hover:text-[#E5E5E5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Image Upload & Stamp Live Preview */}
            <div className="md:col-span-5 flex flex-col items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#888888] self-start">
                1. Seleccionar Foto
              </label>

              {!imageUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-[4/5] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#B43C28] bg-red-950/30 scale-[0.99]'
                      : 'border-[#333333] hover:border-[#555555] bg-[#222222]'
                  }`}
                >
                  <div className="p-3 bg-[#161616] rounded-full shadow-xs text-[#B43C28] border border-[#333333]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#E5E5E5]">
                      Arrastra tu foto aquí o haz clic
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      JPG, PNG, WebP de tus recuerdos diarios
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSample();
                    }}
                    className="mt-2 text-xs text-[#B43C28] underline font-medium hover:text-red-400"
                  >
                    ¿Probar con foto de ejemplo?
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center group w-full">
                  {/* Live Stamp Preview Card */}
                  <div style={{ filter: 'drop-shadow(0px 6px 14px rgba(0, 0, 0, 0.45))' }}>
                    <div
                      className="p-3.5 stamp-perforated text-[#2B2927]"
                      style={{ backgroundColor: frameColor }}
                    >
                      <div className="bg-[#FAF8F5] border-2 border-[#2B2927] p-2.5 w-48 sm:w-56 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between text-[10px] text-[#2B2927] mb-1 font-serif">
                        <span className="font-bold text-red-800">
                          {kanjiTitle ? `日本郵便 • ${kanjiTitle}` : 'NIPPON POST'}
                        </span>
                        <span className="font-mono text-[9px]">{denomination}</span>
                      </div>
                      <div className="relative w-full aspect-[4/5] bg-neutral-200 border border-[#2B2927] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          style={{
                            filter:
                              filterStyle === 'sepia'
                                ? 'sepia(0.8) contrast(1.1)'
                                : filterStyle === 'monochrome'
                                ? 'grayscale(1) contrast(1.3)'
                                : filterStyle === 'risograph'
                                ? 'contrast(1.3) saturate(1.8)'
                                : filterStyle === 'ukiyoe'
                                ? 'saturate(2) contrast(1.2)'
                                : 'none',
                          }}
                        />
                      </div>
                      <div className="w-full flex items-center justify-between mt-1.5 text-xs">
                        <span className="font-serif font-bold text-[#C8372D]">{denomination}</span>
                        <span className="font-semibold text-[11px] truncate">{title || 'Título'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="mt-3 text-xs text-[#888888] hover:text-[#E5E5E5] underline font-medium flex items-center gap-1"
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

              {/* Gemini AI Auto-Fill button */}
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiLoading}
                  className="w-full py-2.5 px-4 bg-[#222222] text-[#E5E5E5] border border-[#333333] text-xs font-semibold rounded-md hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  {isAiLoading ? 'Generando Metadatos AI...' : 'Asistente AI (Autocompletar Estampilla)'}
                </button>
              )}
            </div>

            {/* Right Column: Customization Controls */}
            <div className="md:col-span-7 flex flex-col gap-5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                2. Personalizar Estampilla Vintage
              </label>

              {/* Title & Kanji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Título de la Memoria
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Café al Atardecer"
                    required
                    className="w-full px-3 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Kanji / Subtítulo Japonés (Opcional)
                  </label>
                  <input
                    type="text"
                    value={kanjiTitle}
                    onChange={(e) => setKanjiTitle(e.target.value)}
                    placeholder="ej. 夕日"
                    className="w-full px-3 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none font-serif"
                  />
                </div>
              </div>

              {/* Date, Category & Denomination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Fecha del Recuerdo
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} {cat.kanjiName ? `(${cat.kanjiName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Valor / Valor Facial
                  </label>
                  <input
                    type="text"
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    placeholder="¥80"
                    className="w-full px-2.5 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none font-serif"
                  />
                </div>
              </div>

              {/* Artistic Filter Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#A0A0A0] mb-2">
                  Filtro Artístico Retro
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterStyle(f.id)}
                      className={`p-2 rounded-md border text-left transition-all flex flex-col justify-between ${
                        filterStyle === f.id
                          ? 'border-[#B43C28] bg-[#221A18] shadow-xs'
                          : 'border-[#333333] bg-[#222222] hover:bg-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-[#E5E5E5]">{f.label}</span>
                        <span className="text-[10px] font-serif text-[#B43C28]">{f.kanji}</span>
                      </div>
                      <span className="text-[10px] text-[#888888] mt-1 truncate">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Color & Postmark City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1.5">
                    Color de Papel de Marco
                  </label>
                  <div className="flex items-center gap-2">
                    {FRAME_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFrameColor(col.hex)}
                        className={`w-7 h-7 rounded-full border border-[#444444] transition-transform flex items-center justify-center ${
                          frameColor === col.hex ? 'scale-110 ring-2 ring-[#B43C28]' : 'hover:scale-105'
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
                  <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                    Ciudad del Matasellos
                  </label>
                  <input
                    type="text"
                    value={postmarkCity}
                    onChange={(e) => setPostmarkCity(e.target.value)}
                    placeholder="TOKYO, KYOTO, SANTIAGO"
                    className="w-full px-3 py-1.5 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none"
                  />
                </div>
              </div>

              {/* Memory Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                  Notas de la Memoria / Reflexión (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Escribe un pequeño pensamiento sobre este día..."
                  className="w-full px-3 py-2 text-sm bg-[#222222] border border-[#333333] text-[#E5E5E5] placeholder-[#666666] rounded-md focus:ring-1 focus:ring-[#B43C28] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2D2D2D]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#888888] hover:text-[#E5E5E5] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl}
                  className="px-6 py-2 bg-[#B43C28] text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
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
