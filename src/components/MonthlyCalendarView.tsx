import React, { useState } from 'react';
import { StampItem, Category } from '../types';
import { StampCard } from './StampCard';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Award } from 'lucide-react';

interface MonthlyCalendarViewProps {
  stamps: StampItem[];
  categories: Category[];
  onSelectStamp: (stamp: StampItem) => void;
  onAddNewForDate: (dateStr: string) => void;
  onDownloadStamp: (stamp: StampItem) => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  stamps,
  categories,
  onSelectStamp,
  onAddNewForDate,
  onDownloadStamp,
}) => {
  // Currently viewed month (default July 2026 based on mock timeline or current month)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 0-indexed, 6 = July

  const monthNamesSpanish = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthKanji = [
    '睦月', '如月', '弥生', '卯月', '皐月', '水無月',
    '文月', '葉月', '長月', '神無月', '霜月', '師走'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Map stamps by date string YYYY-MM-DD
  const stampsByDate: Record<string, StampItem[]> = {};
  stamps.forEach((stamp) => {
    if (stamp.date) {
      if (!stampsByDate[stamp.date]) stampsByDate[stamp.date] = [];
      stampsByDate[stamp.date].push(stamp);
    }
  });

  // Calculate monthly stats
  const activeDaysWithStamps = Object.keys(stampsByDate).filter((dateStr) => {
    const d = new Date(dateStr);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const progressPercent = Math.min(100, Math.round((activeDaysWithStamps / daysInMonth) * 100));

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getCategoryColor = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.color : '#3b82f6';
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Month Navigation & Progress Card */}
      <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#222222] p-1 rounded-lg border border-[#333333]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#E5E5E5]"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-base px-3 text-[#E5E5E5]">
              {monthNamesSpanish[currentMonth]} {currentYear}
              <span className="text-xs font-normal text-[#B43C28] ml-2 font-sans">
                ({monthKanji[currentMonth]})
              </span>
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#E5E5E5]"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly Completion Progress Bar */}
        <div className="flex-1 max-w-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#E5E5E5] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#B43C28]" />
              Meta Mensual: Llenar el Diario
            </span>
            <span className="font-mono font-bold text-[#B43C28]">
              {activeDaysWithStamps} / {daysInMonth} días ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#282828] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B43C28] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#161616] border border-[#2D2D2D] rounded-xl p-4 sm:p-6 shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center border-b border-[#2D2D2D] pb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-xs font-semibold text-[#888888] font-serif">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty offset padding for first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`offset-${idx}`} className="aspect-square bg-transparent rounded-lg opacity-20" />
          ))}

          {/* Days 1 to daysInMonth */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
            const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const dayStamps = stampsByDate[dateStr] || [];
            const hasStamp = dayStamps.length > 0;

            return (
              <div
                key={dateStr}
                className={`relative aspect-[3/4] sm:aspect-square rounded-lg border p-1.5 transition-all flex flex-col justify-between ${
                  hasStamp
                    ? 'border-[#B43C28]/60 bg-[#D9D2C5] text-[#2B2927] shadow-2xs hover:shadow-md cursor-pointer'
                    : 'border-dashed border-[#333333] bg-[#1E1E1E] hover:bg-[#252525] hover:border-[#555555]'
                }`}
                onClick={() => {
                  if (hasStamp) {
                    onSelectStamp(dayStamps[0]);
                  } else {
                    onAddNewForDate(dateStr);
                  }
                }}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-bold px-1 rounded-xs ${
                      hasStamp ? 'bg-[#0F0F0F] text-white' : 'text-[#888888]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasStamp && (
                    <span className="text-[9px] font-serif text-[#B43C28] font-bold">
                      {dayStamps[0].denomination}
                    </span>
                  )}
                </div>

                {/* Day Cell Content */}
                {hasStamp ? (
                  <div className="relative w-full flex-1 mt-1 p-1 stamp-perforated-sm bg-[#F5F0E6] group flex items-center justify-center">
                    <div className="w-full h-full border border-[#2B2927] overflow-hidden relative">
                      <img
                        src={dayStamps[0].imageUrl}
                        alt={dayStamps[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#0F0F0F]/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-semibold text-center px-1 truncate">
                          {dayStamps[0].title}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-[#888888]" />
                    <span className="text-[9px] text-[#888888] hidden sm:inline mt-0.5 font-sans">
                      Añadir
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
