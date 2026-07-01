import { z } from "zod";

/** Identidade da marca usada no PDF premium (capa, rodapé, QR Codes). */
export const BrandSchema = z.object({
  nome: z.string().default("Montinho Personal Trainer"),
  whatsapp: z.string().default(""),
  site: z.string().default(""),
  instagram: z.string().default(""),
  /** Logo do treinador (data URL da imagem, salvo apenas no navegador). */
  logo: z.string().default(""),
});

export type Brand = z.infer<typeof BrandSchema>;

export const DEFAULT_BRAND: Brand = {
  nome: "Montinho Personal Trainer",
  whatsapp: "",
  site: "",
  instagram: "",
  logo: "",
};
