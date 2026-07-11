"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await api.login(formData);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("customer", JSON.stringify(data.customer));
      
      if (data.customer.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 shadow-2xl shadow-primary/10">
      <CardHeader className="space-y-3 text-center pt-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/20">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-white">FinVerse</CardTitle>
        <CardDescription>Welcome back to next-generation banking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              name="password"
              type="password"
              placeholder="Password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-6" size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Register now
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
