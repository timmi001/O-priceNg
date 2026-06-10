import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Sell from "@/pages/sell";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Messages from "@/pages/messages";
import Chat from "@/pages/chat";
import ListingDetail from "@/pages/listing";
import SellerProfile from "@/pages/seller";
import Categories from "@/pages/categories";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/sell" component={Sell} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={Chat} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/seller/:username" component={SellerProfile} />
      <Route path="/categories" component={Categories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
