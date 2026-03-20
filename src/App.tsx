import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MovieDetail from "./pages/MovieDetail";
import SearchPage from "./pages/SearchPage";
import WatchPage from "./pages/WatchPage";
import TrendingPage from "./pages/TrendingPage";
import WatchlistPage from "./pages/WatchlistPage";
import GenrePage from "./pages/GenrePage";
import HotPage from "./pages/HotPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/hot" element={<HotPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/genres" element={<GenrePage />} />
          <Route path="/genres/:genre" element={<GenrePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
