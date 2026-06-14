import { getSheetsClient } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email) {
    return Response.json({ error: 'Email requerido' }, { status: 400 });
  }

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:Q',
    });

    const rows = res.data.values || [];
    if (rows.length < 2) {
      return Response.json({ error: 'Sin datos' }, { status: 404 });
    }

    const headers = rows[0];
    const data = rows.slice(1);

    const emailIdx = headers.indexOf('profesional_email');
    const calendarIdx = headers.indexOf('calendar_id');

    if (emailIdx === -1 || calendarIdx === -1) {
      return Response.json({ error: 'Columnas no encontradas' }, { status: 500 });
    }

    const row = data.find(r => r[emailIdx]?.toLowerCase().trim() === email);

    if (!row) {
      return Response.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }

    return Response.json({ calendar_id: row[calendarIdx] });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
