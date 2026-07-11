"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Wallet, ShieldAlert, LogOut, Shield, Menu, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Accounts", href: "/admin/accounts", icon: Wallet },
  { name: "Fraud Alerts", href: "/admin/fraud", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const custStr = localStorage.getItem("customer");
    
    if (!token || !custStr) {
      router.replace("/login");
      return;
    }
    
    const customer = JSON.parse(custStr);
    if (customer.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    
    setAdmin(customer);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    router.push("/login");
  };

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-[#050508]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-rose-500/10 bg-[#0a0a0f] lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-rose-500/10">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold text-white tracking-wide uppercase text-sm">FinVerse Admin</span>
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
                      ? "bg-rose-500/10 text-rose-400" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-rose-400" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="mt-8 pt-4 border-t border-white/5">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
                Exit to App
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="border-t border-rose-500/10 p-4 bg-rose-500/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white font-bold">
              {admin.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{admin.name}</p>
              <p className="truncate text-xs text-rose-400">System Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-rose-500/10 bg-background/50 px-6 backdrop-blur-xl">
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-4 text-sm font-bold text-rose-500 uppercase tracking-wide">Admin</span>
          </div>
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-medium text-white capitalize">
              {pathname.split("/").pop() === "admin" ? "Overview" : pathname.split("/").pop()}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
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
          <div className="absolute inset-y-0 left-0 w-64 bg-[#0a0a0f] border-r border-rose-500/10 shadow-2xl animate-fade-in flex flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-rose-500/10">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">FinVerse Admin</span>
              </div>
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
                          ? "bg-rose-500/10 text-rose-400" 
                          : "text-gray-400 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-rose-400" : "text-gray-400")} />
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
