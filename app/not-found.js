import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Página no encontrada — Citalo' };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
            <p className="text-gray-500 mt-2 text-sm">
              El profesional o la página que buscás no existe o no está disponible.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
