import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/components/Login";
import { Chat } from "@/pages/Chat";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

function MainRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Starting Duck App...</p>
      </div>
    );
  }

  // If user is authenticated, render the Chat App, otherwise Login
  return (
    <AnimatePresence mode="wait">
      {user ? <Chat key="chat" /> : <Login key="login" />}
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <MainRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
