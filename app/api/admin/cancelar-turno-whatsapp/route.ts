import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getProfesional, cancelarTurno } from '@/lib/sheets';

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY || '';
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

const TURNOS_COLS = [
  'id', 'profesional_slug', 'paciente_nombre', 'paciente_telefono',
  'paciente_email', 'obra_social', 'motivo', 'fecha', 'hora',
  'estado', 'created_at', 'calendar_event_id', 'servicio_nombre',
];

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] || ''; });
  return obj;
}

function normalizarTelefono(str) {
  // Deja solo dígitos, para poder comparar "5493364642051" con variantes
  // que puedan venir con "+", espacios, o el "9" extra de WhatsApp.
  return (str || '').replace(/\D/g, '');
}

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

/**
 * Busca, entre los turnos "confirmado" de un profesional, el más próximo
 * (fecha/hora futura más cercana) que pertenezca a ese teléfono.
 */
async function buscarProximoTurnoPorTelefono(slug, telefono) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:M',
  });

  const rows = res.data.values || [];
  const data = rows.length && rows[0][0] === 'id' ? rows.slice(1) : rows;
  const telefonoNorm = normalizarTelefono(telefono);

  const candidatos = data
    .map(r => rowToObject(TURNOS_COLS, r))
    .filter(t =>
      t.profesional_slug === slug &&
      t.estado.trim() === 'confirmado' &&
      normalizarTelefono(t.paciente_telefono) === telefonoNorm
    );

  if (candidatos.length === 0) return null;

  // Ordenamos por fecha+hora ascendente y devolvemos el más próximo.
  candidatos.sort((a, b) => {
    const fa = `${a.fecha} ${a.hora}`;
    const fb = `${b.fecha} ${b.hora}`;
    return fa.localeCompare(fb);
  });

  return candidatos[0];
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { telefono, slug } = body;

    if (!telefono || !slug) {
      return NextResponse.json(
        { error: 'telefono y slug son requeridos' },
        { status: 400 }
      );
    }

    const profesional = await getProfesional(slug);
    if (!profesional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    const turno = await buscarProximoTurnoPorTelefono(slug, telefono);
    if (!turno) {
      return NextResponse.json(
        { error: 'No se encontró un turno confirmado para ese teléfono' },
        { status: 404 }
      );
    }

    await cancelarTurno(turno.id);

    return NextResponse.json({
      ok: true,
      turno: {
        id: turno.id,
        paciente_nombre: turno.paciente_nombre,
        paciente_telefono: turno.paciente_telefono,
        fecha: turno.fecha,
        hora: turno.hora,
        servicio_nombre: turno.servicio_nombre,
        calendar_event_id: turno.calendar_event_id,
      },
      profesional: {
        slug: profesional.slug,
        nombre: profesional.nombre,
        telefono_whatsapp: profesional.telefono_whatsapp,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
