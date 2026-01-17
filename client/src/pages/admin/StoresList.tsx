import { useState } from "react";
import { useAdminStores, useCreateStore } from "@/hooks/use-admin";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoreSchema } from "@shared/schema";
import { Loader2, Plus, Search, MapPin, Mail } from "lucide-react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/StarRating";

export default function StoresList() {
  const [search, setSearch] = useState("");
  const { data: stores, isLoading } = useAdminStores({
    search: search || undefined,
  });

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Store Management</h2>
          <p className="text-muted-foreground mt-1">Add and manage store locations</p>
        </div>
        <CreateStoreDialog />
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search stores..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Avg Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin inline" />
                  Loading stores...
                </TableCell>
              </TableRow>
            ) : stores?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No stores found.
                </TableCell>
              </TableRow>
            ) : (
              stores?.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" /> {store.email}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3" /> {store.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    {store.rating > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{store.rating.toFixed(1)}</span>
                        <StarRating rating={Math.round(store.rating)} readOnly size="sm" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No ratings</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateStoreDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createStore = useCreateStore();
  
  const form = useForm<z.infer<typeof insertStoreSchema>>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: { name: "", email: "", address: "" },
  });

  const onSubmit = async (data: z.infer<typeof insertStoreSchema>) => {
    try {
      await createStore.mutateAsync(data);
      toast({ title: "Store created successfully" });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating store",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" /> Add Store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Store Name (20-60 chars)</Label>
            <Input {...form.register("name")} placeholder="Store Name" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} placeholder="store@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea {...form.register("address")} placeholder="Store address" />
            {form.formState.errors.address && (
              <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createStore.isPending}>
              {createStore.isPending ? "Adding Store..." : "Add Store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
