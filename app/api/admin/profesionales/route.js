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

async function findRowIndex(sheets, slug) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'profesionales!A:A',
  });
  const rows = res.data.values || [];
  return rows.findIndex((r, i) => i > 0 && r[0] === slug);
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

export async function PUT(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const data = await request.json();
    const sheets = getSheets();

    const rowIndex = await findRowIndex(sheets, data.slug);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }
    const rowNumber = rowIndex + 1;

    const updatedRow = [
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
      data.activo ?? 'true',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `profesionales!A${rowNumber}:L${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const { slug } = await request.json();
    const sheets = getSheets();

    const rowIndex = await findRowIndex(sheets, slug);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }

    const spreadsheetRes = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    const sheet = spreadsheetRes.data.sheets.find(s => s.properties.title === 'profesionales');
    const sheetId = sheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
