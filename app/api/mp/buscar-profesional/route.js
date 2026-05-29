import { NextResponse } from 'next/server';
import { getProfesionalByEmail } from '@/lib/sheets';

const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Esperá una hora.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  try {
    const profesional = await getProfesionalByEmail(email);

    if (!profesional) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      nombre: profesional.nombre,
      slug: profesional.slug,
    });
  } catch (err) {
    console.error('[buscar-profesional] ERROR:', err?.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
