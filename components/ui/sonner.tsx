"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[26px] !border-none !bg-primary !text-primary-foreground !shadow-lg !text-sm !font-medium",
          description: "!text-primary-foreground/75 !font-normal",
          actionButton: "!h-auto !rounded-full !bg-gold !px-3 !py-1.5 !text-[13px] !font-semibold !text-black",
        },
      }}
    />
  );
}
