import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfesional } from '@/lib/sheets';
import { BookingWizard } from '@/components/BookingWizard';
import Navbar from '@/components/Navbar';

export async function generateMetadata({ params }) {
  const profesional = await getProfesional(params.slug);
  if (!profesional) return { title: 'No encontrado' };
  return { title: `Sacar turno — ${profesional.nombre}` };
}

export default async function TurnoPage({ params }) {
  const profesional = await getProfesional(params.slug);
  if (!profesional) notFound();

  const color = profesional.color_marca || '#2563eb';

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Mini header */}
      <div className="text-white py-4 px-4" style={{ backgroundColor: color }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href={`/${params.slug}`}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="font-semibold text-sm">{profesional.nombre}</p>
            <p className="text-white/80 text-xs">{profesional.especialidad}</p>
          </div>
        </div>
      </div>

      <BookingWizard profesional={profesional} />
    </main>
  );
}
