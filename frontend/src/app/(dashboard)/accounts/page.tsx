"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoader } from "@/components/ui/loading";
import { Plus, Wallet, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    type: "SAVINGS",
    initial_deposit: "500.00"
  });
  const [error, setError] = useState("");

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      await api.createAccount({
        type: newAccount.type,
        initial_deposit: parseFloat(newAccount.initial_deposit)
      });
      setIsModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Accounts</h1>
          <p className="text-gray-400 mt-1">Manage your checking and savings accounts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={18} />
          <span>Open Account</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(account => (
          <Card key={account.account_number} className="relative overflow-hidden group">
            {/* Decorative background element */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20 ${
              account.type === 'SAVINGS' ? 'from-emerald-500 to-teal-500' : 'from-primary to-indigo-500'
            }`} />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                    {account.type}
                  </Badge>
                  <CardTitle className="font-mono tracking-wider text-gray-300 text-sm mt-1">
                    {account.account_number}
                  </CardTitle>
                </div>
                <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {formatCurrency(account.balance)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                Opened {formatDate(account.created_at)}
              </p>
            </CardContent>
            <CardFooter className="pt-2 border-t border-white/5 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 text-xs" asChild>
                <Link href="/transactions">View History</Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-xs" asChild>
                <Link href="/statements">Statements</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Wallet className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No accounts found</h3>
            <p className="text-gray-400 mb-6">Open your first account to get started with FinVerse.</p>
            <Button onClick={() => setIsModalOpen(true)}>Open an Account</Button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isCreating && setIsModalOpen(false)}
        title="Open New Account"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Account Type</label>
            <Select 
              value={newAccount.type}
              onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
              required
            >
              <option value="SAVINGS">Savings Account</option>
              <option value="CURRENT">Current Account</option>
            </Select>
            {newAccount.type === "SAVINGS" && (
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                Note: Savings accounts require a minimum deposit of ₹500.00
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Initial Deposit (₹)</label>
            <Input 
              type="number"
              min={newAccount.type === "SAVINGS" ? "500" : "0"}
              step="0.01"
              value={newAccount.initial_deposit}
              onChange={(e) => setNewAccount({...newAccount, initial_deposit: e.target.value})}
              required
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Open Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
