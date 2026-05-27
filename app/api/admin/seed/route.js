import { NextResponse } from 'next/server';
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

// POST /api/admin/seed — agrega la fila de ejemplo del primer profesional
export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const sheets = getSheets();

    // Verificar si ya existe el slug dra-garcia
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:A',
    });
    const slugs = (existing.data.values || []).flat();
    if (slugs.includes('dra-garcia')) {
      return NextResponse.json({ message: 'El profesional de ejemplo ya existe', slug: 'dra-garcia' });
    }

    const row = [
      'dra-garcia',                              // slug
      'Dra. Laura García',                       // nombre
      'Dermatología',                            // especialidad
      'TODO: completar matrícula',               // matricula
      '',                                        // foto_url (subir desde admin)
      'Especialista en Dermatología clínica y estética. Más de 10 años de experiencia.', // descripcion
      'TODO: número WhatsApp sin 0 ni 15',       // telefono_whatsapp
      'TODO: calendar_id de Google Calendar',    // calendar_id
      '#0ea5e9',                                 // color_marca
      'OSDE, Swiss Medical, PAMI',               // obras_sociales
      '30',                                      // duracion_turno_minutos
      'true',                                    // activo
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'profesionales!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return NextResponse.json({
      success: true,
      message: 'Profesional de ejemplo creado correctamente',
      slug: 'dra-garcia',
      pendientes: [
        'Completar calendar_id en Google Sheets (columna H)',
        'Completar telefono_whatsapp (columna G)',
        'Completar matrícula (columna D)',
        'Subir foto desde /admin',
      ],
    });
  } catch (err) {
    console.error('[admin/seed] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error al crear profesional de ejemplo' }, { status: 500 });
  }
}
