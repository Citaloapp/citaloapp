'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const DURACIONES = ['20', '30', '45', '60'];
const DURACIONES_SERVICIO = ['20', '30', '45', '60', '90'];
const STEPS = ['Tus datos', 'Tu perfil', 'Confirmar'];
const SERVICIO_VACIO = { nombre: '', duracion: '30', precio: '' };

const ESPECIALIDADES = [
  'Alergología', 'Anatomía patológica', 'Anestesiología', 'Cardiología',
  'Cirugía cardiovascular', 'Cirugía general', 'Cirugía plástica',
  'Clínica médica', 'Dermatología', 'Endocrinología', 'Estética corporal',
  'Estética facial', 'Fonoaudiología', 'Gastroenterología', 'Geriatría',
  'Ginecología', 'Hematología', 'Infectología', 'Inmunología',
  'Kinesiología', 'Medicina del trabajo', 'Medicina general', 'Medicina legal',
  'Nefrología', 'Neonatología', 'Neumología', 'Neurología', 'Neurocirugía',
  'Nutrición', 'Nutricionista', 'Obstetricia', 'Odontología',
  'Odontología estética', 'Oftalmología', 'Oncología',
  'Ortopedia y traumatología', 'Otorrinolaringología', 'Pediatría',
  'Podología', 'Psicología', 'Psiquiatría', 'Radiología', 'Rehabilitación',
  'Reumatología', 'Terapia ocupacional', 'Urología',
];

