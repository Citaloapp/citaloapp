'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatFecha(fecha) {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CancelarPage({ params }) {
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [cancelado, setCancelado] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetch(`/api/turnos/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTurno(data.turno);
      })
      .catch(() => setError('No se pudo cargar la información del turno'))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleCancelar() {
    setCancelando(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/turnos/${params.id}?cancelado_por=paciente`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setCancelado(true);
      } else {
        setCancelError(data.error || 'No se pudo cancelar el turno');
      }
    } catch {
      setCancelError('Error de conexión');
    } finally {
      setCancelando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Cancelar turno</h1>
          <p className="text-sm text-gray-500 mt-1">Citalo</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {error}
            </CardContent>
          </Card>
        )}

        {cancelado && (
          <Card>
            <CardContent className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">Turno cancelado</p>
              <p className="text-sm text-gray-500">Tu turno fue cancelado correctamente. El profesional fue notificado.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && !cancelado && turno && (
          <>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Profesional</span>
                    <span className="font-medium text-gray-900 text-right">{turno.profesional_nombre}</span>
                  </div>
                  {turno.profesional_especialidad && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Especialidad</span>
                      <span className="text-gray-700">{turno.profesional_especialidad}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paciente</span>
                    <span className="font-medium text-gray-900">{turno.paciente_nombre}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-medium text-gray-900 capitalize">{formatFecha(turno.fecha)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hora</span>
                    <span className="font-medium text-gray-900">{turno.hora}</span>
                  </div>
                  {turno.obra_social && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Obra social</span>
                      <span className="text-gray-700">{turno.obra_social}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {turno.estado === 'cancelado' ? (
              <Card>
                <CardContent className="py-6 text-center text-gray-500 text-sm">
                  Este turno ya fue cancelado.
                </CardContent>
              </Card>
            ) : turno.puede_cancelar ? (
              <div className="space-y-3">
                {cancelError && (
                  <div className="text-sm px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
                    {cancelError}
                  </div>
                )}
                <p className="text-sm text-gray-500 text-center">
                  Si cancelás, el profesional recibirá una notificación.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelar}
                  disabled={cancelando}
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar turno'}
                </Button>
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center space-y-2">
                  <p className="text-sm font-medium text-gray-700">No es posible cancelar online</p>
                  <p className="text-sm text-gray-500">
                    No es posible cancelar con menos de 24hs de anticipación, contactá al profesional.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
