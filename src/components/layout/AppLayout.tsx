import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { GlobalAIChat } from "./GlobalAIChat";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      <GlobalAIChat />
    </div>
  );
}
