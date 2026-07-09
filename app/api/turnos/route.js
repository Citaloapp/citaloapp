import { NextResponse } from 'next/server';
import { crearTurno } from '@/lib/sheets';
import { crearEvento } from '@/lib/calendar';

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

    if (!profesional_slug || !paciente_nombre || !paciente_telefono || !fecha || !hora) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // 1. Guardar turno en Sheets
    const turnoData = await crearTurno({
      profesional_slug,
      paciente_nombre,
      paciente_telefono,
      paciente_email: paciente_email || '',
      obra_social: obra_social || '',
      motivo: motivo || '',
      fecha,
      hora,
      servicio_nombre: servicio_nombre || '',
    });

    // 2. Crear evento en Google Calendar
    if (profesional_calendar_id) {
      try {
        const titulo = servicio_nombre
          ? `${servicio_nombre} — ${paciente_nombre}`
          : `Turno — ${paciente_nombre}`;
        const descripcion = [
          `Paciente: ${paciente_nombre}`,
          `Tel: ${paciente_telefono}`,
          paciente_email ? `Email: ${paciente_email}` : '',
          obra_social ? `Obra social: ${obra_social}` : '',
          motivo ? `Motivo: ${motivo}` : '',
        ].filter(Boolean).join('\n');

        const evento = await crearEvento(
          profesional_calendar_id,
          titulo,
          fecha,
          hora,
          duracion_turno_minutos || 30,
          descripcion
        );
        turnoData.calendar_event_id = evento.id;
      } catch (calErr) {
        console.error('[turnos] Error creando evento en calendar:', calErr?.message);
      }
    }

    // 3. Notificar al paciente por WhatsApp
    if (paciente_telefono) {
      try {
        const numeroPaciente = `549${paciente_telefono.replace(/\D/g, '')}`;
        const fechaFormateada = new Date(fecha + 'T12:00:00-03:00').toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
        await fetch('https://api.citaloapp.com.ar/message/sendText/citalo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'citaloapp2026secreto',
          },
          body: JSON.stringify({
            number: numeroPaciente,
            text: `✅ *Turno confirmado*\n\n📅 ${fechaFormateada} a las ${hora}hs\n👨‍⚕️ ${profesional_nombre}${profesional_especialidad ? ` — ${profesional_especialidad}` : ''}${servicio_nombre ? `\n🔹 ${servicio_nombre}` : ''}\n\nTe esperamos. Si necesitás cancelar o reprogramar, respondé este mensaje.`,
          }),
        });
      } catch (waErr) {
        console.error('[turnos] Error enviando WA al paciente:', waErr?.message);
      }
    }

    // 4. Notificar al profesional por WhatsApp
    if (profesional_whatsapp) {
      try {
        const numeroProf = `549${profesional_whatsapp.replace(/\D/g, '')}`;
        const fechaFormateada = new Date(fecha + 'T12:00:00-03:00').toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
        await fetch(`https://api.citaloapp.com.ar/message/sendText/${profesional_slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'citaloapp2026secreto',
          },
          body: JSON.stringify({
            number: numeroProf,
            text: `📋 *Nuevo turno*\n\n👤 ${paciente_nombre}\n📞 ${paciente_telefono}${paciente_email ? `\n📧 ${paciente_email}` : ''}${obra_social ? `\n🏥 ${obra_social}` : ''}${motivo ? `\n💬 ${motivo}` : ''}\n📅 ${fechaFormateada} a las ${hora}hs${servicio_nombre ? `\n🔹 ${servicio_nombre}` : ''}`,
          }),
        });
      } catch (waErr) {
        console.error('[turnos] Error enviando WA al profesional:', waErr?.message);
      }
    }

    return NextResponse.json({ success: true, turno: turnoData });
  } catch (err) {
    console.error('[turnos] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 });
  }
}
