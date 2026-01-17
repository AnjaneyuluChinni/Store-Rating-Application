import { useState } from "react";
import { usePublicStores, useSubmitRating } from "@/hooks/use-stores";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Store as StoreIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function StoreBrowser() {
  const [search, setSearch] = useState("");
  const { data: stores, isLoading } = usePublicStores({
    search: search || undefined,
  });
  const submitRating = useSubmitRating();
  const { toast } = useToast();

  const handleRate = async (storeId: number, rating: number) => {
    try {
      await submitRating.mutateAsync({ storeId, rating });
      toast({ title: "Rating submitted!", description: "Thanks for your feedback." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Failed to submit rating", 
        description: error.message 
      });
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center max-w-2xl mx-auto py-8">
        <h2 className="font-display text-4xl font-bold tracking-tight mb-4">Discover Stores</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Browse our curated list of stores and share your experiences through ratings.
        </p>
        
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by store name or address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 text-lg shadow-lg border-border/50 bg-card rounded-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : stores?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">No stores match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Card key={store.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="h-2 bg-gradient-to-r from-primary to-purple-400" />
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold mb-1 truncate" title={store.name}>
                    {store.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground min-h-[40px]">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Average</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{store.averageRating.toFixed(1)}</span>
                      <StarRating rating={Math.round(store.averageRating)} readOnly size="sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Your Rating</span>
                      {store.myRating && (
                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                          Submitted
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center p-2 border rounded-lg hover:bg-secondary/20 transition-colors">
                      <StarRating 
                        rating={store.myRating || 0} 
                        onRate={(r) => handleRate(store.id, r)}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
