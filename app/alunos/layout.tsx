import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { Stepper } from "@/components/workspace/stepper";
import { Toaster } from "@/components/ui/sonner";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceNav />
      <Stepper />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <Toaster />
    </div>
  );
}
