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

/** Logo oficial do Montinho — usado sempre que nenhum outro foi enviado. */
export const DEFAULT_LOGO = "/brand/montinho-logo.png";

/** Logo a exibir: o enviado pelo treinador ou o oficial. */
export function brandLogo(brand: Pick<Brand, "logo">): string {
  return brand.logo?.trim() ? brand.logo : DEFAULT_LOGO;
}

export const DEFAULT_BRAND: Brand = {
  nome: "Montinho Personal Trainer",
  whatsapp: "",
  site: "",
  instagram: "",
  logo: "",
};
