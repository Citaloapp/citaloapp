'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CancelarSuscripcion() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuscar(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/mp/buscar-profesional?email=${encodeURIComponent(email)}`);
      if (res.status === 429) {
        setError('Demasiados intentos. Esperá una hora e intentá de nuevo.');
        return;
      }
      const data = await res.json();
      if (!data.found) {
        setStep('notfound');
      } else {
        setProfesional(data);
        setStep('confirm');
      }
    } catch {
      setError('Error al buscar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mp/cancelar-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slug: profesional.slug }),
      });
      if (res.status === 429) {
        setError('Demasiados intentos. Esperá una hora e intentá de nuevo.');
        return;
      }
      if (!res.ok) throw new Error();
      setStep('done');
    } catch {
      setError('Ocurrió un error. Contactanos por WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-white flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4 flex justify-center">
        <a href="/">
          <Image src="/logo.svg" alt="Citalo" width={100} height={26} priority />
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {step === 'email' && (
            <form onSubmit={handleBuscar} className="space-y-5">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900">Cancelar suscripción</h1>
                <p className="text-gray-500 text-sm mt-2">Ingresá el email con el que te registraste.</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 rounded-2xl font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors disabled:opacity-40"
              >
                {loading ? 'Buscando...' : 'Continuar'}
              </button>
              <p className="text-center">
                <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Volver al inicio</a>
              </p>
            </form>
          )}

          {step === 'notfound' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cuenta no encontrada</h2>
                <p className="text-gray-500 text-sm mt-2">No encontramos una cuenta activa con ese email.</p>
              </div>
              <button
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full h-12 rounded-2xl font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
              >
                Intentar con otro email
              </button>
            </div>
          )}

          {step === 'confirm' && profesional && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">¿Confirmás la cancelación?</h2>
                <p className="text-gray-500 text-sm mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Cuenta a cancelar</p>
                <p className="font-semibold text-gray-900">{profesional.nombre}</p>
                <p className="text-sm text-gray-400 mt-0.5">{email}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                Tu página estará activa hasta fin del período pagado.
              </div>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              <button
                onClick={handleCancelar}
                disabled={loading}
                className="w-full h-12 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar mi suscripción'}
              </button>
              <button
                onClick={() => setStep('email')}
                className="w-full h-12 rounded-2xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                No, volver
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Suscripción cancelada</h2>
                <p className="text-gray-500 text-sm mt-2">
                  Tu suscripción fue cancelada. Tu página estará activa hasta fin del período pagado.
                </p>
              </div>
              <a
                href="/"
                className="flex items-center justify-center w-full h-12 rounded-2xl font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
              >
                Volver al inicio
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
