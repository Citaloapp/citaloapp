import { google } from 'googleapis';

const DIA_JS = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

function horaAMins(hora, defecto) {
  if (!hora) return defecto;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

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

function minsToHora(totalMins) {
  return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
}

export async function getSlotsDisponibles(calendarId, fecha, duracionMinutos, { horarioInicio, horarioFin, diasAtencion, horarios } = {}) {
  const esFormatoNuevo = s => Boolean(s && /^(lunes|martes|miercoles|jueves|viernes|sabado|domingo):/.test(s));
  const fuenteHorarios = horarios || (esFormatoNuevo(horarioInicio) ? horarioInicio : null);

  let rangosDelDia = null;
  if (fuenteHorarios) {
    const diaSemana = new Date(fecha + 'T12:00:00-03:00').getDay();
    const nombreDia = Object.keys(DIA_JS).find(k => DIA_JS[k] === diaSemana);
    const entrada = fuenteHorarios.split(';').find(e => e.startsWith(nombreDia + ':'));
    if (!entrada) return [];
    rangosDelDia = entrada.slice(nombreDia.length + 1).split(',').map(r => {
      const [desde, hasta] = r.split('-');
      return { desde, hasta };
    });
  } else if (diasAtencion) {
    const diasList = diasAtencion.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
    if (diasList.length > 0) {
      const diaSemana = new Date(fecha + 'T12:00:00-03:00').getDay();
      const nombreDia = Object.keys(DIA_JS).find(k => DIA_JS[k] === diaSemana);
      if (!diasList.includes(nombreDia)) return [];
    }
  }

  const calendar = getCalendarClient();

  const res = await calendar.events.list({
    calendarId,
    timeMin: `${fecha}T00:00:00-03:00`,
    timeMax: `${fecha}T23:59:59-03:00`,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const eventos = res.data.items || [];

  function generarSlots(desde, hasta) {
    const result = [];
    let currentMins = horaAMins(desde, 9 * 60);
    const finMins = horaAMins(hasta, 18 * 60);
    while (currentMins < finMins) {
      const slotEndMins = currentMins + duracionMinutos;
      if (slotEndMins > finMins) break;
      const slotStart = new Date(`${fecha}T${minsToHora(currentMins)}:00-03:00`);
      const slotEnd = new Date(`${fecha}T${minsToHora(slotEndMins)}:00-03:00`);
      const ocupado = eventos.some(e => {
        const eStart = new Date(e.start.dateTime || e.start.date);
        const eEnd = new Date(e.end.dateTime || e.end.date);
        return slotStart < eEnd && slotEnd > eStart;
      });
      if (!ocupado) result.push(minsToHora(currentMins));
      currentMins += duracionMinutos;
    }
    return result;
  }

  if (rangosDelDia) {
    return rangosDelDia.flatMap(({ desde, hasta }) => generarSlots(desde, hasta));
  }

  return generarSlots(horarioInicio, horarioFin);
}

export async function crearEvento(calendarId, titulo, fecha, hora, duracionMinutos, descripcion) {
  const calendar = getCalendarClient();
  const [h, m] = hora.split(':').map(Number);
  const endTotalMins = h * 60 + m + duracionMinutos;
  const startStr = `${fecha}T${hora}:00-03:00`;
  const endStr = `${fecha}T${minsToHora(endTotalMins)}:00-03:00`;

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: titulo,
      description: descripcion,
      start: { dateTime: startStr, timeZone: 'America/Argentina/Buenos_Aires' },
      end: { dateTime: endStr, timeZone: 'America/Argentina/Buenos_Aires' },
    },
  });

  return res.data;
}

export async function eliminarEvento(calendarId, eventId) {
  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId, eventId });
}

// ── NUEVA FUNCIÓN: Crear calendario para profesional nuevo ─────────────────
export async function crearCalendarioProfesional(nombreProfesional) {
  const calendar = getCalendarClient();

  const res = await calendar.calendars.insert({
    requestBody: {
      summary: `Citaloapp — ${nombreProfesional}`,
      timeZone: 'America/Argentina/Buenos_Aires',
    },
  });

  const calendarId = res.data.id;

  // Hacer el calendario público para que los pacientes puedan ver disponibilidad
  await calendar.acl.insert({
    calendarId,
    requestBody: {
      role: 'reader',
      scope: { type: 'default' },
    },
  });

  return calendarId;
}
