import { useState } from "react";
import { useAdminUsers, useCreateUser } from "@/hooks/use-admin";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, userRoles } from "@shared/schema";
import { Loader2, Plus, Search, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function UsersList() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { data: users, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage system access and roles</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {userRoles.map(role => (
              <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin inline" />
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {user.address ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {user.address}
                      </span>
                    ) : (
                      <span className="italic text-xs">No address</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      Edit
                    </Button>
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

function RoleBadge({ role }: { role: string }) {
  const styles = {
    admin: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
    owner: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    user: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  };
  return (
    <Badge variant="outline" className={`capitalize font-normal ${styles[role as keyof typeof styles]}`}>
      {role}
    </Badge>
  );
}

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createUser = useCreateUser();
  
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { name: "", email: "", password: "", address: "", role: "user" },
  });

  const onSubmit = async (data: z.infer<typeof insertUserSchema>) => {
    try {
      await createUser.mutateAsync(data);
      toast({ title: "User created successfully" });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label>Full Name (20-60 chars)</Label>
              <Input {...form.register("name")} placeholder="Enter full name" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} placeholder="email@example.com" />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...form.register("password")} placeholder="••••••••" />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                onValueChange={(val) => form.setValue("role", val as any)} 
                defaultValue="user"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address (Optional)</Label>
            <Textarea {...form.register("address")} placeholder="Full address" />
            {form.formState.errors.address && (
              <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
