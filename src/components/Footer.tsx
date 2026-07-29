import React, { useRef } from 'react';
import { StampItem, Category } from '../types';
import { Download, Upload, Heart } from 'lucide-react';

interface FooterProps {
  stamps: StampItem[];
  categories: Category[];
  onImportData: (stamps: StampItem[], categories: Category[]) => void;
}

export const Footer: React.FC<FooterProps> = ({ stamps, categories, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      signature: '@sappy.error',
      stamps,
      categories,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitteki-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.stamps) && Array.isArray(parsed.categories)) {
          onImportData(parsed.stamps, parsed.categories);
          alert('¡Álbum de estampillas restaurado con éxito!');
        } else {
          alert('Formato de archivo de respaldo no válido.');
        }
      } catch {
        alert('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <footer className="w-full bg-[#121212] border-t border-[#2D2D2D] py-8 px-4 mt-12 text-[#E5E5E5]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Japanese Brand Philosophy & Credit */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2 font-serif font-bold text-sm">
            <span>Kitteki Diario (切手日記)</span>
            <span className="text-xs text-[#B43C28]">• 日本の文房具</span>
          </div>
          <p className="text-xs text-[#888888] max-w-md font-sans">
            Convierte tus momentos cotidianos en estampillas postales digitales retro.
            Curado para <span className="font-semibold text-[#E5E5E5]">@sappy.error</span>.
          </p>
        </div>

        {/* Center: Backup & Restore Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="px-3 py-1.5 text-xs bg-[#1E1E1E] text-[#E5E5E5] border border-[#2D2D2D] rounded-md hover:bg-[#282828] transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
            title="Exportar respaldo de datos"
          >
            <Download className="w-3.5 h-3.5 text-[#888888]" /> Respaldo JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs bg-[#1E1E1E] text-[#E5E5E5] border border-[#2D2D2D] rounded-md hover:bg-[#282828] transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
            title="Importar respaldo de datos"
          >
            <Upload className="w-3.5 h-3.5 text-[#888888]" /> Restaurar
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* Right: Signature */}
        <div className="text-xs text-[#888888] font-mono flex items-center gap-1">
          <span>Diseño Minimalista</span>
          <Heart className="w-3 h-3 text-[#B43C28] fill-current" />
          <span className="font-semibold text-[#E5E5E5]">@sappy.error</span>
        </div>

      </div>
    </footer>
  );
};
