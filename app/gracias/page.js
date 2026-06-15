import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Citalo — ¡Ya estás dentro!',
};

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4">
        <div className="max-w-6xl mx-auto h-16 flex items-center">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            ¡Ya estás dentro! 🎉
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-10">
            Tus 14 días gratis ya arrancaron. En las próximas 72hs te configuramos todo y te mandamos tu link por WhatsApp.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#0284c7] transition-colors shadow-lg shadow-sky-200 text-base"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
