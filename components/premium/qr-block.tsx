"use client";

import { useState } from "react";

import { qrImageUrl } from "@/lib/premium/links";

/** QR Code escaneável (via serviço de imagem) com fallback offline elegante. */
export function QrBlock({ data, label, size = 140 }: { data: string; label: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!data) return null;
  return (
    <div className="pg-qr">
      {failed ? (
        <div className="pg-qr__ph" style={{ width: size, height: size }}>
          <span>QR</span>
        </div>
      ) : (
        // QR de serviço externo, também usado na exportação HTML — next/image não se aplica.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="pg-qr__img"
          width={size}
          height={size}
          alt={`QR Code ${label}`}
          src={qrImageUrl(data, size)}
          onError={() => setFailed(true)}
        />
      )}
      {label && <div className="pg-qr__lbl">{label}</div>}
    </div>
  );
}
