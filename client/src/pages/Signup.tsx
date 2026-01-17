import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { name: "", email: "", password: "", address: "", role: "user" },
  });

  const onSubmit = async (data: z.infer<typeof insertUserSchema>) => {
    try {
      await signup.mutateAsync(data);
      toast({
        title: "Account created!",
        description: "Please sign in with your credentials.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4 py-8">
      <Card className="w-full max-w-lg border-0 shadow-2xl shadow-indigo-500/10">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="font-display text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-base">
            Join the community to rate stores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name (20-60 characters)</Label>
              <Input 
                id="name" 
                placeholder="Johnathan Doe Smithington" 
                className="bg-secondary/50"
                {...form.register("name")} 
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="bg-secondary/50"
                {...form.register("email")} 
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password (8-16 chars, 1 Upper, 1 Special)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="SecurePass1!" 
                className="bg-secondary/50"
                {...form.register("password")} 
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea 
                id="address" 
                placeholder="123 Main St, City, Country" 
                className="bg-secondary/50 min-h-[80px]"
                {...form.register("address")} 
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full text-base font-semibold h-11 shadow-lg shadow-primary/25"
              disabled={signup.isPending}
            >
              {signup.isPending ? "Creating Account..." : "Create Account"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
