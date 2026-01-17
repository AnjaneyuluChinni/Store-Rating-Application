import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminDashboard from "@/pages/admin/Dashboard";
import UsersList from "@/pages/admin/UsersList";
import StoresList from "@/pages/admin/StoresList";
import StoreBrowser from "@/pages/user/StoreBrowser";
import OwnerDashboard from "@/pages/owner/Dashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  component: Component, 
  roles = [] 
}: { 
  component: React.ComponentType, 
  roles?: string[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard if unauthorized
    if (user.role === 'admin') return <Redirect to="/admin/dashboard" />;
    if (user.role === 'owner') return <Redirect to="/owner/dashboard" />;
    return <Redirect to="/stores" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* Root Redirect */}
      <Route path="/">
        {() => {
          const { user, isLoading } = useAuth();
          if (isLoading) return null;
          if (!user) return <Redirect to="/login" />;
          if (user.role === 'admin') return <Redirect to="/admin/dashboard" />;
          if (user.role === 'owner') return <Redirect to="/owner/dashboard" />;
          return <Redirect to="/stores" />;
        }}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} roles={['admin']} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={UsersList} roles={['admin']} />}
      </Route>
      <Route path="/admin/stores">
        {() => <ProtectedRoute component={StoresList} roles={['admin']} />}
      </Route>

      {/* User Routes */}
      <Route path="/stores">
        {() => <ProtectedRoute component={StoreBrowser} roles={['user', 'admin']} />}
      </Route>

      {/* Owner Routes */}
      <Route path="/owner/dashboard">
        {() => <ProtectedRoute component={OwnerDashboard} roles={['owner', 'admin']} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
