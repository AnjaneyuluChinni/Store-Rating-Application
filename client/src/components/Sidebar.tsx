import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  LogOut, 
  ShieldCheck,
  ShoppingBag
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/stores", label: "Stores", icon: Store },
        ];
      case "owner":
        return [
          { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ];
      case "user":
        return [
          { href: "/stores", label: "Browse Stores", icon: ShoppingBag },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-8 shadow-xl">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">RateMyStore</h1>
          <p className="text-xs text-muted-foreground capitalize">{user.role} Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-6">
        <div className="mb-4 px-2">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
