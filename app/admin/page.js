'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SESSION_KEY = 'citalo_admin_pw';

const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const HORAS_ATENCION = Array.from({ length: 33 }, (_, i) => {
  const mins = 360 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
});

const EMPTY_PRO = {
  slug: '', nombre: '', especialidad: '', matricula: '',
  foto_url: '', descripcion: '', telefono_whatsapp: '',
  calendar_id: '', color_marca: '#2563eb',
  obras_sociales: '', duracion_turno_minutos: '30',
  dias_atencion: '', horario_inicio: '09:00', horario_fin: '18:00',
};

const EMPTY_SERV = {
  nombre: '', duracion_minutos: '30', precio: '', descripcion: '', activo: 'true',
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('turnos');

  // Profesionales
  const [profesionales, setProfesionales] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [newPro, setNewPro] = useState(EMPTY_PRO);
  const [editingPro, setEditingPro] = useState(null);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');

  // Turnos
  const [turnos, setTurnos] = useState([]);
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  // Servicios
  const [servicios, setServicios] = useState([]);
  const [selectedSlugServ, setSelectedSlugServ] = useState('');
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [showAddServForm, setShowAddServForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [savingServ, setSavingServ] = useState(false);
  const [servMsg, setServMsg] = useState('');
  const [newServ, setNewServ] = useState(EMPTY_SERV);

  // Pacientes
  const [pacientes, setPacientes] = useState([]);
  const [selectedSlugPac, setSelectedSlugPac] = useState('');
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [pacienteExpandido, setPacienteExpandido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);

  const storedPw = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null;

  useEffect(() => {
    if (storedPw) setAuthenticated(true);
  }, [storedPw]);

  const headers = useCallback(() => {
    const pw = sessionStorage.getItem(SESSION_KEY) || '';
    return { 'Content-Type': 'application/json', 'x-admin-password': pw };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password);
        setAuthenticated(true);
      } else {
        setLoginError('Contraseña incorrecta');
      }
    } catch {
      setLoginError('Error de conexión');
    } finally {
      setLoggingIn(false);
    }
  }

  const loadProfesionales = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/profesionales', { headers: headers() });
      const data = await res.json();
      if (data.profesionales) {
        setProfesionales(data.profesionales);
        if (!selectedSlug && data.profesionales.length > 0) {
          setSelectedSlug(data.profesionales[0].slug);
        }
      }
    } catch {}
  }, [headers, selectedSlug]);

  useEffect(() => {
    if (authenticated) loadProfesionales();
  }, [authenticated, loadProfesionales]);

  // Inicializar slug de servicios cuando cargan profesionales
  useEffect(() => {
    if (profesionales.length > 0 && !selectedSlugServ) {
      setSelectedSlugServ(profesionales[0].slug);
    }
  }, [profesionales, selectedSlugServ]);

  // Inicializar slug de pacientes cuando cargan profesionales
  useEffect(() => {
    if (profesionales.length > 0 && !selectedSlugPac) {
      setSelectedSlugPac(profesionales[0].slug);
    }
  }, [profesionales, selectedSlugPac]);

  const loadTurnos = useCallback(async () => {
    if (!selectedSlug) return;
    setLoadingTurnos(true);
    try {
      const res = await fetch(
        `/api/admin/turnos?slug=${selectedSlug}&fecha=${fecha}`,
        { headers: headers() }
      );
      const data = await res.json();
      setTurnos(data.turnos || []);
    } catch {
      setTurnos([]);
    } finally {
      setLoadingTurnos(false);
    }
  }, [selectedSlug, fecha, headers]);

  useEffect(() => {
    if (authenticated && selectedSlug) loadTurnos();
  }, [authenticated, selectedSlug, fecha, loadTurnos]);

  const loadServicios = useCallback(async (slug) => {
    if (!slug) return;
    setLoadingServicios(true);
    try {
      const res = await fetch(`/api/servicios?slug=${slug}`);
      const data = await res.json();
      setServicios(data.servicios || []);
    } catch {
      setServicios([]);
    } finally {
      setLoadingServicios(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated && activeTab === 'servicios' && selectedSlugServ) {
      loadServicios(selectedSlugServ);
    }
  }, [authenticated, activeTab, selectedSlugServ, loadServicios]);

  const loadPacientes = useCallback(async (slug) => {
    if (!slug) return;
    setLoadingPacientes(true);
    try {
      const res = await fetch(`/api/admin/pacientes?slug=${slug}`, { headers: headers() });
      const data = await res.json();
      setPacientes(data.pacientes || []);
    } catch {
      setPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  }, [headers]);

  useEffect(() => {
    if (authenticated && activeTab === 'pacientes' && selectedSlugPac) {
      loadPacientes(selectedSlugPac);
    }
  }, [authenticated, activeTab, selectedSlugPac, loadPacientes]);

  async function handleExpandirPaciente(telefono) {
    if (pacienteExpandido === telefono) {
      setPacienteExpandido(null);
      return;
    }
    setPacienteExpandido(telefono);
    setLoadingHistorial(true);
    try {
      const res = await fetch(
        `/api/admin/historial?slug=${selectedSlugPac}&telefono=${encodeURIComponent(telefono)}`,
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
      const res = await fetch('/api/admin/historial', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          profesional_slug: selectedSlugPac,
          paciente_telefono: paciente.paciente_telefono,
          paciente_nombre: paciente.paciente_nombre,
          nota: nuevaNota.trim(),
        }),
      });
      if (res.ok) {
        setNuevaNota('');
        const res2 = await fetch(
          `/api/admin/historial?slug=${selectedSlugPac}&telefono=${encodeURIComponent(paciente.paciente_telefono)}`,
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

  // ── Handlers profesionales ──────────────────────────────────────────────

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleEditPhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  }

  function handleEditClick(pro) {
    setEditingPro({
      ...pro,
      obras_sociales: Array.isArray(pro.obras_sociales)
        ? pro.obras_sociales.join(', ')
        : pro.obras_sociales,
      duracion_turno_minutos: String(pro.duracion_turno_minutos),
      dias_atencion: pro.dias_atencion || '',
      horario_inicio: pro.horario_inicio || '09:00',
      horario_fin: pro.horario_fin || '18:00',
    });
    setEditPhotoFile(null);
    setEditPhotoPreview('');
    setSaveMsg('');
    setShowAddForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCancelTurno(turnoId, pacienteNombre) {
    if (!confirm(`¿Cancelar el turno de "${pacienteNombre}"?`)) return;
    try {
      const res = await fetch(`/api/turnos/${turnoId}?cancelado_por=profesional`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) {
        loadTurnos();
      } else {
        const d = await res.json();
        alert(d.error || 'Error al cancelar');
      }
    } catch {
      alert('Error de conexión');
    }
  }

  async function handleDeletePro(slug, nombre) {
    if (!confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch('/api/admin/profesionales', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        setSaveMsg('Profesional eliminado');
        loadProfesionales();
      } else {
        const d = await res.json();
        setSaveMsg(d.error || 'Error al eliminar');
      }
    } catch {
      setSaveMsg('Error de conexión');
    }
  }

  async function handleSavePro(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    let fotoUrl = newPro.foto_url;
    if (photoFile) {
      try {
        const fd = new FormData();
        fd.append('file', photoFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Error al subir foto');
        fotoUrl = upData.url;
      } catch (err) {
        setSaveMsg(err.message);
        setSaving(false);
        return;
      }
    }
    try {
      const res = await fetch('/api/admin/profesionales', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ...newPro, foto_url: fotoUrl }),
      });
      if (res.ok) {
        setSaveMsg('Profesional agregado correctamente');
        setShowAddForm(false);
        setNewPro(EMPTY_PRO);
        setPhotoFile(null);
        setPhotoPreview('');
        loadProfesionales();
      } else {
        const d = await res.json();
        setSaveMsg(d.error || 'Error al guardar');
      }
    } catch {
      setSaveMsg('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePro(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    let fotoUrl = editingPro.foto_url;
    if (editPhotoFile) {
      try {
        const fd = new FormData();
        fd.append('file', editPhotoFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Error al subir foto');
        fotoUrl = upData.url;
      } catch (err) {
        setSaveMsg(err.message);
        setSaving(false);
        return;
      }
    }
    try {
      const res = await fetch('/api/admin/profesionales', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ ...editingPro, foto_url: fotoUrl }),
      });
      if (res.ok) {
        setSaveMsg('Profesional actualizado correctamente');
        setEditingPro(null);
        setEditPhotoFile(null);
        setEditPhotoPreview('');
        loadProfesionales();
      } else {
        const d = await res.json();
        setSaveMsg(d.error || 'Error al actualizar');
      }
    } catch {
      setSaveMsg('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  // ── Handlers servicios ──────────────────────────────────────────────────

  async function handleSaveServicio(e) {
    e.preventDefault();
    setSavingServ(true);
    setServMsg('');
    try {
      const res = await fetch('/api/admin/servicios', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ...newServ, profesional_slug: selectedSlugServ }),
      });
      if (res.ok) {
        setServMsg('Servicio agregado correctamente');
        setShowAddServForm(false);
        setNewServ(EMPTY_SERV);
        loadServicios(selectedSlugServ);
      } else {
        const d = await res.json();
        setServMsg(d.error || 'Error al guardar');
      }
    } catch {
      setServMsg('Error de conexión');
    } finally {
      setSavingServ(false);
    }
  }

  async function handleUpdateServicio(e) {
    e.preventDefault();
    setSavingServ(true);
    setServMsg('');
    try {
      const res = await fetch(`/api/admin/servicios/${editingServicio.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(editingServicio),
      });
      if (res.ok) {
        setServMsg('Servicio actualizado correctamente');
        setEditingServicio(null);
        loadServicios(selectedSlugServ);
      } else {
        const d = await res.json();
        setServMsg(d.error || 'Error al actualizar');
      }
    } catch {
      setServMsg('Error de conexión');
    } finally {
      setSavingServ(false);
    }
  }

  async function handleDeleteServicio(id, nombre) {
    if (!confirm(`¿Eliminar el servicio "${nombre}"?`)) return;
    try {
      const res = await fetch(`/api/admin/servicios/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) {
        setServMsg('Servicio eliminado');
        loadServicios(selectedSlugServ);
      } else {
        const d = await res.json();
        setServMsg(d.error || 'Error al eliminar');
      }
    } catch {
      setServMsg('Error de conexión');
    }
  }

  // ── Login screen ────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-sm text-gray-500 mt-1">Citalo</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="pw">Contraseña</Label>
                  <Input id="pw" type="password" placeholder="Contraseña de administrador" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                </div>
                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={loggingIn || !password}>
                  {loggingIn ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ── Admin panel ─────────────────────────────────────────────────────────

  const TABS = [
    { key: 'turnos',         label: 'Turnos del día' },
    { key: 'profesionales',  label: 'Profesionales'  },
    { key: 'servicios',      label: 'Servicios'       },
    { key: 'pacientes',      label: 'Pacientes'       },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority />
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthenticated(false); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
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

        {/* ── Tab: Turnos ── */}
        {activeTab === 'turnos' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label>Profesional</Label>
                <Select value={selectedSlug} onChange={e => setSelectedSlug(e.target.value)} className="w-56">
                  {profesionales.map(p => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
                </Select>
              </div>
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
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={t.estado === 'confirmado' ? 'success' : 'secondary'}>{t.estado}</Badge>
                          {t.estado === 'confirmado' && (
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-300" onClick={() => handleCancelTurno(t.id, t.paciente_nombre)}>
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Profesionales ── */}
        {activeTab === 'profesionales' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''}
              </h2>
              <Button onClick={() => { setShowAddForm(!showAddForm); setEditingPro(null); }}>
                {showAddForm ? 'Cancelar' : '+ Agregar profesional'}
              </Button>
            </div>

            {saveMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${
                saveMsg.includes('correctamente') || saveMsg.includes('eliminado')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>{saveMsg}</div>
            )}

            {editingPro && (
              <Card>
                <CardHeader><CardTitle>Editar profesional — {editingPro.nombre}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePro} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Slug"><Input value={editingPro.slug} disabled className="bg-gray-50 text-gray-400" /></FormField>
                    <FormField label="Nombre completo *"><Input value={editingPro.nombre} onChange={e => setEditingPro(p => ({ ...p, nombre: e.target.value }))} required /></FormField>
                    <FormField label="Especialidad *"><Input value={editingPro.especialidad} onChange={e => setEditingPro(p => ({ ...p, especialidad: e.target.value }))} required /></FormField>
                    <FormField label="Matrícula"><Input value={editingPro.matricula} onChange={e => setEditingPro(p => ({ ...p, matricula: e.target.value }))} /></FormField>
                    <FormField label="Foto de perfil">
                      <div className="space-y-2">
                        {(editPhotoPreview || editingPro.foto_url) && (
                          <img src={editPhotoPreview || editingPro.foto_url} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        )}
                        <Input type="file" accept="image/*" onChange={handleEditPhotoChange} className="cursor-pointer" />
                        {editPhotoFile && <p className="text-xs text-gray-400">{editPhotoFile.name}</p>}
                      </div>
                    </FormField>
                    <FormField label="WhatsApp"><Input value={editingPro.telefono_whatsapp} onChange={e => setEditingPro(p => ({ ...p, telefono_whatsapp: e.target.value }))} /></FormField>
                    <FormField label="Google Calendar ID"><Input value={editingPro.calendar_id} onChange={e => setEditingPro(p => ({ ...p, calendar_id: e.target.value }))} /></FormField>
                    <FormField label="Color de marca">
                      <div className="flex gap-2 items-center">
                        <input type="color" value={editingPro.color_marca} onChange={e => setEditingPro(p => ({ ...p, color_marca: e.target.value }))} className="h-10 w-12 rounded-lg border border-gray-300 cursor-pointer" />
                        <Input value={editingPro.color_marca} onChange={e => setEditingPro(p => ({ ...p, color_marca: e.target.value }))} className="flex-1" />
                      </div>
                    </FormField>
                    <FormField label="Duración turno (min)">
                      <Select value={editingPro.duracion_turno_minutos} onChange={e => setEditingPro(p => ({ ...p, duracion_turno_minutos: e.target.value }))}>
                        {[15, 20, 30, 45, 60].map(v => <option key={v} value={String(v)}>{v} min</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Obras sociales (separadas por coma)"><Input value={editingPro.obras_sociales} onChange={e => setEditingPro(p => ({ ...p, obras_sociales: e.target.value }))} /></FormField>
                    <FormField label="Estado">
                      <Select value={editingPro.activo} onChange={e => setEditingPro(p => ({ ...p, activo: e.target.value }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <Label>Días de atención</Label>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {DIAS_SEMANA.map(({ value, label }) => {
                          const lista = (editingPro.dias_atencion || '').split(',').map(d => d.trim()).filter(Boolean);
                          const checked = lista.includes(value);
                          return (
                            <label key={value} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? lista.filter(d => d !== value) : [...lista, value];
                                  setEditingPro(p => ({ ...p, dias_atencion: next.join(',') }));
                                }}
                                className="rounded"
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <FormField label="Horario de inicio">
                      <Select value={editingPro.horario_inicio} onChange={e => setEditingPro(p => ({ ...p, horario_inicio: e.target.value }))}>
                        {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Horario de fin">
                      <Select value={editingPro.horario_fin} onChange={e => setEditingPro(p => ({ ...p, horario_fin: e.target.value }))}>
                        {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción / Bio"><Textarea value={editingPro.descripcion} onChange={e => setEditingPro(p => ({ ...p, descripcion: e.target.value }))} /></FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditingPro(null)}>Cancelar</Button>
                      <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {showAddForm && (
              <Card>
                <CardHeader><CardTitle>Nuevo profesional</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePro} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Slug *"><Input placeholder="dra-garcia" value={newPro.slug} onChange={e => setNewPro(p => ({ ...p, slug: e.target.value }))} required /></FormField>
                    <FormField label="Nombre completo *"><Input placeholder="Dra. Ana García" value={newPro.nombre} onChange={e => setNewPro(p => ({ ...p, nombre: e.target.value }))} required /></FormField>
                    <FormField label="Especialidad *"><Input placeholder="Cardiología" value={newPro.especialidad} onChange={e => setNewPro(p => ({ ...p, especialidad: e.target.value }))} required /></FormField>
                    <FormField label="Matrícula"><Input placeholder="12345" value={newPro.matricula} onChange={e => setNewPro(p => ({ ...p, matricula: e.target.value }))} /></FormField>
                    <FormField label="Foto de perfil">
                      <div className="space-y-2">
                        {(photoPreview || newPro.foto_url) && (
                          <img src={photoPreview || newPro.foto_url} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        )}
                        <Input type="file" accept="image/*" onChange={handlePhotoChange} className="cursor-pointer" />
                        {photoFile && <p className="text-xs text-gray-400">{photoFile.name}</p>}
                      </div>
                    </FormField>
                    <FormField label="WhatsApp"><Input placeholder="5491123456789" value={newPro.telefono_whatsapp} onChange={e => setNewPro(p => ({ ...p, telefono_whatsapp: e.target.value }))} /></FormField>
                    <FormField label="Google Calendar ID"><Input placeholder="email@group.calendar.google.com" value={newPro.calendar_id} onChange={e => setNewPro(p => ({ ...p, calendar_id: e.target.value }))} /></FormField>
                    <FormField label="Color de marca">
                      <div className="flex gap-2 items-center">
                        <input type="color" value={newPro.color_marca} onChange={e => setNewPro(p => ({ ...p, color_marca: e.target.value }))} className="h-10 w-12 rounded-lg border border-gray-300 cursor-pointer" />
                        <Input value={newPro.color_marca} onChange={e => setNewPro(p => ({ ...p, color_marca: e.target.value }))} className="flex-1" />
                      </div>
                    </FormField>
                    <FormField label="Duración turno (min)">
                      <Select value={newPro.duracion_turno_minutos} onChange={e => setNewPro(p => ({ ...p, duracion_turno_minutos: e.target.value }))}>
                        {[15, 20, 30, 45, 60].map(v => <option key={v} value={String(v)}>{v} min</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Obras sociales (separadas por coma)"><Input placeholder="OSDE, Swiss Medical, PAMI" value={newPro.obras_sociales} onChange={e => setNewPro(p => ({ ...p, obras_sociales: e.target.value }))} /></FormField>
                    <div className="sm:col-span-2">
                      <Label>Días de atención</Label>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {DIAS_SEMANA.map(({ value, label }) => {
                          const lista = (newPro.dias_atencion || '').split(',').map(d => d.trim()).filter(Boolean);
                          const checked = lista.includes(value);
                          return (
                            <label key={value} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? lista.filter(d => d !== value) : [...lista, value];
                                  setNewPro(p => ({ ...p, dias_atencion: next.join(',') }));
                                }}
                                className="rounded"
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <FormField label="Horario de inicio">
                      <Select value={newPro.horario_inicio} onChange={e => setNewPro(p => ({ ...p, horario_inicio: e.target.value }))}>
                        {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Horario de fin">
                      <Select value={newPro.horario_fin} onChange={e => setNewPro(p => ({ ...p, horario_fin: e.target.value }))}>
                        {HORAS_ATENCION.map(h => <option key={h} value={h}>{h}</option>)}
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción / Bio"><Textarea placeholder="Breve descripción del profesional..." value={newPro.descripcion} onChange={e => setNewPro(p => ({ ...p, descripcion: e.target.value }))} /></FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
                      <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar profesional'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {profesionales.map(p => (
                <Card key={p.slug}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.foto_url ? (
                        <img src={p.foto_url} alt={p.nombre} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: p.color_marca || '#2563eb' }}>
                          {p.nombre?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.especialidad}</p>
                        <p className="text-xs text-gray-400">/{p.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={p.activo === 'true' ? 'success' : 'secondary'}>{p.activo === 'true' ? 'Activo' : 'Inactivo'}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>Editar</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-300" onClick={() => handleDeletePro(p.slug, p.nombre)}>Eliminar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Servicios ── */}
        {activeTab === 'servicios' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end justify-between">
              <div>
                <Label>Profesional</Label>
                <Select
                  value={selectedSlugServ}
                  onChange={e => {
                    setSelectedSlugServ(e.target.value);
                    setEditingServicio(null);
                    setShowAddServForm(false);
                    setServMsg('');
                  }}
                  className="w-56"
                >
                  {profesionales.map(p => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
                </Select>
              </div>
              <Button onClick={() => { setShowAddServForm(!showAddServForm); setEditingServicio(null); setServMsg(''); }}>
                {showAddServForm ? 'Cancelar' : '+ Agregar servicio'}
              </Button>
            </div>

            {servMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${
                servMsg.includes('correctamente') || servMsg.includes('eliminado')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>{servMsg}</div>
            )}

            {/* Formulario agregar */}
            {showAddServForm && (
              <Card>
                <CardHeader><CardTitle>Nuevo servicio</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveServicio} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nombre del servicio *">
                      <Input placeholder="Ej: Consulta general" value={newServ.nombre} onChange={e => setNewServ(p => ({ ...p, nombre: e.target.value }))} required />
                    </FormField>
                    <FormField label="Duración (min)">
                      <Select value={newServ.duracion_minutos} onChange={e => setNewServ(p => ({ ...p, duracion_minutos: e.target.value }))}>
                        {[15, 20, 30, 45, 60, 90, 120].map(v => <option key={v} value={String(v)}>{v} min</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Precio (opcional)">
                      <Input placeholder="Ej: 15000" value={newServ.precio} onChange={e => setNewServ(p => ({ ...p, precio: e.target.value }))} />
                    </FormField>
                    <FormField label="Estado">
                      <Select value={newServ.activo} onChange={e => setNewServ(p => ({ ...p, activo: e.target.value }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción (opcional)">
                        <Textarea placeholder="Descripción breve del servicio..." value={newServ.descripcion} onChange={e => setNewServ(p => ({ ...p, descripcion: e.target.value }))} />
                      </FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddServForm(false)}>Cancelar</Button>
                      <Button type="submit" disabled={savingServ}>{savingServ ? 'Guardando...' : 'Guardar servicio'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Formulario editar */}
            {editingServicio && (
              <Card>
                <CardHeader><CardTitle>Editar servicio — {editingServicio.nombre}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateServicio} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nombre del servicio *">
                      <Input value={editingServicio.nombre} onChange={e => setEditingServicio(p => ({ ...p, nombre: e.target.value }))} required />
                    </FormField>
                    <FormField label="Duración (min)">
                      <Select value={editingServicio.duracion_minutos} onChange={e => setEditingServicio(p => ({ ...p, duracion_minutos: e.target.value }))}>
                        {[15, 20, 30, 45, 60, 90, 120].map(v => <option key={v} value={String(v)}>{v} min</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Precio (opcional)">
                      <Input value={editingServicio.precio} onChange={e => setEditingServicio(p => ({ ...p, precio: e.target.value }))} />
                    </FormField>
                    <FormField label="Estado">
                      <Select value={editingServicio.activo} onChange={e => setEditingServicio(p => ({ ...p, activo: e.target.value }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción (opcional)">
                        <Textarea value={editingServicio.descripcion} onChange={e => setEditingServicio(p => ({ ...p, descripcion: e.target.value }))} />
                      </FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditingServicio(null)}>Cancelar</Button>
                      <Button type="submit" disabled={savingServ}>{savingServ ? 'Guardando...' : 'Guardar cambios'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de servicios */}
            {loadingServicios ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : servicios.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-gray-400">
                  No hay servicios para este profesional
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {servicios.map(s => (
                  <Card key={s.id}>
                    <CardContent className="py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm">{s.nombre}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">⏱ {s.duracion_minutos} min</span>
                          {s.precio && <span className="text-xs text-gray-600 font-medium">$ {Number(s.precio).toLocaleString('es-AR')}</span>}
                          {s.descripcion && <span className="text-xs text-gray-400 truncate max-w-xs">{s.descripcion}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={s.activo !== 'false' ? 'success' : 'secondary'}>
                          {s.activo !== 'false' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => { setEditingServicio(s); setShowAddServForm(false); setServMsg(''); }}>
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-300" onClick={() => handleDeleteServicio(s.id, s.nombre)}>
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Pacientes ── */}
        {activeTab === 'pacientes' && (
          <div className="space-y-4">
            <div>
              <Label>Profesional</Label>
              <Select
                value={selectedSlugPac}
                onChange={e => {
                  setSelectedSlugPac(e.target.value);
                  setPacienteExpandido(null);
                }}
                className="w-56"
              >
                {profesionales.map(p => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
              </Select>
            </div>

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

function FormField({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
