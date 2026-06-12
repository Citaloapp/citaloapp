import { NextResponse } from 'next/server';
import { getSlotsDisponibles } from '@/lib/calendar';
import { getTurnosConfirmadosByFecha } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  const fecha = searchParams.get('fecha');
  const duracion = parseInt(searchParams.get('duracion')) || 30;
  const slug = searchParams.get('slug');
  const horarioInicio = searchParams.get('horario_inicio') || '';
  const horarioFin = searchParams.get('horario_fin') || '';
  const diasAtencion = searchParams.get('dias_atencion') || '';
  const horarios = searchParams.get('horarios') || '';

  if (!calendarId || !fecha) {
    return NextResponse.json({ error: 'Parámetros requeridos: calendarId, fecha' }, { status: 400 });
  }

  try {
    const [slotsCalendar, horasOcupadas] = await Promise.all([
      getSlotsDisponibles(calendarId, fecha, duracion, { horarioInicio, horarioFin, diasAtencion, horarios }),
      slug ? getTurnosConfirmadosByFecha(slug, fecha) : Promise.resolve([]),
    ]);

    const slots = slotsCalendar.map(hora => ({
      hora,
      disponible: !horasOcupadas.includes(hora),
    }));

    return NextResponse.json({ slots });
  } catch (err) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}
