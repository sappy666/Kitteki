import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StampItem } from '../types';
import { Download, ChevronLeft, ChevronRight, Edit3, GripVertical } from 'lucide-react';

interface StampCardProps {
  stamp: StampItem;
  categoryColor?: string;
  onSelect: (stamp: StampItem) => void;
  onDownload: (stamp: StampItem) => void;
  onDropReorder?: (draggedId: string, targetId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const StampCard: React.FC<StampCardProps> = ({
  stamp,
  categoryColor = '#3b82f6',
  onSelect,
  onDownload,
  onDropReorder,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // CSS Filter simulation classes for interactive live UI preview
  const getFilterStyleClass = () => {
    switch (stamp.filterStyle) {
      case 'sepia':
        return 'sepia-[0.75] contrast-[1.1] brightness-[0.95] hue-rotate-[-10deg]';
      case 'monochrome':
        return 'grayscale contrast-[1.3] brightness-[0.9]';
      case 'halftone':
        return 'contrast-[1.4] brightness-[0.95] saturate-[0.8] blur-[0.3px]';
      case 'risograph':
        return 'contrast-[1.25] saturate-[1.6] hue-rotate-[-25deg]';
      case 'ukiyoe':
        return 'saturate-[1.8] contrast-[1.2] brightness-[0.95]';
      case 'watercolor':
        return 'contrast-[0.95] saturate-[1.3] brightness-[1.05] blur-[0.2px]';
      case 'retroGrain':
        return 'sepia-[0.3] contrast-[1.15] saturate-[1.1]';
      default:
        return 'sepia-[0.3]';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', stamp.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && onDropReorder) {
      onDropReorder(draggedId, stamp.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center select-none transition-transform duration-200 ${
        isDragging ? 'opacity-40 scale-95 cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Top Drag Indicator Handle */}
      <div className="flex items-center gap-1.5 mb-1.5 px-2 py-0.5 rounded-full bg-[#FAF5E8]/80 border border-[#2B2825]/20 text-[#5C5650] hover:text-[#8C3B2B] text-[10px] font-serif transition-all group-hover:border-[#8C3B2B]/40 shadow-2xs">
        <GripVertical className="w-3 h-3 text-[#8C3B2B]" />
        <span className="italic">Arrastrar para mover</span>
      </div>

      {/* Outer Stamp Frame Container with Serrated Perforated Borders */}
      <div
        onClick={() => onSelect(stamp)}
        className={`relative cursor-pointer transition-all duration-300 transform group-hover:-translate-y-1.5 rounded-xs ${
          isDragOver ? 'ring-4 ring-[#8C3B2B] ring-offset-2 scale-102' : ''
        }`}
        style={{
          filter: 'drop-shadow(0px 8px 18px rgba(43, 40, 37, 0.22))',
        }}
      >
        {/* Scalloped Stamp Paper Outer Border Container with Perforated Cutouts */}
        <div
          className="relative p-3.5 sm:p-4 stamp-perforated transition-colors text-[#2B2825]"
          style={{
            backgroundColor: stamp.frameColor || '#FAF5E8',
          }}
        >
          {/* Inner Stamp Boundary Box with Delicate Border */}
          <div className="relative flex flex-col items-center bg-[#FAF8F5] border-2 border-[#2B2825] p-2.5 sm:p-3 w-56 sm:w-64">
            
            {/* Header: Title & Category Text */}
            <div className="w-full flex items-center justify-between text-[#2B2825] mb-1.5 px-0.5 border-b border-[#2B2825]/20 pb-1">
              <span className="font-serif font-bold text-[10px] sm:text-xs tracking-wider text-[#8C3B2B]">
                {stamp.kanjiTitle && stamp.kanjiTitle.trim() !== '' ? stamp.kanjiTitle : 'POSTE ITALIANE'}
              </span>
              <span className="font-serif italic text-[11px] text-[#5C5650]">
                {stamp.category}
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative w-full aspect-[4/5] bg-neutral-200 border border-[#2B2825] overflow-hidden group/img">
              <img
                src={stamp.imageUrl}
                alt={stamp.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105 ${getFilterStyleClass()}`}
              />

              {/* Rubber Postal Cancellation Stamp Seal (Overlay) */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-85 rotate-[-12deg]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E293B]">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="100" />
                  <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text x="50" y="32" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor" letterSpacing="1">
                    {(stamp.postmarkCity || 'ROMA').toUpperCase()}
                  </text>
                  <text x="50" y="52" fontSize="7" fontFamily="monospace" textAnchor="middle" fill="currentColor">
                    {stamp.date ? stamp.date.replace(/-/g, '.') : '2026.07.29'}
                  </text>
                  <text x="50" y="68" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">
                    • POSTE •
                  </text>
                  {/* Cancellation Wave Lines */}
                  <path d="M -20 50 Q 0 42 20 50 T 60 50 T 100 50 T 120 50" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
                  <path d="M -20 56 Q 0 48 20 56 T 60 56 T 100 56 T 120 56" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
                </svg>
              </div>

              {/* Quick Hover Action Overlay */}
              <div className="absolute inset-0 bg-[#2B2825]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(stamp);
                  }}
                  className="p-2 bg-[#FAF5E8] text-[#2B2825] border border-[#2B2825] rounded-full hover:bg-white transition-transform hover:scale-110 shadow-md"
                  title="Editar Estampilla"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(stamp);
                  }}
                  className="p-2 bg-[#8C3B2B] text-[#FAF5E8] border border-[#2B2825] rounded-full hover:bg-[#722F22] transition-transform hover:scale-110 shadow-md"
                  title="Descargar PNG Analogico"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Bar: Denomination & Title */}
            <div className="w-full flex items-end justify-between mt-2 pt-1 border-t border-[#2B2825]/10">
              <span className="font-serif font-extrabold text-base sm:text-lg text-[#8C3B2B] tracking-tight">
                {stamp.denomination || ''}
              </span>
              <div className="text-right max-w-[65%]">
                <h4 className="font-semibold text-xs sm:text-sm text-[#2B2825] truncate leading-tight">
                  {stamp.title}
                </h4>
                <p className="text-[10px] text-[#5C5650] font-mono mt-0.5">
                  {stamp.date}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Visual Reordering Controls */}
      <div className="flex items-center gap-1.5 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
        {!isFirst && onMoveLeft && (
          <button
            type="button"
            onClick={onMoveLeft}
            className="p-1 text-[#2B2825] hover:text-[#8C3B2B] bg-[#FAF5E8] hover:bg-[#FAF8F5] rounded-full shadow-2xs transition-all border border-[#2B2825]/20"
            title="Mover a la izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="text-[11px] font-serif italic text-[#5C5650] px-1">
          N° {stamp.orderIndex + 1}
        </span>
        {!isLast && onMoveRight && (
          <button
            type="button"
            onClick={onMoveRight}
            className="p-1 text-[#2B2825] hover:text-[#8C3B2B] bg-[#FAF5E8] hover:bg-[#FAF8F5] rounded-full shadow-2xs transition-all border border-[#2B2825]/20"
            title="Mover a la derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
