import { useAdminDashboard } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Platform statistics and metrics</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total Users" 
          value={data.totalUsers} 
          icon={Users} 
          color="text-blue-500" 
          bg="bg-blue-500/10"
        />
        <StatsCard 
          title="Total Stores" 
          value={data.totalStores} 
          icon={Store} 
          color="text-purple-500" 
          bg="bg-purple-500/10"
        />
        <StatsCard 
          title="Total Ratings" 
          value={data.totalRatings} 
          icon={Star} 
          color="text-yellow-500" 
          bg="bg-yellow-500/10"
        />
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
