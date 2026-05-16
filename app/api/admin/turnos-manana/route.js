import { NextResponse } from 'next/server';
import { addDays, format } from 'date-fns';
import { getTurnosConfirmadosPorFecha, getAllProfesionales } from '@/lib/sheets';

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const manana = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const [turnosRaw, profesionales] = await Promise.all([
      getTurnosConfirmadosPorFecha(manana),
      getAllProfesionales(),
    ]);

    const profMap = Object.fromEntries(profesionales.map(p => [p.slug, p]));

    const turnos = turnosRaw.map(t => {
      const prof = profMap[t.profesional_slug] || {};
      return {
        paciente_nombre: t.paciente_nombre,
        paciente_telefono: t.paciente_telefono,
        paciente_email: t.paciente_email,
        profesional_nombre: prof.nombre || t.profesional_slug,
        profesional_whatsapp: prof.telefono_whatsapp || '',
        fecha: t.fecha,
        hora: t.hora,
        cancelar_url: `https://citaloapp.com.ar/cancelar/${t.id}`,
      };
    });

    return NextResponse.json({ turnos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
