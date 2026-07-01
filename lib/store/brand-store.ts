import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_BRAND, type Brand } from "@/lib/domain/schema";
import { jsonStorage } from "./storage";

interface BrandStore {
  brand: Brand;
  setBrand: (brand: Brand) => void;
  resetBrand: () => void;
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set) => ({
      brand: { ...DEFAULT_BRAND },
      setBrand: (brand) => set({ brand }),
      resetBrand: () => set({ brand: { ...DEFAULT_BRAND } }),
    }),
    { name: "mts.brand.v2", storage: jsonStorage },
  ),
);
