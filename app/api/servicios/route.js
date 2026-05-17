import { NextResponse } from 'next/server';
import { getServiciosBySlug } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
  try {
    const servicios = await getServiciosBySlug(slug);
    return NextResponse.json({ servicios });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
