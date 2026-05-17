'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const DURACIONES = ['20', '30', '45', '60'];

const STEPS = ['Tus datos', 'Tu perfil', 'Confirmar'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Paso 1
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [matricula, setMatricula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Paso 2
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [obrasSociales, setObrasSociales] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [colorMarca, setColorMarca] = useState('#0ea5e9');

  const fileInputRef = useRef(null);

  const step0Valid = nombre.trim() && especialidad.trim() && telefono.trim() && email.trim();
  const step1Valid = true;

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('especialidad', especialidad);
      fd.append('matricula', matricula);
      fd.append('telefono', telefono);
      fd.append('email', email);
      fd.append('descripcion', descripcion);
      fd.append('obras_sociales', obrasSociales);
      fd.append('duracion_turno', duracion);
      fd.append('color_marca', colorMarca);
      if (fotoFile) fd.append('foto', fotoFile);

      const res = await fetch('/api/onboarding', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">¡Solicitud enviada!</h1>
          <p className="text-gray-500 leading-relaxed">
            Revisaremos tu información y en 72hs te enviamos tu link personalizado por WhatsApp.
          </p>
          <a href="/" className="inline-block mt-8 text-sm text-[#0ea5e9] font-semibold hover:underline">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4 flex justify-center">
        <a href="/">
          <Image src="/logo.svg" alt="Citalo" width={100} height={26} priority />
        </a>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10 pb-20">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      done && 'bg-green-500 text-white',
                      active && 'bg-[#0ea5e9] text-white',
                      !active && !done && 'bg-gray-200 text-gray-400'
                    )}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={cn('text-xs hidden sm:block', active ? 'font-semibold text-gray-900' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('w-8 h-px mx-1', done ? 'bg-green-400' : 'bg-gray-200')} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── PASO 0: Datos personales ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Tus datos profesionales</h1>
              <p className="text-gray-500 text-sm mt-1">Con esto armamos tu perfil público.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <Field label="Nombre con título *" placeholder="Ej: Dra. Ana García" value={nombre} onChange={setNombre} />
              <Field label="Especialidad *" placeholder="Ej: Cardiología, Psicología, Odontología" value={especialidad} onChange={setEspecialidad} />
              <Field label="Número de matrícula" placeholder="Ej: 12345" value={matricula} onChange={setMatricula} />
              <Field label="WhatsApp *" type="tel" placeholder="Ej: 1123456789 (sin 0 ni 15)" value={telefono} onChange={setTelefono} />
              <Field label="Email *" type="email" placeholder="tu@email.com" value={email} onChange={setEmail} />
            </div>

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base transition-colors disabled:opacity-40 bg-[#0ea5e9] hover:bg-[#0284c7]"
              disabled={!step0Valid}
              onClick={() => setStep(1)}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* ── PASO 1: Configuración ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(0)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Tu perfil</h1>
                <p className="text-gray-500 text-sm">Esto aparece en tu página pública.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
              {/* Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#0ea5e9] transition-colors shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-[#0ea5e9] font-medium hover:underline"
                    >
                      {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                    <p className="text-xs text-gray-400 mt-0.5">JPG o PNG, máx. 5MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción breve
                  <span className="text-gray-400 font-normal ml-1">({descripcion.length}/200)</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] resize-none"
                  rows={3}
                  maxLength={200}
                  placeholder="Contá brevemente sobre vos y tu trabajo..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                />
              </div>

              {/* Obras sociales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Obras sociales que atendés</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  placeholder="Ej: OSDE, Swiss Medical, IOMA (separadas por coma)"
                  value={obrasSociales}
                  onChange={e => setObrasSociales(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Separalas con coma. Dejalo vacío si atendés solo particular.</p>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duración de cada turno</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURACIONES.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuracion(d)}
                      className={cn(
                        'py-2.5 rounded-xl text-sm font-medium border transition-all',
                        duracion === d
                          ? 'bg-[#0ea5e9] text-white border-transparent'
                          : 'border-gray-200 text-gray-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9] bg-white'
                      )}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Color de tu perfil</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorMarca}
                    onChange={e => setColorMarca(e.target.value)}
                    className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-gray-500">Es el color principal que ven tus pacientes</span>
                </div>
              </div>
            </div>

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
              onClick={() => setStep(2)}
            >
              Ver resumen
            </button>
          </div>
        )}

        {/* ── PASO 2: Confirmar ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Revisá tu solicitud</h1>
                <p className="text-gray-500 text-sm">Confirmá que todo esté bien.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {fotoPreview && (
                <div className="px-5 py-4 flex items-center gap-3">
                  <img src={fotoPreview} alt="foto" className="w-14 h-14 rounded-xl object-cover" />
                  <span className="text-sm text-gray-500">Foto de perfil cargada</span>
                </div>
              )}
              <SummaryRow label="Nombre" value={nombre} />
              <SummaryRow label="Especialidad" value={especialidad} />
              {matricula && <SummaryRow label="Matrícula" value={matricula} />}
              <SummaryRow label="WhatsApp" value={telefono} />
              <SummaryRow label="Email" value={email} />
              {descripcion && <SummaryRow label="Descripción" value={descripcion} />}
              {obrasSociales && <SummaryRow label="Obras sociales" value={obrasSociales} />}
              <SummaryRow label="Duración de turno" value={`${duracion} minutos`} />
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-sm text-gray-500 shrink-0">Color de perfil</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: colorMarca }} />
                  <span className="text-sm font-medium text-gray-900">{colorMarca}</span>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 rounded-2xl px-5 py-4 text-sm text-sky-700 border border-sky-100">
              Revisaremos tu información y en <strong>72hs</strong> te enviamos tu link personalizado por WhatsApp.
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : 'Enviar solicitud'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 px-5 py-3">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}
