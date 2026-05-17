'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
        <p className="text-gray-500 text-sm mb-4">{error?.message || 'Error inesperado'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl text-sm font-medium hover:bg-[#0284c7]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
