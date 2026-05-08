import { NextResponse } from 'next/server';
import { getSlotsDisponibles } from '@/lib/calendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  const fecha = searchParams.get('fecha');
  const duracion = parseInt(searchParams.get('duracion')) || 30;

  if (!calendarId || !fecha) {
    return NextResponse.json({ error: 'Parámetros requeridos: calendarId, fecha' }, { status: 400 });
  }

  try {
    const slots = await getSlotsDisponibles(calendarId, fecha, duracion);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}
