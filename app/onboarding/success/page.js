import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Cuenta activada — Citalo' };

const BASE_URL = 'https://citaloapp.com.ar';

export default function OnboardingSuccessPage({ searchParams }) {
  const solicitudId = searchParams?.solicitud_id || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4 flex justify-center">
        <a href="/">
          <Image src="/logo.svg" alt="Citalo" width={100} height={26} priority />
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">¡Pago confirmado!</h1>
            <p className="text-gray-500 mt-2 leading-relaxed">
              Tu cuenta está siendo activada. En los próximos minutos recibirás un mensaje de WhatsApp con tu link personalizado para empezar a recibir turnos.
            </p>
          </div>

          <div className="bg-sky-50 rounded-2xl px-5 py-4 text-sm text-sky-700 border border-sky-100 text-left space-y-2">
            <p className="font-semibold">Próximos pasos:</p>
            <ul className="space-y-1 list-disc list-inside text-sky-600">
              <li>Te contactaremos por WhatsApp para configurar tu Google Calendar</li>
              <li>Podrás personalizar tu perfil desde el panel de administración</li>
              <li>Tu link será: <span className="font-mono font-medium">{BASE_URL}/tu-slug</span></li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-[#0ea5e9] text-white font-semibold text-sm hover:bg-[#0284c7] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
