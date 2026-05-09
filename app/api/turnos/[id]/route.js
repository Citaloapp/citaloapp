import { NextResponse } from 'next/server';
import { getTurnoById, cancelarTurno, getProfesional } from '@/lib/sheets';
import { eliminarEvento } from '@/lib/calendar';

function getTurnoDatetime(fecha, hora) {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0);
}

export async function GET(request, { params }) {
  try {
    const turno = await getTurnoById(params.id);
    if (!turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    }

    const profesional = await getProfesional(turno.profesional_slug);
    const fechaTurno = getTurnoDatetime(turno.fecha, turno.hora);
    const puede_cancelar = fechaTurno > new Date(Date.now() + 24 * 60 * 60 * 1000);

    return NextResponse.json({
      turno: {
        id: turno.id,
        profesional_slug: turno.profesional_slug,
        profesional_nombre: profesional?.nombre || turno.profesional_slug,
        profesional_especialidad: profesional?.especialidad || '',
        paciente_nombre: turno.paciente_nombre,
        fecha: turno.fecha,
        hora: turno.hora,
        obra_social: turno.obra_social,
        estado: turno.estado,
        puede_cancelar,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const cancelado_por = searchParams.get('cancelado_por') || 'paciente';

    if (cancelado_por === 'profesional') {
      const pw = request.headers.get('x-admin-password');
      if (pw !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
    }

    const turno = await getTurnoById(params.id);
    if (!turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    }
    if (turno.estado === 'cancelado') {
      return NextResponse.json({ error: 'El turno ya fue cancelado' }, { status: 409 });
    }
    if (turno.estado !== 'confirmado') {
      return NextResponse.json({ error: 'El turno no puede cancelarse' }, { status: 400 });
    }

    if (cancelado_por === 'paciente') {
      const fechaTurno = getTurnoDatetime(turno.fecha, turno.hora);
      const puedeCancel = fechaTurno > new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (!puedeCancel) {
        return NextResponse.json(
          { error: 'No es posible cancelar con menos de 24hs de anticipación, contactá al profesional' },
          { status: 400 }
        );
      }
    }

    const profesional = await getProfesional(turno.profesional_slug);

    await cancelarTurno(params.id);

    if (turno.calendar_event_id && profesional?.calendar_id) {
      await eliminarEvento(profesional.calendar_id, turno.calendar_event_id).catch(
        err => console.error('Calendar delete failed:', err)
      );
    }

    if (process.env.N8N_WEBHOOK_URL) {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'cancelacion',
          profesional_slug: turno.profesional_slug,
          profesional_nombre: profesional?.nombre || turno.profesional_slug,
          profesional_whatsapp: profesional?.telefono_whatsapp || '',
          paciente_nombre: turno.paciente_nombre,
          paciente_telefono: turno.paciente_telefono,
          fecha: turno.fecha,
          hora: turno.hora,
          cancelado_por,
        }),
      }).catch(err => console.error('n8n webhook failed:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al cancelar el turno' }, { status: 500 });
  }
}
