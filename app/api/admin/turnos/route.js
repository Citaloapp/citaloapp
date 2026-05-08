import { NextResponse } from 'next/server';
import { getTurnosBySlug, getAllProfesionales } from '@/lib/sheets';
import { format } from 'date-fns';

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const fecha = searchParams.get('fecha') || format(new Date(), 'yyyy-MM-dd');

    if (!slug) {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
    }

    const turnos = await getTurnosBySlug(slug, fecha);
    return NextResponse.json({ turnos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
