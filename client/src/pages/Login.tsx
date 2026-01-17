import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@shared/routes";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = api.auth.login.input;

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login.mutateAsync(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-500/10">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-display text-3xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Sign in to manage your stores and ratings
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Email Address</Label>
              <Input 
                id="username" 
                type="email" 
                placeholder="name@example.com" 
                className="h-11 bg-secondary/50"
                {...form.register("username")} 
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-11 bg-secondary/50"
                {...form.register("password")} 
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="h-11 w-full text-base font-semibold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
                Create account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
