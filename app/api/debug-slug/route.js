import { getSheetsClient } from '@/lib/sheets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'clr-julia-guzman';

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:Q',
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const data = rows.slice(1);
    const slugIdx = headers.indexOf('slug');
    const activoIdx = headers.indexOf('activo');

    return Response.json({
      headers,
      slugIdx,
      activoIdx,
      totalRows: data.length,
      rows: data.map(r => ({
        slug: r[slugIdx],
        activo: r[activoIdx],
        match: r[slugIdx] === slug
      }))
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
}
