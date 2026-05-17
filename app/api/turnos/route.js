import { NextResponse } from 'next/server';
import { crearTurno, actualizarCalendarEventId } from '@/lib/sheets';
import { crearEvento } from '@/lib/calendar';
import { enviarEmailConfirmacion } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      profesional_slug,
      profesional_nombre,
      profesional_especialidad,
      profesional_whatsapp,
      profesional_calendar_id,
      duracion_turno_minutos,
      servicio_nombre,
      paciente_nombre,
      paciente_telefono,
      paciente_email,
      obra_social,
      motivo,
      fecha,
      hora,
    } = body;

    console.log('[turnos/POST] body recibido:', JSON.stringify({
      profesional_slug,
      paciente_nombre,
      paciente_telefono,
      fecha,
      hora,
      servicio_nombre: servicio_nombre || '(sin servicio)',
      duracion_turno_minutos,
    }));

    if (!profesional_slug || !paciente_nombre || !paciente_telefono || !fecha || !hora) {
      console.log('[turnos/POST] validación fallida — campos faltantes:', {
        profesional_slug: !!profesional_slug,
        paciente_nombre: !!paciente_nombre,
        paciente_telefono: !!paciente_telefono,
        fecha: !!fecha,
        hora: !!hora,
      });
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Save to Google Sheets
    let turno;
    try {
      turno = await crearTurno({
        profesional_slug,
        paciente_nombre,
        paciente_telefono,
        paciente_email,
        obra_social,
        motivo,
        servicio_nombre,
        fecha,
        hora,
      });
      console.log('[turnos/POST] turno guardado en Sheets con id:', turno.id);
    } catch (sheetsErr) {
      console.error('[turnos/POST] ERROR al guardar en Sheets:', sheetsErr?.message || sheetsErr);
      throw sheetsErr;
    }

    // Create Google Calendar event and save event_id
    if (profesional_calendar_id) {
      const titulo = `Turno - ${paciente_nombre}${servicio_nombre ? ` - ${servicio_nombre}` : ''}`;
      const descripcion = [
        `Paciente: ${paciente_nombre}`,
        `Tel: ${paciente_telefono}`,
        obra_social ? `Obra social: ${obra_social}` : '',
        motivo ? `Motivo: ${motivo}` : '',
      ].filter(Boolean).join('\n');

      try {
        console.log('[turnos/POST] creando evento Calendar — duracion:', duracion_turno_minutos, 'min');
        const evento = await crearEvento(
          profesional_calendar_id,
          titulo,
          fecha,
          hora,
          duracion_turno_minutos || 30,
          descripcion
        );
        console.log('[turnos/POST] evento Calendar creado:', evento?.id);
        if (evento?.id) {
          await actualizarCalendarEventId(turno.id, evento.id).catch(err =>
            console.error('[turnos/POST] Error actualizando calendar_event_id:', err?.message || err)
          );
        }
      } catch (err) {
        console.error('[turnos/POST] ERROR al crear evento Calendar:', err?.message || err);
      }
    } else {
      console.log('[turnos/POST] sin calendar_id — saltando creación de evento');
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
      }).catch(err => console.error('[turnos/POST] n8n webhook falló:', err?.message || err));
    }

    // Enviar email de confirmación (no bloquea la respuesta si falla)
    enviarEmailConfirmacion({
      paciente_email,
      paciente_nombre,
      profesional_nombre,
      profesional_especialidad,
      profesional_whatsapp,
      fecha,
      hora,
      turno_id: turno.id,
    }).catch(err => console.error('[turnos/POST] Email confirmación falló:', err?.message || err));

    console.log('[turnos/POST] respuesta OK — turno:', turno.id);
    return NextResponse.json({ success: true, turno });
  } catch (err) {
    console.error('[turnos/POST] ERROR GENERAL:', err?.message || err);
    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 });
  }
}
