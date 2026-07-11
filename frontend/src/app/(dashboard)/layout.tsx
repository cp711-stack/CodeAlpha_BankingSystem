"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Wallet, ArrowLeftRight, FileText, Calculator, BarChart3, Heart, Shield, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { name: "Statements", href: "/statements", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Health Score", href: "/health-score", icon: Heart },
  { name: "EMI Calculator", href: "/emi-calculator", icon: Calculator },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [customer, setCustomer] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const custStr = localStorage.getItem("customer");
    
    if (!token || !custStr) {
      router.replace("/login");
      return;
    }
    
    setCustomer(JSON.parse(custStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    router.push("/login");
  };

  if (!customer) return null; // or a loading spinner

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-white/[0.02] lg:flex">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-white">FinVerse</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary-light" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
            
            {customer.role === "admin" && (
              <>
                <div className="mt-8 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Admin
                </div>
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith("/admin") 
                      ? "bg-rose-500/10 text-rose-400" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-white font-bold">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{customer.name}</p>
              <p className="truncate text-xs text-gray-400">{customer.id}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-background/50 px-6 backdrop-blur-xl">
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-4 text-lg font-bold text-white">FinVerse</span>
          </div>
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-medium text-white capitalize">
              {pathname.split("/")[1] || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[#12121a] shadow-2xl animate-fade-in flex flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
              <span className="text-xl font-bold text-white">FinVerse</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary-light" 
                          : "text-gray-400 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
