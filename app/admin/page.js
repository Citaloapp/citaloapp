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

const EMPTY_PRO = {
  slug: '', nombre: '', especialidad: '', matricula: '',
  foto_url: '', descripcion: '', telefono_whatsapp: '',
  calendar_id: '', color_marca: '#2563eb',
  obras_sociales: '', duracion_turno_minutos: '30',
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('turnos');
  const [profesionales, setProfesionales] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [turnos, setTurnos] = useState([]);
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [newPro, setNewPro] = useState(EMPTY_PRO);

  // Edit state
  const [editingPro, setEditingPro] = useState(null);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');

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
                  <Input
                    id="pw"
                    type="password"
                    placeholder="Contraseña de administrador"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                  />
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
          {['turnos', 'profesionales'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'turnos' ? 'Turnos del día' : 'Profesionales'}
            </button>
          ))}
        </div>

        {/* Turnos tab */}
        {activeTab === 'turnos' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label>Profesional</Label>
                <Select
                  value={selectedSlug}
                  onChange={e => setSelectedSlug(e.target.value)}
                  className="w-56"
                >
                  {profesionales.map(p => (
                    <option key={p.slug} value={p.slug}>{p.nombre}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-44"
                />
              </div>
              <Button variant="outline" onClick={loadTurnos} disabled={loadingTurnos}>
                Actualizar
              </Button>
            </div>

            <div className="space-y-2">
              {loadingTurnos ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : turnos.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-gray-400">
                    No hay turnos para este día
                  </CardContent>
                </Card>
              ) : (
                turnos
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(t => (
                    <Card key={t.id}>
                      <CardContent className="py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="text-blue-600 font-bold text-sm w-12 shrink-0 mt-0.5">
                            {t.hora}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{t.paciente_nombre}</p>
                            <p className="text-xs text-gray-500">{t.paciente_telefono}</p>
                            {t.obra_social && (
                              <p className="text-xs text-gray-500">{t.obra_social}</p>
                            )}
                            {t.motivo && (
                              <p className="text-xs text-gray-400 mt-1 max-w-xs">{t.motivo}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={t.estado === 'confirmado' ? 'success' : 'secondary'}>
                            {t.estado}
                          </Badge>
                          {t.estado === 'confirmado' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleCancelTurno(t.id, t.paciente_nombre)}
                            >
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

        {/* Profesionales tab */}
        {activeTab === 'profesionales' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''}
              </h2>
              <Button
                onClick={() => { setShowAddForm(!showAddForm); setEditingPro(null); }}
              >
                {showAddForm ? 'Cancelar' : '+ Agregar profesional'}
              </Button>
            </div>

            {saveMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${
                saveMsg.includes('correctamente') || saveMsg.includes('eliminado')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {saveMsg}
              </div>
            )}

            {/* Edit form */}
            {editingPro && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar profesional — {editingPro.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePro} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Slug">
                      <Input value={editingPro.slug} disabled className="bg-gray-50 text-gray-400" />
                    </FormField>
                    <FormField label="Nombre completo *">
                      <Input value={editingPro.nombre} onChange={e => setEditingPro(p => ({ ...p, nombre: e.target.value }))} required />
                    </FormField>
                    <FormField label="Especialidad *">
                      <Input value={editingPro.especialidad} onChange={e => setEditingPro(p => ({ ...p, especialidad: e.target.value }))} required />
                    </FormField>
                    <FormField label="Matrícula">
                      <Input value={editingPro.matricula} onChange={e => setEditingPro(p => ({ ...p, matricula: e.target.value }))} />
                    </FormField>
                    <FormField label="Foto de perfil">
                      <div className="space-y-2">
                        {(editPhotoPreview || editingPro.foto_url) && (
                          <img
                            src={editPhotoPreview || editingPro.foto_url}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        )}
                        <Input type="file" accept="image/*" onChange={handleEditPhotoChange} className="cursor-pointer" />
                        {editPhotoFile && <p className="text-xs text-gray-400">{editPhotoFile.name}</p>}
                      </div>
                    </FormField>
                    <FormField label="WhatsApp">
                      <Input value={editingPro.telefono_whatsapp} onChange={e => setEditingPro(p => ({ ...p, telefono_whatsapp: e.target.value }))} />
                    </FormField>
                    <FormField label="Google Calendar ID">
                      <Input value={editingPro.calendar_id} onChange={e => setEditingPro(p => ({ ...p, calendar_id: e.target.value }))} />
                    </FormField>
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
                    <FormField label="Obras sociales (separadas por coma)">
                      <Input value={editingPro.obras_sociales} onChange={e => setEditingPro(p => ({ ...p, obras_sociales: e.target.value }))} />
                    </FormField>
                    <FormField label="Estado">
                      <Select value={editingPro.activo} onChange={e => setEditingPro(p => ({ ...p, activo: e.target.value }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción / Bio">
                        <Textarea value={editingPro.descripcion} onChange={e => setEditingPro(p => ({ ...p, descripcion: e.target.value }))} />
                      </FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditingPro(null)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Add form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Nuevo profesional</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePro} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Slug *">
                      <Input placeholder="dra-garcia" value={newPro.slug} onChange={e => setNewPro(p => ({ ...p, slug: e.target.value }))} required />
                    </FormField>
                    <FormField label="Nombre completo *">
                      <Input placeholder="Dra. Ana García" value={newPro.nombre} onChange={e => setNewPro(p => ({ ...p, nombre: e.target.value }))} required />
                    </FormField>
                    <FormField label="Especialidad *">
                      <Input placeholder="Cardiología" value={newPro.especialidad} onChange={e => setNewPro(p => ({ ...p, especialidad: e.target.value }))} required />
                    </FormField>
                    <FormField label="Matrícula">
                      <Input placeholder="12345" value={newPro.matricula} onChange={e => setNewPro(p => ({ ...p, matricula: e.target.value }))} />
                    </FormField>
                    <FormField label="Foto de perfil">
                      <div className="space-y-2">
                        {(photoPreview || newPro.foto_url) && (
                          <img
                            src={photoPreview || newPro.foto_url}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        )}
                        <Input type="file" accept="image/*" onChange={handlePhotoChange} className="cursor-pointer" />
                        {photoFile && <p className="text-xs text-gray-400">{photoFile.name}</p>}
                      </div>
                    </FormField>
                    <FormField label="WhatsApp">
                      <Input placeholder="5491123456789" value={newPro.telefono_whatsapp} onChange={e => setNewPro(p => ({ ...p, telefono_whatsapp: e.target.value }))} />
                    </FormField>
                    <FormField label="Google Calendar ID">
                      <Input placeholder="email@group.calendar.google.com" value={newPro.calendar_id} onChange={e => setNewPro(p => ({ ...p, calendar_id: e.target.value }))} />
                    </FormField>
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
                    <FormField label="Obras sociales (separadas por coma)">
                      <Input placeholder="OSDE, Swiss Medical, PAMI" value={newPro.obras_sociales} onChange={e => setNewPro(p => ({ ...p, obras_sociales: e.target.value }))} />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Descripción / Bio">
                        <Textarea placeholder="Breve descripción del profesional..." value={newPro.descripcion} onChange={e => setNewPro(p => ({ ...p, descripcion: e.target.value }))} />
                      </FormField>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar profesional'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Profesionales list */}
            <div className="space-y-3">
              {profesionales.map(p => (
                <Card key={p.slug}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.foto_url ? (
                        <img
                          src={p.foto_url}
                          alt={p.nombre}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: p.color_marca || '#2563eb' }}
                        >
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
                      <Badge variant={p.activo === 'true' ? 'success' : 'secondary'}>
                        {p.activo === 'true' ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(p)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleDeletePro(p.slug, p.nombre)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
