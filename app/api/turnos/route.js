import { NextResponse } from 'next/server';
import { crearTurno, actualizarCalendarEventId } from '@/lib/sheets';
import { crearEvento } from '@/lib/calendar';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      profesional_slug,
      profesional_nombre,
      profesional_whatsapp,
      profesional_calendar_id,
      duracion_turno_minutos,
      paciente_nombre,
      paciente_telefono,
      paciente_email,
      obra_social,
      motivo,
      fecha,
      hora,
    } = body;

    if (!profesional_slug || !paciente_nombre || !paciente_telefono || !fecha || !hora) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Save to Google Sheets
    const turno = await crearTurno({
      profesional_slug,
      paciente_nombre,
      paciente_telefono,
      paciente_email,
      obra_social,
      motivo,
      fecha,
      hora,
    });

    // Create Google Calendar event and save event_id
    if (profesional_calendar_id) {
      const titulo = `Turno: ${paciente_nombre}`;
      const descripcion = [
        `Paciente: ${paciente_nombre}`,
        `Tel: ${paciente_telefono}`,
        obra_social ? `Obra social: ${obra_social}` : '',
        motivo ? `Motivo: ${motivo}` : '',
      ].filter(Boolean).join('\n');

      try {
        const evento = await crearEvento(
          profesional_calendar_id,
          titulo,
          fecha,
          hora,
          duracion_turno_minutos || 30,
          descripcion
        );
        if (evento?.id) {
          await actualizarCalendarEventId(turno.id, evento.id).catch(() => {});
        }
      } catch (err) {
        console.error('Calendar event creation failed:', err);
      }
    }

    const cancelar_url = `https://citaloapp.com.ar/cancelar/${turno.id}`;

    // Trigger n8n webhook
    if (process.env.N8N_WEBHOOK_URL) {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'confirmacion',
          profesional_slug,
          profesional_nombre,
          profesional_whatsapp,
          paciente_nombre,
          paciente_telefono,
          paciente_email,
          obra_social,
          motivo,
          fecha,
          hora,
          cancelar_url,
        }),
      }).catch(err => console.error('n8n webhook failed:', err));
    }

    return NextResponse.json({ success: true, turno });
  } catch (err) {
    console.error('Error creating turno:', err);
    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 });
  }
}
