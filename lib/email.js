import { Resend } from 'resend';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const resend = new Resend(process.env.RESEND_API_KEY);

// Dominio verificado en Resend. Usar 'onboarding@resend.dev' para pruebas sin dominio propio.
const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

export async function enviarEmailConfirmacion({
  paciente_email,
  paciente_nombre,
  profesional_nombre,
  profesional_especialidad,
  profesional_whatsapp,
  fecha,
  hora,
  turno_id,
}) {
  if (!paciente_email || !process.env.RESEND_API_KEY) return;

  const fechaFormateada = format(parseISO(fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const cancelarUrl = `https://citaloapp.com.ar/cancelar/${turno_id}`;
  const waNumber = profesional_whatsapp?.replace(/\D/g, '');
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : null;

  const fila = (label, value) => `
    <tr>
      <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;width:40%">${label}</td>
      <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #e5e7eb">${value}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:0 auto">

    <!-- Header -->
    <div style="background-color:#0ea5e9;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
      <img src="https://citaloapp.com.ar/logo.svg" alt="Citalo" height="30"
        style="filter:brightness(0) invert(1);display:block;margin:0 auto" />
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827">¡Turno confirmado! ✅</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#6b7280">
        Hola <strong style="color:#111827">${paciente_nombre}</strong>, tu turno fue reservado exitosamente.
      </p>

      <!-- Resumen -->
      <div style="background:#f0f9ff;border-radius:12px;padding:20px 24px;margin-bottom:28px">
        <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#0284c7;text-transform:uppercase;letter-spacing:.05em">
          Detalle del turno
        </p>
        <table style="width:100%;border-collapse:collapse">
          ${fila('Profesional', profesional_nombre)}
          ${profesional_especialidad ? fila('Especialidad', profesional_especialidad) : ''}
          ${fila('Fecha', fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1))}
          ${fila('Hora', hora)}
        </table>
      </div>

      <!-- Cancelar -->
      <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin-bottom:28px">
        <p style="margin:0 0 10px;font-size:14px;color:#92400e">
          ¿Necesitás cancelar o reprogramar? Podés hacerlo hasta 2 horas antes del turno.
        </p>
        <a href="${cancelarUrl}"
          style="display:inline-block;background:#ffffff;border:1px solid #fcd34d;color:#92400e;font-size:13px;font-weight:600;padding:8px 16px;border-radius:8px;text-decoration:none">
          Cancelar turno
        </a>
      </div>

      <!-- WhatsApp -->
      ${waUrl ? `
      <div style="text-align:center;margin-bottom:8px">
        <p style="margin:0 0 12px;font-size:14px;color:#6b7280">¿Tenés alguna pregunta? Contactá al profesional:</p>
        <a href="${waUrl}" target="_blank"
          style="display:inline-flex;align-items:center;gap:8px;background:#22c55e;color:#ffffff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none">
          Escribir por WhatsApp
        </a>
      </div>` : ''}

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px">
      <p style="margin:0;font-size:12px;color:#94a3b8">
        Turnos gestionados por <strong>Citalo</strong> · citaloapp.com.ar
      </p>
    </div>

  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: paciente_email,
    subject: `✅ Tu turno está confirmado - ${profesional_nombre}`,
    html,
  });
}
