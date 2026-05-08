import { NextResponse } from 'next/server';
import { getAllProfesionales } from '@/lib/sheets';
import { google } from 'googleapis';

function checkAuth(request) {
  const auth = request.headers.get('x-admin-password');
  return auth === process.env.ADMIN_PASSWORD;
}

function getSheets() {
  const key = process.env.GOOGLE_PRIVATE_KEY || '';
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: key.includes('\\n') ? key.replace(/\\n/g, '\n') : key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const profesionales = await getAllProfesionales();
    return NextResponse.json({ profesionales });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const data = await request.json();
    const sheets = getSheets();

    const row = [
      data.slug,
      data.nombre,
      data.especialidad,
      data.matricula || '',
      data.foto_url || '',
      data.descripcion || '',
      data.telefono_whatsapp || '',
      data.calendar_id || '',
      data.color_marca || '#2563eb',
      data.obras_sociales || '',
      data.duracion_turno_minutos || '30',
      'true',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}
