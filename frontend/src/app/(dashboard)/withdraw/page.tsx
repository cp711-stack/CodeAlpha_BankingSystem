"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { ArrowUpRight } from "lucide-react";

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    account_number: "",
    amount: "",
    description: ""
  });
  
  const [status, setStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await api.getAccounts();
        const activeAccounts = data.filter(a => a.status === 'ACTIVE');
        setAccounts(activeAccounts);
        if (activeAccounts.length > 0) {
          setFormData(prev => ({ ...prev, account_number: activeAccounts[0].account_number }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await api.withdraw({
        account_number: formData.account_number,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined
      });
      
      setStatus({ type: 'success', message: 'Withdrawal completed successfully!' });
      setFormData(prev => ({ ...prev, amount: "", description: "" }));
      
      // Refresh balances
      const data = await api.getAccounts();
      setAccounts(data.filter(a => a.status === 'ACTIVE'));
      
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Withdrawal failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAccount = accounts.find(a => a.account_number === formData.account_number);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
        <p className="text-gray-400 mt-1">Securely withdraw money from your accounts.</p>
      </div>

      <Card className="border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ArrowUpRight className="w-48 h-48" />
        </div>
        
        <CardHeader>
          <CardTitle>Withdrawal Details</CardTitle>
          <CardDescription>Enter the amount and reason for your withdrawal.</CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <div className={`mb-6 p-4 rounded-xl border ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">From Account</label>
              <Select 
                value={formData.account_number}
                onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.account_number} value={acc.account_number}>
                    {acc.type} - {acc.account_number} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </Select>
              {selectedAccount && selectedAccount.type === 'SAVINGS' && (
                <p className="text-xs text-amber-400">
                  Savings accounts must maintain a minimum balance of ₹500.00
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <Input 
                  type="number"
                  min="1"
                  step="0.01"
                  className="pl-8 text-lg font-medium"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Reason for Withdrawal (Optional)</label>
              <Input 
                placeholder="e.g. Groceries, Bills, Entertainment..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                maxLength={50}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg mt-4 gap-2" 
              disabled={!formData.account_number || !formData.amount || isSubmitting}
              isLoading={isSubmitting}
            >
              <ArrowUpRight size={18} />
              Confirm Withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
