import { google } from 'googleapis';
import { addMinutes, parseISO, startOfDay, endOfDay, setHours, setMinutes, format } from 'date-fns';

const HORARIO_INICIO = 8;
const HORARIO_FIN = 20;

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY || '';
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
}

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

export async function getSlotsDisponibles(calendarId, fecha, duracionMinutos) {
  const calendar = getCalendarClient();
  const fechaDate = parseISO(fecha);

  const res = await calendar.events.list({
    calendarId,
    timeMin: startOfDay(fechaDate).toISOString(),
    timeMax: endOfDay(fechaDate).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const eventos = res.data.items || [];
  const slots = [];
  let current = setMinutes(setHours(fechaDate, HORARIO_INICIO), 0);
  const fin = setMinutes(setHours(fechaDate, HORARIO_FIN), 0);

  while (current < fin) {
    const slotEnd = addMinutes(current, duracionMinutos);
    if (slotEnd > fin) break;

    const ocupado = eventos.some(e => {
      const eStart = new Date(e.start.dateTime || e.start.date);
      const eEnd = new Date(e.end.dateTime || e.end.date);
      return current < eEnd && slotEnd > eStart;
    });

    if (!ocupado) slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, duracionMinutos);
  }

  return slots;
}

export async function crearEvento(calendarId, titulo, fecha, hora, duracionMinutos, descripcion) {
  const calendar = getCalendarClient();
  const [hours, minutes] = hora.split(':').map(Number);
  const fechaDate = parseISO(fecha);
  const start = setMinutes(setHours(fechaDate, hours), minutes);
  const end = addMinutes(start, duracionMinutos);

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: titulo,
      description: descripcion,
      start: { dateTime: start.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
      end: { dateTime: end.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
    },
  });

  return res.data;
}

export async function eliminarEvento(calendarId, eventId) {
  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId, eventId });
}
