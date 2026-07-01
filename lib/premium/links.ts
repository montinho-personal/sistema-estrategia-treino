/** Normaliza número de WhatsApp e handle do Instagram em links. */

export function whatsappLink(num: string): string {
  const digits = String(num ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function instagramLink(handle: string): string {
  const h = String(handle ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/$/, "");
  return h ? `https://instagram.com/${h}` : "";
}

export function qrImageUrl(data: string, size = 150): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;
}
