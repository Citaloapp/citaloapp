'use client';
import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIA_JS = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 };

export function CalendarPicker({ onDateSelect, selectedDate, diasAtencion }) {
  const diasPermitidos = diasAtencion
    ? diasAtencion.split(';').map(d => {
        // Soporta formato nuevo "lunes:09:00-18:00" y viejo "lunes,miercoles"
        const nombre = d.split(':')[0].trim().toLowerCase();
        return DIA_JS[nombre];
      }).filter(n => n !== undefined)
    : null;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }
  const today = startOfDay(new Date());

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          aria-label="Mes anterior"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-900 capitalize text-sm">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          aria-label="Mes siguiente"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth);
          const isPast = isBefore(startOfDay(d), today);
          const dayOfWeek = d.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isDiaNoPermitido = isWeekend || (diasPermitidos !== null && !diasPermitidos.includes(dayOfWeek));
          const isSelected = selectedDate && isSameDay(d, selectedDate);
          const isTodayDay = isToday(d);
          const disabled = !inMonth || isPast || isDiaNoPermitido;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onDateSelect(d)}
              className={cn(
                'text-center text-sm py-2 rounded-xl transition-all font-medium',
                !inMonth && 'invisible',
                inMonth && !disabled && !isSelected && 'hover:bg-blue-50 text-gray-700 cursor-pointer',
                disabled && inMonth && 'opacity-40 cursor-not-allowed text-gray-500',
                isTodayDay && !isSelected && 'ring-1 ring-blue-300 text-blue-600',
                isSelected && 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              )}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
