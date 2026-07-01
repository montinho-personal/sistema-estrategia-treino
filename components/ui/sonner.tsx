"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-full !border-none !bg-primary !text-primary-foreground !shadow-lg !text-sm !font-medium",
        },
      }}
    />
  );
}
