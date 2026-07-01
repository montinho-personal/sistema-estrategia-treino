import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Montinho Training Strategy",
    template: "%s · Montinho Training Strategy",
  },
  description:
    "Assistente estratégico para o Montinho Personal Trainer. Transforma uma anamnese em uma estratégia de treino extremamente profissional — o treinador decide, o sistema organiza e explica.",
  applicationName: "Montinho Training Strategy",
  authors: [{ name: "Renato Nascimento — Montinho Personal Trainer" }],
  openGraph: {
    title: "Montinho Training Strategy",
    description: "Estratégias inteligentes. Resultados consistentes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
