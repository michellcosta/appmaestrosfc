import {Routes, Route, Routes,  Route,  Routes, Route } from "react-router-dom";
import Match from "src/pages/Match";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import { Matches } from "./pages/Matches";
import { Match } from "./pages/Match";
import { Financial } from "./pages/Financial";
import { Ranking } from "./pages/Ranking";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout><Matches /></AppLayout>} path="/" />
          <Route element={<AppLayout><Match /></AppLayout>} path="/match" />
          <Route element={<AppLayout><Financial /></AppLayout>} path="/financial" />
          <Route element={<AppLayout><Ranking /></AppLayout>} path="/ranking" />
          <Route element={<AppLayout><Chat /></AppLayout>} path="/chat" />
          <Route element={<AppLayout><Profile /></AppLayout>} path="/profile" />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/match" element={<Match />} />
</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
