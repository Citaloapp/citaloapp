'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const DURACIONES = ['20', '30', '45', '60'];
const DURACIONES_SERVICIO = ['20', '30', '45', '60', '90'];

const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lun' },
  { value: 'martes', label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves', label: 'Jue' },
  { value: 'viernes', label: 'Vie' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' },
];

const HORAS_ATENCION = Array.from({ length: 33 }, (_, i) => {
  const mins = 360 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
});

const STEPS = ['Tus datos', 'Tu perfil', 'Elegí tu plan', 'Confirmar y pagar'];

const PLANES = [
  {
    name: 'Plan Profesional',
    price: '$17.999',
    priceNum: 17999,
    desc: 'Para profesionales independientes',
    features: [
      '1 profesional',
      'Turnos ilimitados',
      'Mensaje de bienvenida con link de turnos',
      'Recordatorio automático 24hs antes del turno',
      'Cancelación y reprogramación por WhatsApp',
    ],
    popular: false,
    enterprise: false,
  },
  {
    name: 'Plan Consultorio',
    price: '$39.999',
    priceNum: 39999,
    desc: 'Para consultorios compartidos',
    features: [
      'Hasta 3 profesionales',
      'Turnos ilimitados',
      'Mensaje de bienvenida con link de turnos',
      'Recordatorio automático 24hs antes del turno',
      'Cancelación y reprogramación por WhatsApp',
      'Panel admin compartido',
    ],
    popular: true,
    enterprise: false,
  },
  {
    name: 'Plan Enterprise',
    price: 'Consultar',
    priceNum: null,
    desc: 'Para grandes equipos',
    features: [
      'Más de 3 profesionales',
      'Todo lo del Plan Consultorio',
      'Atención personalizada',
    ],
    popular: false,
    enterprise: true,
  },
];

const SERVICIO_VACIO = { nombre: '', duracion: '30', precio: '' };
const SESSION_KEY = 'citalo_onboarding';

const ESPECIALIDADES = [
  'Clínica Médica',
  'Medicina General',
  'Medicina Familiar',
  'Medicina Interna',
  'Pediatría',
  'Geriatría',
  'Medicina del Trabajo',
  'Medicina del Deporte',
  'Cardiología',
  'Cardiología Pediátrica',
  'Cirugía Cardiovascular',
  'Cirugía Vascular',
  'Flebolinfología',
  'Hematología',
  'Hemoterapia',
  'Gastroenterología',
  'Hepatología',
  'Cirugía General',
  'Cirugía Bariátrica',
  'Proctología',
  'Nutrición y Dietética',
  'Neurología',
  'Neurocirugía',
  'Psiquiatría',
  'Psicología',
  'Salud Mental',
  'Ortopedia y Traumatología',
  'Reumatología',
  'Kinesiología y Fisiatría',
  'Cirugía de Columna',
  'Neumonología',
  'Otorrinolaringología',
  'Fonoaudiología',
  'Dermatología',
  'Cirugía Plástica y Reparadora',
  'Nefrología',
  'Urología',
  'Ginecología',
  'Obstetricia',
  'Mastología',
  'Tocoginecología',
  'Oncología',
  'Radioterapia',
  'Medicina Nuclear',
  'Diagnóstico por Imágenes',
  'Radiología',
  'Ecografía',
  'Laboratorio de Análisis Clínicos',
  'Anatomía Patológica',
  'Infectología',
  'Endocrinología',
  'Oftalmología',
  'Odontología',
  'Ortodoncia',
  'Inmunología',
  'Alergología',
  'Nefrología Pediátrica',
  'Cirugía Torácica',
  'Trasplantes',
];

const OBRAS_SOCIALES = [
  // Prepagas
  'OSDE',
  'Swiss Medical',
  'Galeno',
  'Medifé',
  'Medicus',
  'OMINT',
  'Sancor Salud',
  'Prevención Salud',
  'Avalian',
  'Hospital Italiano Plan de Salud',
  'CEMIC',
  'Accord Salud',
  'Federada Salud',
  'PreMedic',
  'Hominis',
  'Parque Salud',
  'Plenimedical',
  'Amsterdam Salud',
  // Obras sociales nacionales
  'PAMI',
  'IOMA',
  'OSECAC',
  'Unión Personal',
  'OSMATA',
  'UOM',
  'OSUTHGRA',
  'OSPACARP',
  'OSDEPYM',
  'ANDAR',
  'AMFFA Salud',
  'OSPAT',
  'OSFATUN',
  'OSFE',
  'OSPIT',
  'OS Bancarios',
  'OS Docentes',
  'OS Camioneros',
  'OS Textiles',
  'OS Gráficos',
  'OS Telefónicos',
  'OS Judiciales',
  'OS Aeronáuticos',
  'OS Periodistas',
  // Obras sociales provinciales
  'IOMA (Buenos Aires)',
  'IOSPER (Entre Ríos)',
  'IPAM (Córdoba)',
  'OSEP (Mendoza)',
  'IOSFA (Fuerzas Armadas)',
  'PROSSAM (Chaco)',
  'DASPU (Santa Fe)',
  'OSPRERA',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Paso 0 — datos personales
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [matricula, setMatricula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [slugDeseado, setSlugDeseado] = useState('');

  // Paso 1 — perfil
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [horariosPorDia, setHorariosPorDia] = useState(
    Object.fromEntries(DIAS_SEMANA.map(({ value }) => [value, []]))
  );
  const [descripcion, setDescripcion] = useState('');
  const [obrasSocialesSeleccionadas, setObrasSocialesSeleccionadas] = useState([]);
  const [duracion, setDuracion] = useState('30');
  const [colorMarca, setColorMarca] = useState('#0ea5e9');
  const [servicios, setServicios] = useState([{ ...SERVICIO_VACIO }]);

  // Paso 2 — plan
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

  const fileInputRef = useRef(null);

  // Restaurar desde sessionStorage al montar
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.nombre) setNombre(d.nombre);
      if (d.especialidad) setEspecialidad(d.especialidad);
      if (d.matricula) setMatricula(d.matricula);
      if (d.telefono) setTelefono(d.telefono);
      if (d.email) setEmail(d.email);
      if (d.slugDeseado) setSlugDeseado(d.slugDeseado);
      if (d.horariosPorDia) setHorariosPorDia(d.horariosPorDia);
      if (d.descripcion) setDescripcion(d.descripcion);
      if (d.obrasSociales) setObrasSocialesSeleccionadas(d.obrasSociales);
      if (d.duracion) setDuracion(d.duracion);
      if (d.colorMarca) setColorMarca(d.colorMarca);
      if (d.servicios) setServicios(d.servicios);
      if (d.planSeleccionado) setPlanSeleccionado(d.planSeleccionado);
    } catch {}
  }, []);

  // Guardar en sessionStorage cuando cambian los datos
  function saveSession(overrides = {}) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        nombre, especialidad, matricula, telefono, email, slugDeseado,
        horariosPorDia, descripcion,
        obrasSociales: obrasSocialesSeleccionadas, duracion, colorMarca,
        servicios, planSeleccionado,
        ...overrides,
      }));
    } catch {}
  }

  function goToStep(n, overrides = {}) {
    saveSession(overrides);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const step0Valid = nombre.trim() && especialidad.trim() && telefono.trim() && email.trim();
  const step1Valid = servicios.some(s => s.nombre.trim());
  const step2Valid = !!planSeleccionado;

  function addServicio() { setServicios(prev => [...prev, { ...SERVICIO_VACIO }]); }
  function removeServicio(i) { setServicios(prev => prev.filter((_, idx) => idx !== i)); }
  function updateServicio(i, field, value) {
    setServicios(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function toggleDia(dia) {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: prev[dia].length > 0 ? [] : [{ desde: '09:00', hasta: '18:00' }],
    }));
  }

  function addRango(dia) {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: [...prev[dia], { desde: '09:00', hasta: '18:00' }],
    }));
  }

  function removeRango(dia, idx) {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: prev[dia].filter((_, i) => i !== idx),
    }));
  }

  function updateRango(dia, idx, field, value) {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: prev[dia].map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
  }

  function serializeHorarios(hpd) {
    return Object.entries(hpd)
      .filter(([, rangos]) => rangos.length > 0)
      .map(([dia, rangos]) => `${dia}:${rangos.map(r => `${r.desde}-${r.hasta}`).join(',')}`)
      .join(';');
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handlePagar() {
    setPaying(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('especialidad', especialidad);
      fd.append('matricula', matricula);
      fd.append('telefono', telefono);
      fd.append('email', email);
      fd.append('slug_deseado', slugDeseado);
      fd.append('descripcion', descripcion);
      fd.append('obras_sociales', obrasSocialesSeleccionadas.join(', '));
      fd.append('duracion_turno', duracion);
      fd.append('color_marca', colorMarca);
      fd.append('horarios', serializeHorarios(horariosPorDia));
      fd.append('servicios', JSON.stringify(servicios.filter(s => s.nombre.trim())));
      fd.append('plan_elegido', planSeleccionado.name);
      if (fotoFile) fd.append('foto', fotoFile);

      const res = await fetch('/api/mp/crear-preferencia', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al iniciar el pago');
      }
      const { init_point } = await res.json();
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = init_point;
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug deseado para tu link
                  <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0ea5e9]">
                  <span className="pl-3 pr-1 text-sm text-gray-400 shrink-0">citaloapp.com.ar/</span>
                  <input
                    type="text"
                    className="flex-1 py-2.5 pr-3 text-sm focus:outline-none bg-transparent"
                    placeholder="dra-garcia"
                    value={slugDeseado}
                    onChange={e => setSlugDeseado(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones.</p>
              </div>
            </div>

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base transition-colors disabled:opacity-40 bg-[#0ea5e9] hover:bg-[#0284c7]"
              disabled={!step0Valid}
              onClick={() => goToStep(1)}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* ── PASO 1: Configuración del perfil ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => goToStep(0)} className="text-gray-400 hover:text-gray-600">
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
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-[#0ea5e9] font-medium hover:underline">
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
                    <button key={d} type="button" onClick={() => setDuracion(d)}
                      className={cn('py-2.5 rounded-xl text-sm font-medium border transition-all',
                        duracion === d ? 'bg-[#0ea5e9] text-white border-transparent' : 'border-gray-200 text-gray-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9] bg-white'
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
                  <input type="color" value={colorMarca} onChange={e => setColorMarca(e.target.value)}
                    className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-gray-500">Es el color principal que ven tus pacientes</span>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Horarios de atención</p>
                <p className="text-xs text-gray-400 mt-0.5">Activá cada día y configurá tus rangos horarios</p>
              </div>
              <div className="space-y-3">
                {DIAS_SEMANA.map(({ value, label }) => {
                  const rangos = horariosPorDia[value];
                  const activo = rangos.length > 0;
                  return (
                    <div key={value}>
                      <button type="button"
                        onClick={() => toggleDia(value)}
                        className={cn('px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                          activo ? 'bg-[#0ea5e9] text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-[#0ea5e9] bg-white'
                        )}
                      >
                        {label}
                      </button>
                      {activo && (
                        <div className="mt-2 ml-1 space-y-2">
                          {rangos.map((rango, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <select value={rango.desde} onChange={e => updateRango(value, idx, 'desde', e.target.value)}
                                className="border border-gray-300 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                              >
                                {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <span className="text-xs text-gray-400">—</span>
                              <select value={rango.hasta} onChange={e => updateRango(value, idx, 'hasta', e.target.value)}
                                className="border border-gray-300 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                              >
                                {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              {rangos.length > 1 && (
                                <button type="button" onClick={() => removeRango(value, idx)}
                                  className="text-gray-400 hover:text-red-400 transition-colors text-xl leading-none pb-0.5"
                                >×</button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => addRango(value)}
                            className="text-xs text-[#0ea5e9] font-medium hover:text-[#0284c7] transition-colors"
                          >
                            + Agregar rango
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tus servicios *</p>
                  <p className="text-xs text-gray-400 mt-0.5">Agregá los servicios que ofrecés</p>
                </div>
                <button type="button" onClick={addServicio}
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
                        <button type="button" onClick={() => removeServicio(i)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
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
                            <button key={d} type="button" onClick={() => updateServicio(i, 'duracion', d)}
                              className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                                s.duracion === d ? 'bg-[#0ea5e9] text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-[#0ea5e9] bg-white'
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
              onClick={() => goToStep(2)}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* ── PASO 2: Elegí tu plan ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => goToStep(1)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Elegí tu plan</h1>
                <p className="text-gray-500 text-sm">El pago se realiza en el siguiente paso.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {PLANES.map((plan) => {
                const isSelected = planSeleccionado?.name === plan.name;
                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setPlanSeleccionado(plan)}
                    className={cn(
                      'w-full text-left rounded-2xl p-5 flex flex-col gap-4 transition-all',
                      plan.popular && !isSelected && 'bg-[#0ea5e9] text-white shadow-xl shadow-sky-200',
                      plan.popular && isSelected && 'bg-[#0ea5e9] text-white shadow-xl shadow-sky-200 ring-4 ring-sky-300',
                      !plan.popular && !isSelected && 'bg-white border border-gray-200',
                      !plan.popular && isSelected && 'bg-white border-2 border-[#0ea5e9] shadow-sm',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {plan.popular && (
                          <span className="inline-block bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5">
                            Más popular
                          </span>
                        )}
                        <p className={cn('text-xs font-medium mb-0.5', plan.popular ? 'text-sky-100' : 'text-gray-500')}>{plan.desc}</p>
                        <p className={cn('text-sm font-semibold', plan.popular ? 'text-white' : 'text-gray-900')}>{plan.name}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-start gap-2">
                        <div>
                          <span className={cn('text-2xl font-extrabold', plan.popular ? 'text-white' : 'text-gray-900')}>{plan.price}</span>
                          {!plan.enterprise && <p className={cn('text-xs', plan.popular ? 'text-sky-100' : 'text-gray-400')}>/mes</p>}
                        </div>
                        {isSelected && (
                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1', plan.popular ? 'bg-white/30' : 'bg-[#0ea5e9]')}>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <svg className={cn('w-4 h-4 shrink-0', plan.popular ? 'text-white' : 'text-[#0ea5e9]')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className={cn('text-sm', plan.popular ? 'text-sky-50' : 'text-gray-600')}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors disabled:opacity-40"
              disabled={!step2Valid}
              onClick={() => {
                if (planSeleccionado?.enterprise) {
                  const num = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '';
                  window.open(
                    `https://wa.me/${num}?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20Plan%20Enterprise%20de%20Citaloapp`,
                    '_blank'
                  );
                } else {
                  goToStep(3, { planSeleccionado });
                }
              }}
            >
              {planSeleccionado?.enterprise ? 'Consultar por WhatsApp' : 'Ver resumen y pagar'}
            </button>
          </div>
        )}

        {/* ── PASO 3: Resumen + pago ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => goToStep(2)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Revisá tu solicitud</h1>
                <p className="text-gray-500 text-sm">Confirmá que todo esté bien antes de pagar.</p>
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
              {slugDeseado && (
                <SummaryRow label="Link deseado" value={`citaloapp.com.ar/${slugDeseado}`} />
              )}
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

            {/* Plan seleccionado */}
            {planSeleccionado && (
              <div className="bg-[#0ea5e9] rounded-2xl px-5 py-4 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs text-sky-100">Plan seleccionado</p>
                  <p className="font-bold text-lg">{planSeleccionado.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold">{planSeleccionado.price}</p>
                  <p className="text-xs text-sky-100">/mes</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              className="w-full h-12 rounded-2xl font-semibold text-white text-base bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={paying}
              onClick={handlePagar}
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirigiendo a MercadoPago...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Confirmar y pagar con MercadoPago
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Serás redirigido al checkout seguro de MercadoPago para completar el pago.
            </p>
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

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  function handleSelect(option) { onChange(option); setQuery(''); setOpen(false); }

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
          <button type="button" onPointerDown={e => { e.preventDefault(); onChange(''); setQuery(''); }}
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
              <li key={option} onPointerDown={e => { e.preventDefault(); handleSelect(option); }}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-[#0ea5e9] cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
        {open && query && filtered.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
            Sin resultados para &quot;{query}&quot;
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

  const filtered = options.filter(o => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  function toggle(option) {
    onChange(selected.includes(option) ? selected.filter(s => s !== option) : [...selected, option]);
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
              <button type="button" onPointerDown={e => { e.preventDefault(); onChange(selected.filter(s => s !== os)); }} className="text-sky-400 hover:text-sky-700 transition-colors">
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
              <li key={option} onPointerDown={e => { e.preventDefault(); toggle(option); }}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-[#0ea5e9] cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </li>
            )) : (
              <li className="px-4 py-3 text-sm text-gray-400">Sin resultados para &quot;{query}&quot;</li>
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
