import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfesional } from '@/lib/sheets';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

export async function generateMetadata({ params }) {
  const profesional = await getProfesional(params.slug);
  if (!profesional) return { title: 'Profesional no encontrado' };
  return {
    title: `${profesional.nombre} — Turnos online`,
    description: profesional.descripcion,
  };
}

export default async function ProfesionalPage({ params }) {
  const profesional = await getProfesional(params.slug);
  if (!profesional) notFound();

  const color = profesional.color_marca || '#2563eb';
  const waNumber = profesional.telefono_whatsapp?.replace(/\D/g, '');
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero */}
      <div className="text-white py-10 px-4" style={{ backgroundColor: color }}>
        <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-4">
          {profesional.foto_url ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
              <Image
                src={profesional.foto_url}
                alt={profesional.nombre}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {profesional.nombre?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profesional.nombre}</h1>
            <p className="text-white/90 font-medium">{profesional.especialidad}</p>
            {profesional.matricula && (
              <p className="text-white/70 text-sm mt-1">Matrícula {profesional.matricula}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Bio */}
        {profesional.descripcion && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-gray-700 text-sm leading-relaxed">{profesional.descripcion}</p>
          </div>
        )}

        {/* Obras sociales */}
        {profesional.obras_sociales?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Obras sociales
            </h2>
            <div className="flex flex-wrap gap-2">
              {profesional.obras_sociales.map(os => (
                <Badge key={os} variant="secondary">{os}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/${params.slug}/turno`}
          className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-white text-base font-semibold shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: color }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Sacar turno
        </Link>

        {/* WhatsApp */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar por WhatsApp
          </a>
        )}

        <p className="text-center text-xs text-gray-400 pt-2">Turnos gestionados por Citalo</p>
      </div>
    </main>
  );
}
