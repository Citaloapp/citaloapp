import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAllProfesionales, cancelarTurno } from '@/lib/sheets';
import { eliminarEvento } from '@/lib/calendar';

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
  return (str || '').replace(/\D/g, '');
}

// Convierte "Jorge Sager", "JORGE-SAGER", " jorge sager " etc. a "jorge-sager",
// para que no importe cómo Evolution mande el nombre de la instancia.
function normalizarSlug(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getTurnoDatetime(fecha, hora) {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0);
}

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

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
    const { telefono, slug: slugCrudo } = body;

    if (!telefono || !slugCrudo) {
      return NextResponse.json(
        { error: 'telefono y slug son requeridos' },
        { status: 400 }
      );
    }

    // Buscamos el profesional comparando versiones normalizadas, así no
    // importa si Evolution manda "Jorge Sager" en vez de "jorge-sager".
    const slugBuscado = normalizarSlug(slugCrudo);
    const todos = await getAllProfesionales();
    const profesional = todos.find(p => normalizarSlug(p.slug) === slugBuscado);

    if (!profesional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // A partir de acá usamos el slug REAL guardado en Sheets (profesional.slug),
    // no el que mandó Evolution, para que coincida con profesional_slug en turnos.
    const slug = profesional.slug;

    const turno = await buscarProximoTurnoPorTelefono(slug, telefono);
    if (!turno) {
      return NextResponse.json(
        { error: 'No se encontró un turno confirmado para ese teléfono' },
        { status: 404 }
      );
    }

    const fechaTurno = getTurnoDatetime(turno.fecha, turno.hora);
    const cancelacion_tardia = fechaTurno <= new Date(Date.now() + 24 * 60 * 60 * 1000);

    await cancelarTurno(turno.id);

    if (turno.calendar_event_id && profesional?.calendar_id) {
      await eliminarEvento(profesional.calendar_id, turno.calendar_event_id).catch(
        err => console.error('Calendar delete failed:', err)
      );
    }

    return NextResponse.json({
      ok: true,
      turno: {
        id: turno.id,
        paciente_nombre: turno.paciente_nombre,
        paciente_telefono: turno.paciente_telefono,
        fecha: turno.fecha,
        hora: turno.hora,
        servicio_nombre: turno.servicio_nombre,
      },
      profesional: {
        slug: profesional.slug,
        nombre: profesional.nombre,
        telefono_whatsapp: profesional.telefono_whatsapp,
      },
      cancelacion_tardia,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
