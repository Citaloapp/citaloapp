import { getProfesionalByEmail } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  const profesional = await getProfesionalByEmail(email.toLowerCase());

  if (!profesional) {
    return Response.json({ error: 'Profesional no encontrado' }, { status: 404 });
  }

  return Response.json({ calendar_id: profesional.calendar_id });
}
