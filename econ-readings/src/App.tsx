import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Home } from "@/pages/Home";
import { Reading } from "@/pages/Reading";
import { ProgressProvider } from "@/components/ProgressProvider";
import { BookOpen, Menu } from "lucide-react";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground">
        Pick a reading from the sidebar to get started.
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/:unitSlug/:sectionSlug">
        {(params) => (
          <Reading
            unitSlug={params.unitSlug!}
            sectionSlug={params.sectionSlug!}
          />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {/* Mobile-only top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center h-14 px-4 bg-sidebar border-b border-sidebar-border no-print">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BookOpen className="ml-3 h-5 w-5 text-secondary" />
          <span className="ml-2 text-sidebar-foreground font-bold text-base leading-tight">
            Economics
          </span>
        </div>

        <div className="flex bg-background min-h-screen">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 min-w-0">
            <AppRoutes />
          </main>
        </div>
      </WouterRouter>
      </ProgressProvider>
    </QueryClientProvider>
  );
}

export default App;
