import { getProfesionalByEmail, getProfesionalesDebug } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  const emailNormalizado = email.toLowerCase();
  const debug = await getProfesionalesDebug();
  const profesional = await getProfesionalByEmail(emailNormalizado);

  return Response.json({
    debug: {
      emailRecibido: email,
      emailNormalizado,
      totalFilas: debug.totalRows,
      headers: debug.headers,
      primeraFilaDatos: debug.firstDataRow,
      resultadoGetProfesionalByEmail: profesional,
    },
    ...(profesional
      ? { calendar_id: profesional.calendar_id }
      : { error: 'Profesional no encontrado' }
    ),
  }, { status: profesional ? 200 : 404 });
}
