'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPicker } from './CalendarPicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

const STEPS = ['Fecha y hora', 'Tus datos', 'Confirmar'];

export function BookingWizard({ profesional }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    obra_social: '',
    motivo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const accentColor = profesional.color_marca || '#2563eb';

  async function handleDateSelect(date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setAvailableSlots([]);
    setLoadingSlots(true);

    try {
      const fecha = format(date, 'yyyy-MM-dd');
      const res = await fetch(
        `/api/slots?calendarId=${encodeURIComponent(profesional.calendar_id)}&fecha=${fecha}&duracion=${profesional.duracion_turno_minutos}`
      );
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleFieldChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const step1Valid = selectedDate && selectedTime;
  const step2Valid = formData.nombre.trim() && formData.telefono.trim();

  async function handleConfirm() {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profesional_slug: profesional.slug,
          profesional_nombre: profesional.nombre,
          profesional_whatsapp: profesional.telefono_whatsapp,
          profesional_calendar_id: profesional.calendar_id,
          duracion_turno_minutos: profesional.duracion_turno_minutos,
          paciente_nombre: formData.nombre,
          paciente_telefono: formData.telefono,
          paciente_email: formData.email,
          obra_social: formData.obra_social,
          motivo: formData.motivo,
          fecha: format(selectedDate, 'yyyy-MM-dd'),
          hora: selectedTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al confirmar el turno');
      }

      const params = new URLSearchParams({
        nombre: formData.nombre,
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        hora: selectedTime,
        profesional: profesional.nombre,
        especialidad: profesional.especialidad,
      });
      router.push(`/${profesional.slug}/turno/confirmado?${params.toString()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fechaFormateada = selectedDate
    ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
    : '';

  return (
    <div className="max-w-lg mx-auto px-4 pb-16">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 py-6">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={num} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    done && 'bg-green-500 text-white',
                    active && 'text-white',
                    !active && !done && 'bg-gray-200 text-gray-400'
                  )}
                  style={active ? { backgroundColor: accentColor } : {}}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
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

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Elegí fecha y hora</h2>
          <CalendarPicker onDateSelect={handleDateSelect} selectedDate={selectedDate} />

          {selectedDate && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3 capitalize">{fechaFormateada}</p>
              {loadingSlots ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay turnos disponibles para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                        selectedTime === slot
                          ? 'text-white border-transparent shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 bg-white'
                      )}
                      style={selectedTime === slot ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full"
            disabled={!step1Valid}
            onClick={() => setStep(2)}
            style={step1Valid ? { backgroundColor: accentColor } : {}}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Step 2: Patient data */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">Tus datos</h2>
          </div>

          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700 capitalize">
            📅 {fechaFormateada} a las {selectedTime}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: María García"
                value={formData.nombre}
                onChange={e => handleFieldChange('nombre', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="telefono">WhatsApp *</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="Ej: 1123456789"
                value={formData.telefono}
                onChange={e => handleFieldChange('telefono', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={e => handleFieldChange('email', e.target.value)}
              />
            </div>
            {profesional.obras_sociales?.length > 0 && (
              <div>
                <Label htmlFor="obra_social">Obra social</Label>
                <Select
                  id="obra_social"
                  value={formData.obra_social}
                  onChange={e => handleFieldChange('obra_social', e.target.value)}
                >
                  <option value="">Sin obra social / Particular</option>
                  {profesional.obras_sociales.map(os => (
                    <option key={os} value={os}>{os}</option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="motivo">Motivo de consulta (opcional)</Label>
              <Textarea
                id="motivo"
                placeholder="Describí brevemente tu consulta..."
                value={formData.motivo}
                onChange={e => handleFieldChange('motivo', e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!step2Valid}
            onClick={() => setStep(3)}
            style={step2Valid ? { backgroundColor: accentColor } : {}}
          >
            Ver resumen
          </Button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">Confirmá tu turno</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            <SummaryRow label="Profesional" value={profesional.nombre} />
            <SummaryRow label="Especialidad" value={profesional.especialidad} />
            <SummaryRow label="Fecha" value={<span className="capitalize">{fechaFormateada}</span>} />
            <SummaryRow label="Hora" value={selectedTime} />
            <SummaryRow label="Paciente" value={formData.nombre} />
            <SummaryRow label="WhatsApp" value={formData.telefono} />
            {formData.email && <SummaryRow label="Email" value={formData.email} />}
            {formData.obra_social && <SummaryRow label="Obra social" value={formData.obra_social} />}
            {formData.motivo && <SummaryRow label="Motivo" value={formData.motivo} />}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            className="w-full h-12 text-base"
            disabled={submitting}
            onClick={handleConfirm}
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando...
              </span>
            ) : 'Confirmar turno'}
          </Button>
        </div>
      )}
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
