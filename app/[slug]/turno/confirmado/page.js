import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Turno confirmado — Citalo' };

export default function ConfirmadoPage({ params, searchParams }) {
  const { nombre, fecha, hora, profesional, especialidad } = searchParams;

  const fechaDate = fecha ? parseISO(fecha) : null;
  const fechaFormateada = fechaDate
    ? format(fechaDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
    : fecha;

  const gcalUrl = fechaDate && hora
    ? (() => {
        const [h, m] = hora.split(':').map(Number);
        const start = new Date(fechaDate);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const title = encodeURIComponent(`Turno con ${profesional}`);
        const details = encodeURIComponent(`Turno médico — ${especialidad}`);
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
      })()
    : null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Turno confirmado!</h1>
          {nombre && (
            <p className="text-gray-500 mt-1">Te esperamos, {nombre}.</p>
          )}
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left divide-y divide-gray-100">
          {profesional && (
            <div className="flex justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-gray-500">Profesional</span>
              <span className="text-sm font-medium text-gray-900">{profesional}</span>
            </div>
          )}
          {especialidad && (
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Especialidad</span>
              <span className="text-sm font-medium text-gray-900">{especialidad}</span>
            </div>
          )}
          {fechaFormateada && (
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-500">Fecha</span>
              <span className="text-sm font-medium text-gray-900 capitalize text-right max-w-[60%]">{fechaFormateada}</span>
            </div>
          )}
          {hora && (
            <div className="flex justify-between py-3 last:pb-0">
              <span className="text-sm text-gray-500">Hora</span>
              <span className="text-sm font-medium text-gray-900">{hora}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {gcalUrl && (
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar en Google Calendar
            </a>
          )}
          <Link
            href={`/${params.slug}`}
            className="flex items-center justify-center w-full h-11 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Recibirás un mensaje de WhatsApp con el recordatorio.
        </p>
      </div>
      </div>
    </main>
  );
}
