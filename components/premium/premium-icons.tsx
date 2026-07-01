import type { ReactElement } from "react";

/** Ícones minimalistas do documento premium (mesmo estilo, stroke 1.6). */
const PATHS: Record<string, ReactElement> = {
  target: (<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>),
  medal: (<><circle cx="12" cy="14" r="6" /><path d="M8.5 8.5 6 3h12l-2.5 5.5" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>),
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />,
  dumbbell: <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />,
  trend: <path d="M3 17l6-6 4 4 7-7M14 8h6v6" />,
  mobility: (<><circle cx="12" cy="5" r="2" /><path d="M12 8v6M8 21l4-7 4 7M6 11h12" /></>),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></>),
  instagram: (<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" /></>),
};

export function PgIcon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      {PATHS[name]}
    </svg>
  );
}

export function PgCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}