const OBRAS_SOCIALES = [
  'ACCORD', 'ACCORD Salud', 'AMEG', 'AMSAFE', 'APS', 'APRES', 'APROSS', 'ATSA',
  'Avalian', 'BANCOSUR', 'BASART', 'CAMECE', 'CEMIC', 'CESALUD', 'CIMECO',
  'COESBA', 'COLAGRO', 'DAMSU', 'DAOM', 'DASPU', 'DASUTEN', 'DOSEP', 'DOSPU',
  'DOSS', 'DOSUBA', 'ECOMEDIC', 'EJÉRCITO', 'EMERGENCIAS', 'EXPERTA', 'FATSA',
  'FEDERADA SALUD', 'FEHGRA', 'FEMECON', 'FLACSO', 'FOETRA', 'Galeno',
  'GESTAR', 'H2O', 'HOMINIS', 'Hospital Alemán', 'Hospital Italiano', 'IOMA',
  'JOSPER', 'LIGHT', 'LUIS PASTEUR', 'Medicus', 'MEDIFE', 'MEDIFÉ', 'MEDISUR',
  'MEDIVAC', 'MUTUAL', 'OMINT', 'OSDIPP', 'OSDE', 'OSEF', 'OSFA', 'OSFATLYF',
  'OSFATUN', 'OSFEPSA', 'OSIM', 'OSMATA', 'OSMEDICA', 'OSPAC', 'OSPAD',
  'OSPE', 'OSPIA', 'OSPIP', 'OSPIT', 'OSPLAD', 'OSPM', 'OSPORH', 'OSPOS',
  'OSPRERA', 'OSPSA', 'OSPUAYE', 'OSTEP', 'OSUTHGRA', 'PAMI', 'PAMI CONVENIO',
  'PASALUD', 'PATROL', 'PODER JUDICIAL', 'POLICIAL', 'PREMEDIC',
  'PREVENCIÓN SALUD', 'PROVINCIAL', 'Sancor Salud', 'SASM', 'SEGUIR',
  'SERVIMED', 'SIMPLE', 'SINDICATO', 'SPE', 'STAFF MEDICO', 'Swiss Medical',
  'UPCN', 'VALORA', 'VIDA', 'VITAL', 'WITCEL', 'WPP', 'Y-TEC',
];

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
  const [obrasSocialesSeleccionadas, setObrasSocialesSeleccionadas] = useState([]);
  const [duracion, setDuracion] = useState('30');
  const [colorMarca, setColorMarca] = useState('#0ea5e9');
  const [servicios, setServicios] = useState([{ ...SERVICIO_VACIO }]);

  const fileInputRef = useRef(null);

  const step0Valid = nombre.trim() && especialidad.trim() && telefono.trim() && email.trim();
  const step1Valid = servicios.some(s => s.nombre.trim());

  function addServicio() {
    setServicios(prev => [...prev, { ...SERVICIO_VACIO }]);
  }

  function removeServicio(i) {
    setServicios(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateServicio(i, field, value) {
    setServicios(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

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
      fd.append('obras_sociales', obrasSocialesSeleccionadas.join(', '));
      fd.append('duracion_turno', duracion);
      fd.append('color_marca', colorMarca);
      fd.append('servicios', JSON.stringify(servicios.filter(s => s.nombre.trim())));
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
              <SearchSelect
                label="Especialidad *"
                placeholder="Buscá tu especialidad..."
                options={ESPECIALIDADES}
                value={especialidad}
                onChange={setEspecialidad}
              />
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
              <MultiSearchSelect
                label="Obras sociales que atendés"
                placeholder="Buscá y seleccioná obras sociales..."
                options={OBRAS_SOCIALES}
                selected={obrasSocialesSeleccionadas}
                onChange={setObrasSocialesSeleccionadas}
              />

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

            {/* Servicios */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tus servicios *</p>
                  <p className="text-xs text-gray-400 mt-0.5">Agregá los servicios que ofrecés</p>
                </div>
                <button
                  type="button"
                  onClick={addServicio}
                  className="flex items-center gap-1.5 text-sm text-[#0ea5e9] font-medium hover:text-[#0284c7] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {servicios.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        placeholder="Ej: Consulta, Peeling, Dermapen"
                        value={s.nombre}
                        onChange={e => updateServicio(i, 'nombre', e.target.value)}
                      />
                      {servicios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeServicio(i)}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Duración</p>
                        <div className="flex gap-1 flex-wrap">
                          {DURACIONES_SERVICIO.map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => updateServicio(i, 'duracion', d)}
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                                s.duracion === d
                                  ? 'bg-[#0ea5e9] text-white border-transparent'
                                  : 'border-gray-200 text-gray-600 hover:border-[#0ea5e9] bg-white'
                              )}
                            >
                              {d}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-28 shrink-0">
                        <p className="text-xs text-gray-500 mb-1">Precio (opcional)</p>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                          placeholder="$ 0"
                          value={s.precio}
                          onChange={e => updateServicio(i, 'precio', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors disabled:opacity-40"
              disabled={!step1Valid}
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
              {obrasSocialesSeleccionadas.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-sm text-gray-500 mb-2">Obras sociales</p>
                  <div className="flex flex-wrap gap-1.5">
                    {obrasSocialesSeleccionadas.map(os => (
                      <span key={os} className="bg-sky-50 text-sky-700 text-xs font-medium px-2.5 py-1 rounded-full border border-sky-100">
                        {os}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <SummaryRow label="Duración de turno" value={`${duracion} minutos`} />
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-sm text-gray-500 shrink-0">Color de perfil</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: colorMarca }} />
                  <span className="text-sm font-medium text-gray-900">{colorMarca}</span>
                </div>
              </div>
              {servicios.filter(s => s.nombre.trim()).length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-sm text-gray-500 mb-2">Servicios</p>
                  <div className="space-y-1">
                    {servicios.filter(s => s.nombre.trim()).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{s.nombre}</span>
                        <span className="text-gray-400 text-xs">
                          {s.duracion} min{s.precio ? ` · $${Number(s.precio).toLocaleString('es-AR')}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

// ── Selector con buscador (selección única) ───────────────────────────────

function SearchSelect({ label, placeholder, options, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = options
    .filter(o => o.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);

  function handleSelect(option) {
    onChange(option);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="relative z-10">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
          placeholder={value || placeholder}
          value={open ? query : value}
          onFocus={() => { setOpen(true); setQuery(''); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={e => setQuery(e.target.value)}
        />
        {value && !open && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onChange(''); setQuery(''); }}
            className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {open && filtered.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
            {filtered.map(option => (
              <li
                key={option}
                onMouseDown={() => handleSelect(option)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-[#0ea5e9] cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
        {open && query && filtered.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
            Sin resultados para "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

// ── Selector múltiple con buscador y badges ───────────────────────────────

function MultiSearchSelect({ label, placeholder, options, selected, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = options
    .filter(o => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);

  function toggle(option) {
    onChange(selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option]
    );
    setQuery('');
  }

  return (
    <div className="relative z-10">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(os => (
            <span key={os} className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full border border-sky-100">
              {os}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); onChange(selected.filter(s => s !== os)); }}
                className="text-sky-400 hover:text-sky-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
          placeholder={selected.length > 0 ? 'Agregar otra...' : placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={e => setQuery(e.target.value)}
        />
        {open && (filtered.length > 0 || query) && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(option => (
              <li
                key={option}
                onMouseDown={() => toggle(option)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-[#0ea5e9] cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </li>
            )) : (
              <li className="px-4 py-3 text-sm text-gray-400">Sin resultados para "{query}"</li>
            )}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">Dejalo vacío si atendés solo particular.</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

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
