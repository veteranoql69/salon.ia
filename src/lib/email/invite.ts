"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  inviterName,
  salonName,
  code,
}: {
  to: string;
  inviterName: string;
  salonName: string;
  code: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saloncia.app";

  const { data, error } = await resend.emails.send({
    from: "Salon.IA <noreply@noreply.sditecnologia.cl>",
    to,
    subject: `${inviterName} te invita a ${salonName} ✂️`,
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invitación a ${salonName}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;">

          <!-- Header logo -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-style:italic;text-transform:uppercase;">
                Salon<span style="color:#f59e0b;">.IA</span>
              </span>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:#111111;border:1px solid #1f1f1f;border-radius:24px;overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b);"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 0;">

                  <!-- Eyebrow -->
                  <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#a16207;">
                    Invitación exclusiva
                  </p>

                  <!-- Headline -->
                  <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">
                    Te invitaron a unirte a
                  </h1>
                  <h2 style="margin:0 0 28px;font-size:24px;font-weight:700;color:#f59e0b;line-height:1.2;">
                    ${salonName}
                  </h2>

                  <!-- Body text -->
                  <p style="margin:0 0 32px;font-size:15px;color:#a1a1aa;line-height:1.7;">
                    <strong style="color:#ffffff;">${inviterName}</strong> quiere que formes parte
                    de su equipo en <strong style="color:#ffffff;">Salon.IA</strong> — la plataforma
                    que gestiona agenda, clientes y finanzas del salón en un solo lugar.
                  </p>

                  <!-- Code block -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="background:#0a0a0a;border:1.5px solid #292524;border-radius:16px;padding:28px 24px;text-align:center;">
                        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#78716c;">
                          Tu código de acceso
                        </p>
                        <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:0.25em;color:#f59e0b;font-family:'Courier New',monospace;line-height:1;">
                          ${code}
                        </p>
                        <p style="margin:10px 0 0;font-size:12px;color:#52525b;">
                          Código de uso único · No lo compartas
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Steps -->
              <tr>
                <td style="padding:32px 40px 0;">
                  <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.05em;">
                    Cómo unirte en 3 pasos
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:0 0 12px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:28px;height:28px;background:#1c1917;border-radius:50%;text-align:center;vertical-align:middle;">
                              <span style="font-size:12px;font-weight:700;color:#f59e0b;">1</span>
                            </td>
                            <td style="padding-left:12px;font-size:13px;color:#a1a1aa;vertical-align:middle;">
                              Crea tu cuenta con Google o email
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 12px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:28px;height:28px;background:#1c1917;border-radius:50%;text-align:center;vertical-align:middle;">
                              <span style="font-size:12px;font-weight:700;color:#f59e0b;">2</span>
                            </td>
                            <td style="padding-left:12px;font-size:13px;color:#a1a1aa;vertical-align:middle;">
                              Ingresa el código de arriba cuando te lo pidan
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:28px;height:28px;background:#1c1917;border-radius:50%;text-align:center;vertical-align:middle;">
                              <span style="font-size:12px;font-weight:700;color:#f59e0b;">3</span>
                            </td>
                            <td style="padding-left:12px;font-size:13px;color:#a1a1aa;vertical-align:middle;">
                              Accede a tu panel y empieza a gestionar tu agenda
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:32px 40px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center">
                        <a href="${appUrl}/login"
                           style="display:inline-block;background:#f59e0b;color:#000000;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:14px;">
                          Aceptar invitación →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Bottom accent -->
              <tr>
                <td style="height:1px;background:#1f1f1f;"></td>
              </tr>
              <tr>
                <td style="padding:20px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#3f3f46;line-height:1.6;">
                    Este correo fue enviado porque ${inviterName} te invitó a ${salonName}.<br/>
                    Si no conoces a esta persona, puedes ignorar este mensaje.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:11px;color:#3f3f46;">
                Salon<span style="color:#f59e0b;">.IA</span> · La plataforma premium para profesionales de la belleza
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("[sendInviteEmail] Error:", error);
    return { error };
  }

  return { data };
}
