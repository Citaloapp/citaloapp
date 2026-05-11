import { NextResponse } from 'next/server';
import { getSlotsDisponibles } from '@/lib/calendar';
import { getTurnosConfirmadosByFecha } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  const fecha = searchParams.get('fecha');
  const duracion = parseInt(searchParams.get('duracion')) || 30;
  const slug = searchParams.get('slug');

  if (!calendarId || !fecha) {
    return NextResponse.json({ error: 'Parámetros requeridos: calendarId, fecha' }, { status: 400 });
  }

  try {
    console.log('[slots] fecha recibida:', fecha, '| slug:', slug);

    const [slotsCalendar, horasOcupadas] = await Promise.all([
      getSlotsDisponibles(calendarId, fecha, duracion),
      slug ? getTurnosConfirmadosByFecha(slug, fecha) : Promise.resolve([]),
    ]);

    console.log('[slots] slots de Calendar:', slotsCalendar);
    console.log('[slots] horas ocupadas en Sheets:', horasOcupadas);

    const slots = slotsCalendar.map(hora => ({
      hora,
      disponible: !horasOcupadas.includes(hora),
    }));

    const bloqueados = slots.filter(s => !s.disponible).map(s => s.hora);
    console.log('[slots] slots marcados no disponibles:', bloqueados);

    return NextResponse.json({ slots });
  } catch (err) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}
