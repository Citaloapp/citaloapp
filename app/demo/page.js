'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const PROF = {
  nombre: 'Dra. Laura Martínez',
  especialidad: 'Dermatóloga',
  matricula: 'MP 54321',
  obras: ['OSDE', 'Swiss Medical', 'Galeno'],
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

const SLOTS = [
  [{ t: '09:00' }, { t: '10:30', bloqueado: true }, { t: '11:00' }, { t: '15:00' }],
  [{ t: '09:30' }, { t: '14:00' }, { t: '16:30' }],
  [{ t: '09:00' }, { t: '11:00' }, { t: '15:30' }, { t: '17:00' }],
];

function getAvailableDays() {
  const today = new Date();
  return [3, 5, 8].map(n => {
    const d = new Date(today);
    d.setDate(today.getDate() + n);
    return d;
  });
}

function buildGrid(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const total = new Date(year, month + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
}

function DemoBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 border-t border-amber-200 py-2.5 text-center text-xs text-amber-700 font-medium">
      Esta es una demo — los datos no se guardan
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

function StepBar({ step }) {
  const labels = ['Fecha', 'Datos', 'Confirmación'];
  return (
    <div className="flex items-center justify-center gap-1 mb-5">
      {labels.map((label, i) => {
        const done   = step > i + 1;
        const active = step === i + 1;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${done   ? 'border-green-400 bg-green-50 text-green-500' :
                active ? 'border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]' :
                         'border-gray-200 text-gray-300'}`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block mr-1
              ${done ? 'text-green-500' : active ? 'text-[#0ea5e9]' : 'text-gray-300'}`}>
              {label}
            </span>
            {i < 2 && <div className={`h-px w-5 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function DemoPage() {
  const availableDays = useMemo(getAvailableDays, []);
  const today  = useMemo(() => new Date(), []);
  const year   = today.getFullYear();
  const month  = today.getMonth();
  const grid   = useMemo(() => buildGrid(year, month), [year, month]);
  const availNums = availableDays.map(d => d.getDate());

  const [step,      setStep]      = useState(0);
  const [selDayIdx, setSelDayIdx] = useState(null);
  const [selTime,   setSelTime]   = useState(null);
  const [form, setForm] = useState({
    nombre: '', whatsapp: '', email: '', obra_social: 'OSDE', motivo: '',
  });

  const selDay = selDayIdx !== null ? availableDays[selDayIdx] : null;

  function resetDemo() {
    setStep(0); setSelDayIdx(null); setSelTime(null);
    setForm({ nombre: '', whatsapp: '', email: '', obra_social: 'OSDE', motivo: '' });
  }

  function fechaStr(d) {
    return `${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Citaloapp" width={100} height={26} priority />
            <span className="text-[10px] font-bold bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full tracking-wider">
              DEMO
            </span>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">

        {/* ══ PASO 0 — Perfil del profesional ══ */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Portada */}
              <div className="bg-[#0ea5e9] h-24 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-md border-4 border-white flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-[#0ea5e9]">L</span>
                  </div>
                </div>
              </div>

              <div className="pt-14 px-6 pb-6">
                <h1 className="text-xl font-bold text-gray-900">{PROF.nombre}</h1>
                <p className="text-[#0ea5e9] font-medium text-sm">{PROF.especialidad}</p>
                <p className="text-gray-400 text-xs mt-0.5">{PROF.matricula}</p>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Obras sociales aceptadas</p>
                  <div className="flex flex-wrap gap-2">
                    {PROF.obras.map(o => (
                      <span key={o} className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded-full">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-6 w-full bg-[#0ea5e9] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0284c7] transition-colors text-sm"
                >
                  Sacar turno
                </button>
              </div>
            </div>

            {/* Info pills */}
            <div className="grid grid-cols-2 gap-3">
              {[['📅', 'Turnos disponibles', 'Esta semana'], ['⏱', 'Duración del turno', '30 minutos']].map(([icon, label, val]) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PASO 1 — Calendario ══ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BackBtn onClick={() => setStep(0)} />
              <h2 className="font-bold text-gray-900">Elegí una fecha</h2>
            </div>
            <StepBar step={1} />

            {/* Grilla del mes */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <p className="text-center font-semibold text-gray-700 mb-4">
                {MESES[month]} {year}
              </p>

              <div className="grid grid-cols-7 mb-2">
                {DIAS.map(d => (
                  <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {grid.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dayIdx     = availNums.indexOf(day);
                  const isAvail    = dayIdx !== -1;
                  const isSelected = isAvail && selDayIdx === dayIdx;
                  const isPast     = new Date(year, month, day) <
                                     new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  return (
                    <button
                      key={i}
                      disabled={!isAvail}
                      onClick={() => { setSelDayIdx(dayIdx); setSelTime(null); }}
                      className={`aspect-square rounded-xl text-sm font-medium flex items-center justify-center transition-all
                        ${isSelected  ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-200' :
                          isAvail     ? 'bg-sky-50 text-[#0ea5e9] hover:bg-sky-100 ring-1 ring-sky-200' :
                          isPast      ? 'text-gray-200 cursor-default' :
                                        'text-gray-300 cursor-default'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded bg-sky-100 border border-sky-200" />
                días con turnos disponibles
              </p>
            </div>

            {/* Slots de horario */}
            {selDayIdx !== null && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Horarios disponibles — {selDay.getDate()} de {MESES[selDay.getMonth()]}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS[selDayIdx].map(({ t, bloqueado }) => (
                    <button
                      key={t}
                      disabled={bloqueado}
                      onClick={() => setSelTime(t)}
                      className={`py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all
                        ${bloqueado     ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                          selTime === t ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-200' :
                                          'bg-sky-50 text-[#0ea5e9] hover:bg-sky-100 border border-sky-100'}`}
                    >
                      {bloqueado && (
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {t}
                    </button>
                  ))}
                </div>

                {selTime && (
                  <button
                    onClick={() => setStep(2)}
                    className="mt-4 w-full bg-[#0ea5e9] text-white font-bold py-3 rounded-2xl hover:bg-[#0284c7] transition-colors text-sm"
                  >
                    Continuar →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ PASO 2 — Datos del paciente ══ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BackBtn onClick={() => setStep(1)} />
              <h2 className="font-bold text-gray-900">Tus datos</h2>
            </div>
            <StepBar step={2} />

            {/* Chip con el turno elegido */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-[#0ea5e9] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Turno seleccionado</p>
                <p className="text-sm font-semibold text-gray-800">
                  {selDay && `${selDay.getDate()} de ${MESES[selDay.getMonth()]}`} — {selTime}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
              {[
                { key: 'nombre',   label: 'Nombre completo', placeholder: 'Ej: María González',  type: 'text' },
                { key: 'whatsapp', label: 'WhatsApp',         placeholder: 'Ej: 11 2345-6789',   type: 'tel'  },
                { key: 'email',    label: 'Email',             placeholder: 'tu@email.com',       type: 'email'},
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
                               focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-[#0ea5e9] transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Obra social</label>
                <select
                  value={form.obra_social}
                  onChange={e => setForm({ ...form, obra_social: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white
                             focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-[#0ea5e9] transition"
                >
                  {[...PROF.obras, 'Particular'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Motivo de consulta{' '}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describí brevemente el motivo..."
                  value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 resize-none
                             focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-[#0ea5e9] transition"
                />
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!form.nombre || !form.whatsapp}
                className="w-full bg-[#0ea5e9] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                           text-white font-bold py-3 rounded-2xl hover:bg-[#0284c7] transition-colors text-sm"
              >
                Ver resumen
              </button>
            </div>
          </div>
        )}

        {/* ══ PASO 3 — Resumen / Confirmación ══ */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BackBtn onClick={() => setStep(2)} />
              <h2 className="font-bold text-gray-900">Confirmá tu turno</h2>
            </div>
            <StepBar step={3} />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resumen del turno</p>
              {[
                ['Profesional',  PROF.nombre],
                ['Especialidad', PROF.especialidad],
                ['Fecha',        selDay ? fechaStr(selDay) : ''],
                ['Hora',         selTime],
                ['Paciente',     form.nombre],
                ['WhatsApp',     form.whatsapp],
                ['Email',        form.email || '—'],
                ['Obra social',  form.obra_social],
                ...(form.motivo ? [['Motivo', form.motivo]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start gap-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <span className="text-xs text-gray-400 shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full bg-[#0ea5e9] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0284c7] transition-colors text-sm"
            >
              Confirmar turno
            </button>
          </div>
        )}

        {/* ══ PASO 4 — Éxito ══ */}
        {step === 4 && (
          <div className="text-center space-y-5 pt-2">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">¡Turno confirmado!</h2>
              <p className="text-gray-500 text-sm mt-1">
                {selDay && `${selDay.getDate()} de ${MESES[selDay.getMonth()]} a las ${selTime}`} · {PROF.nombre}
              </p>
            </div>

            {/* Resumen compacto */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 text-left space-y-3">
              {[
                ['Profesional',  PROF.nombre],
                ['Paciente',     form.nombre],
                ['Fecha y hora', selDay ? `${selDay.getDate()} de ${MESES[selDay.getMonth()]} a las ${selTime}` : ''],
                ['Obra social',  form.obra_social],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>

            {/* Mensaje informativo */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 text-sm text-sky-700 leading-relaxed text-left">
              En una app real recibirías confirmación por <strong>WhatsApp</strong> y <strong>email</strong> con todos los detalles del turno.
            </div>

            <div className="space-y-3">
              <button
                onClick={resetDemo}
                className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
              >
                Volver al inicio de la demo
              </button>
              <a
                href="https://citaloapp.com.ar"
                className="w-full bg-[#0ea5e9] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0284c7] transition-colors text-sm flex items-center justify-center gap-2"
              >
                Quiero mi link para mi consultorio
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        )}

      </main>
      <DemoBanner />
    </div>
  );
}
