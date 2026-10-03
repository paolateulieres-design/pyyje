// Envoi d'emails transactionnels via Brevo (ex-Sendinblue) : société française,
// données hébergées dans l'UE, offre gratuite de 300 emails/jour.
// Sans BREVO_API_KEY (ex. en local), aucun email n'est envoyé : la plateforme
// continue de fonctionner avec les seules notifications internes.

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function siteUrl(path = "") {
  return `${process.env.NEXT_PUBLIC_SITE_URL || "https://pyyje.netlify.app"}${path}`;
}

export async function sendEmail({
  to,
  subject,
  texte,
  lien,
  bouton = "Ouvrir PYYJE",
}: {
  to: string;
  subject: string;
  texte: string;
  lien?: string | null;
  bouton?: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const url = lien ? (lien.startsWith("http") ? lien : siteUrl(lien)) : siteUrl();
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14304a">
      <p style="font-weight:800;font-size:20px;margin:0 0 24px;color:#14304a">pyyje</p>
      <p style="font-size:15px;line-height:1.5;margin:0 0 24px">${escapeHtml(texte)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#ffd84d;color:#14304a;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">${escapeHtml(bouton)}</a>
      <p style="font-size:12px;color:#888;margin:32px 0 0">Vous recevez cet email car vous avez un compte ou une proposition sur PYYJE.</p>
    </div>`;

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "PYYJE", email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: `${texte}\n\n${url}`,
      }),
    });
    if (!res.ok) console.error("sendEmail() error:", res.status, await res.text());
  } catch (e) {
    // Un email qui échoue ne doit jamais bloquer l'action de l'utilisateur.
    console.error("sendEmail() error:", e);
  }
}
