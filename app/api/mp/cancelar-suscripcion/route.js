import { NextResponse } from 'next/server';
import { getProfesionalByEmail, inactivarProfesional } from '@/lib/sheets';

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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaloapp.com.ar';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Esperá una hora.' }, { status: 429 });
  }

  let email, slug;
  try {
    ({ email, slug } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!email || !slug) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const profesional = await getProfesionalByEmail(normalizedEmail);

    if (!profesional || profesional.slug !== slug) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }

    // Cancelar en MercadoPago si tiene subscription_id
    if (profesional.subscription_id) {
      try {
        await fetch(`https://api.mercadopago.com/preapproval/${profesional.subscription_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      } catch (err) {
        console.error('[cancelar-suscripcion] Error MP:', err?.message);
      }
    }

    await inactivarProfesional(slug);

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'suscripcion_cancelada',
          profesional_slug: slug,
          profesional_nombre: profesional.nombre,
          profesional_email: normalizedEmail,
          profesional_telefono: profesional.telefono_whatsapp,
          fecha_cancelacion: new Date().toISOString(),
        }),
      }).catch(err => console.error('[cancelar-suscripcion] n8n error:', err?.message));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[cancelar-suscripcion] ERROR:', err?.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
