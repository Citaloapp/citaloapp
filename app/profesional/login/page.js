'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const SESSION_KEY = 'citalo_prof_session';

export default function ProfesionalLoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profesional/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), password: password.trim() }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ slug: slug.trim(), password: password.trim() }));
        router.push('/profesional/panel');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Mi panel</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá con tu usuario y contraseña</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="slug">Usuario</Label>
                <Input
                  id="slug"
                  placeholder="tu-slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="pw">Contraseña</Label>
                <Input
                  id="pw"
                  type="password"
                  placeholder="PIN de 6 dígitos"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || !slug || !password}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
