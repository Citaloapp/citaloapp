import { google } from 'googleapis';

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY || '';
  // dotenv may already have converted \n to real newlines; handle both cases
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
  'estado', 'created_at', 'calendar_event_id',
];

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] || ''; });
  return obj;
}

function parseProfesional(obj) {
  return {
    ...obj,
    obras_sociales: obj.obras_sociales
      ? obj.obras_sociales.split(',').map(o => o.trim()).filter(Boolean)
      : [],
    duracion_turno_minutos: parseInt(obj.duracion_turno_minutos) || 30,
  };
}

export async function getProfesional(slug) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'profesionales!A:L',
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return null;
  const [headers, ...data] = rows;

  const row = data.find(r => {
    const obj = rowToObject(headers, r);
    return obj.slug === slug && obj.activo?.toLowerCase() === 'true';
  });

  return row ? parseProfesional(rowToObject(headers, row)) : null;
}

export async function getAllProfesionales() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'profesionales!A:L',
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return [];
  const [headers, ...data] = rows;

  return data.map(r => parseProfesional(rowToObject(headers, r)));
}

export async function crearTurno(datos) {
  const sheets = getSheetsClient();
  const id = `T-${Date.now()}`;
  const created_at = new Date().toISOString();

  const row = [
    id,
    datos.profesional_slug,
    datos.paciente_nombre,
    datos.paciente_telefono,
    datos.paciente_email || '',
    datos.obra_social || '',
    datos.motivo || '',
    datos.fecha,
    datos.hora,
    'confirmado',
    created_at,
    '',  // calendar_event_id — se actualiza después de crear el evento
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  return { id, ...datos, estado: 'confirmado', created_at };
}

function turnosData(rows) {
  if (rows.length === 0) return [];
  // Si la primera fila tiene "id" como primer valor, es fila de headers — la saltamos
  return rows[0][0] === 'id' ? rows.slice(1) : rows;
}

async function findTurnoRowIndex(sheets, id) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:A',
  });
  const rows = res.data.values || [];
  // Buscamos por valor de id (ej: "T-1234"), no por posición, así funciona con o sin header
  return rows.findIndex(r => r[0] === id);
}

export async function getTurnoById(id) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:L',
  });
  const rows = res.data.values || [];
  const row = turnosData(rows).find(r => r[0] === id);
  return row ? rowToObject(TURNOS_COLS, row) : null;
}

export async function cancelarTurno(id) {
  const sheets = getSheetsClient();
  const rowIndex = await findTurnoRowIndex(sheets, id);
  if (rowIndex === -1) throw new Error('Turno no encontrado');
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `turnos!J${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['cancelado']] },
  });
}

export async function actualizarCalendarEventId(id, eventId) {
  const sheets = getSheetsClient();
  const rowIndex = await findTurnoRowIndex(sheets, id);
  if (rowIndex === -1) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `turnos!L${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[eventId]] },
  });
}

export async function getTurnosConfirmadosByFecha(slug, fecha) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:L',
  });
  const rows = res.data.values || [];
  return turnosData(rows)
    .map(r => rowToObject(TURNOS_COLS, r))
    .filter(t => t.profesional_slug === slug && t.fecha === fecha && t.estado === 'confirmado')
    .map(t => t.hora);
}

export async function getTurnosBySlug(slug, fecha = null) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'turnos!A:L',
  });

  const rows = res.data.values || [];
  return turnosData(rows)
    .map(r => rowToObject(TURNOS_COLS, r))
    .filter(t => t.profesional_slug === slug && (!fecha || t.fecha === fecha));
}
