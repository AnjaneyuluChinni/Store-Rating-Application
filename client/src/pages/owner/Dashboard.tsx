import { useOwnerDashboard } from "@/hooks/use-owner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Users } from "lucide-react";

export default function OwnerDashboard() {
  const { data: stores, isLoading } = useOwnerDashboard();

  if (isLoading) return <OwnerSkeleton />;
  if (!stores || stores.length === 0) return <EmptyState />;

  return (
    <div className="space-y-10 animate-in">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Owner Dashboard</h2>
        <p className="text-muted-foreground mt-2">Monitor ratings and customer feedback for your stores</p>
      </div>

      {stores.map((store, index) => (
        <div key={index} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <h3 className="font-display text-2xl font-semibold flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              {store.storeName}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200">
                <span className="font-bold">{store.averageRating.toFixed(1)}</span>
                <StarRating rating={Math.round(store.averageRating)} readOnly size="sm" />
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
                <Users className="h-4 w-4" />
                <span className="font-bold">{store.ratings.length} Ratings</span>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.ratings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No ratings yet for this store.
                      </TableCell>
                    </TableRow>
                  ) : (
                    store.ratings.map((rating, i) => (
                      <TableRow key={i} className="hover:bg-muted/30">
                        <TableCell className="pl-6 font-medium">{rating.userName}</TableCell>
                        <TableCell>
                          <StarRating rating={rating.rating} readOnly size="sm" />
                        </TableCell>
                        <TableCell className="text-muted-foreground italic">
                          {rating.rating >= 4 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Positive</Badge>
                          ) : rating.rating <= 2 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Negative</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Neutral</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Store className="h-12 w-12 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">No Stores Found</h2>
      <p className="text-muted-foreground max-w-md">
        You don't have any stores associated with your account yet. Contact an administrator to get set up.
      </p>
    </div>
  );
}

function OwnerSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
