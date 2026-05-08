import { NextResponse } from 'next/server';
import { getProfesional } from '@/lib/sheets';

export async function GET(request, { params }) {
  try {
    const profesional = await getProfesional(params.slug);
    if (!profesional) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }
    return NextResponse.json(profesional);
  } catch (err) {
    console.error('Error fetching profesional:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
