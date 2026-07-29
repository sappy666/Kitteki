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
    <div className="w-full flex flex-col gap-6 font-serif">
      {/* Month Navigation & Progress Card */}
      <div className="bg-[#FAF5E8] border-2 border-[#2B2825] rounded-sm p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-sm border border-[#2B2825]/30">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#F2EBD9] rounded-sm transition-colors text-[#2B2825]"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-base px-3 text-[#2B2825]">
              {monthNamesSpanish[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#F2EBD9] rounded-sm transition-colors text-[#2B2825]"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly Completion Progress Bar */}
        <div className="flex-1 max-w-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-serif">
            <span className="font-bold text-[#2B2825] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#8C3B2B]" />
              Meta Mensual de Registro
            </span>
            <span className="font-mono font-bold text-[#8C3B2B]">
              {activeDaysWithStamps} / {daysInMonth} días ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#F2EBD9] rounded-full overflow-hidden border border-[#2B2825]/20">
            <div
              className="h-full bg-[#8C3B2B] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#FAF5E8] border-2 border-[#2B2825] rounded-sm p-4 sm:p-6 shadow-2xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center border-b-2 border-[#2B2825]/15 pb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-xs font-bold text-[#5C5650] font-serif uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty offset padding for first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`offset-${idx}`} className="aspect-square bg-transparent rounded-sm opacity-20" />
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
                className={`relative aspect-[3/4] sm:aspect-square rounded-sm border p-1.5 transition-all flex flex-col justify-between ${
                  hasStamp
                    ? 'border-[#8C3B2B] bg-[#FAF8F5] text-[#2B2825] shadow-2xs hover:scale-[1.02] cursor-pointer'
                    : 'border-dashed border-[#2B2825]/30 bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] hover:border-[#2B2825]'
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
                    className={`font-mono text-xs font-bold ${
                      hasStamp ? 'text-[#8C3B2B]' : 'text-[#5C5650]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasStamp && (
                    <span className="text-[10px] font-serif text-[#8C3B2B] font-bold">
                      {dayStamps[0].denomination}
                    </span>
                  )}
                </div>

                {/* Day Cell Content */}
                {hasStamp ? (
                  <div className="relative w-full flex-1 mt-1 p-1 stamp-perforated-sm bg-[#FAF5E8] group flex items-center justify-center">
                    <div className="w-full h-full border border-[#2B2825] overflow-hidden relative">
                      <img
                        src={dayStamps[0].imageUrl}
                        alt={dayStamps[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#2B2825]/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                        <span className="text-[10px] text-[#FAF5E8] font-bold text-center leading-tight line-clamp-2">
                          {dayStamps[0].title}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-[#5C5650]" />
                    <span className="text-[9px] text-[#5C5650] hidden sm:inline mt-0.5 font-serif italic">
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
