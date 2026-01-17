import { Sidebar } from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-secondary/30">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto max-w-7xl p-6 lg:p-10">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
