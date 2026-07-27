'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SESSION_KEY = 'citalo_prof_session';

export default function ProfesionalPanelPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('turnos');

  // Turnos
  const [turnos, setTurnos] = useState([]);
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  // Pacientes
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [pacienteExpandido, setPacienteExpandido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.push('/profesional/login');
      return;
    }
    try {
      setSession(JSON.parse(raw));
    } catch {
      router.push('/profesional/login');
      return;
    }
    setCheckingSession(false);
  }, [router]);

  const headers = useCallback(() => {
    if (!session) return {};
    return {
      'Content-Type': 'application/json',
      'x-profesional-slug': session.slug,
      'x-profesional-password': session.password,
    };
  }, [session]);

  const loadTurnos = useCallback(async () => {
    if (!session) return;
    setLoadingTurnos(true);
    try {
      const res = await fetch(`/api/profesional/turnos?fecha=${fecha}`, { headers: headers() });
      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        router.push('/profesional/login');
        return;
      }
      const data = await res.json();
      setTurnos(data.turnos || []);
    } catch {
      setTurnos([]);
    } finally {
      setLoadingTurnos(false);
    }
  }, [session, fecha, headers, router]);

  useEffect(() => {
    if (session && activeTab === 'turnos') loadTurnos();
  }, [session, activeTab, fecha, loadTurnos]);

  const loadPacientes = useCallback(async () => {
    if (!session) return;
    setLoadingPacientes(true);
    try {
      const res = await fetch('/api/profesional/pacientes', { headers: headers() });
      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        router.push('/profesional/login');
        return;
      }
      const data = await res.json();
      setPacientes(data.pacientes || []);
    } catch {
      setPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  }, [session, headers, router]);

  useEffect(() => {
    if (session && activeTab === 'pacientes') loadPacientes();
  }, [session, activeTab, loadPacientes]);

  async function handleExpandirPaciente(telefono) {
    if (pacienteExpandido === telefono) {
      setPacienteExpandido(null);
      return;
    }
    setPacienteExpandido(telefono);
    setLoadingHistorial(true);
    try {
      const res = await fetch(
        `/api/profesional/historial?telefono=${encodeURIComponent(telefono)}`,
        { headers: headers() }
      );
      const data = await res.json();
      setHistorial(data.historial || []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }

  async function handleAgregarNota(paciente) {
    if (!nuevaNota.trim()) return;
    setSavingNota(true);
    try {
      const res = await fetch('/api/profesional/historial', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          paciente_telefono: paciente.paciente_telefono,
          paciente_nombre: paciente.paciente_nombre,
          nota: nuevaNota.trim(),
        }),
      });
      if (res.ok) {
        setNuevaNota('');
        const res2 = await fetch(
          `/api/profesional/historial?telefono=${encodeURIComponent(paciente.paciente_telefono)}`,
          { headers: headers() }
        );
        const data2 = await res2.json();
        setHistorial(data2.historial || []);
      } else {
        alert('Error al guardar la nota');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSavingNota(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    router.push('/profesional/login');
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const TABS = [
    { key: 'turnos',    label: 'Mis turnos' },
    { key: 'pacientes', label: 'Mis pacientes' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority />
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Mis turnos ── */}
        {activeTab === 'turnos' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-44" />
              </div>
              <Button variant="outline" onClick={loadTurnos} disabled={loadingTurnos}>Actualizar</Button>
            </div>

            <div className="space-y-2">
              {loadingTurnos ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : turnos.length === 0 ? (
                <Card><CardContent className="text-center py-12 text-gray-400">No hay turnos para este día</CardContent></Card>
              ) : (
                turnos
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(t => (
                    <Card key={t.id}>
                      <CardContent className="py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="text-blue-600 font-bold text-sm w-12 shrink-0 mt-0.5">{t.hora}</div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{t.paciente_nombre}</p>
                            <p className="text-xs text-gray-500">{t.paciente_telefono}</p>
                            {t.obra_social && <p className="text-xs text-gray-500">{t.obra_social}</p>}
                            {t.motivo && <p className="text-xs text-gray-400 mt-1 max-w-xs">{t.motivo}</p>}
                          </div>
                        </div>
                        <Badge variant={t.estado === 'confirmado' ? 'success' : 'secondary'}>{t.estado}</Badge>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Mis pacientes ── */}
        {activeTab === 'pacientes' && (
          <div className="space-y-4">
            {loadingPacientes ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pacientes.length === 0 ? (
              <Card><CardContent className="text-center py-12 text-gray-400">No hay pacientes registrados</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {pacientes.map(p => (
                  <Card key={p.paciente_telefono}>
                    <CardContent className="py-4">
                      <div
                        className="flex items-center justify-between gap-4 cursor-pointer"
                        onClick={() => handleExpandirPaciente(p.paciente_telefono)}
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.paciente_nombre}</p>
                          <p className="text-xs text-gray-500">{p.paciente_telefono}</p>
                          <p className="text-xs text-gray-400">
                            {p.cantidad_turnos} turno{p.cantidad_turnos !== 1 ? 's' : ''} · último: {p.ultimo_turno_fecha}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {pacienteExpandido === p.paciente_telefono ? 'Cerrar' : 'Ver historial'}
                        </Button>
                      </div>

                      {pacienteExpandido === p.paciente_telefono && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                          {loadingHistorial ? (
                            <div className="flex justify-center py-6">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : historial.length === 0 ? (
                            <p className="text-sm text-gray-400">Todavía no hay notas para este paciente.</p>
                          ) : (
                            <div className="space-y-3">
                              {historial.map(h => (
                                <div key={h.id} className="bg-gray-50 rounded-xl px-4 py-3">
                                  <p className="text-xs text-gray-400 mb-1">{h.fecha}</p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{h.nota}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Agregar nota</Label>
                            <Textarea
                              value={nuevaNota}
                              onChange={e => setNuevaNota(e.target.value)}
                              placeholder="Escribí una observación, diagnóstico o nota de consulta..."
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleAgregarNota(p)}
                                disabled={savingNota || !nuevaNota.trim()}
                              >
                                {savingNota ? 'Guardando...' : 'Guardar nota'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
