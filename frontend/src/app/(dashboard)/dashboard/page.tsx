"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Account, Transaction, SpendingResponse, HealthScoreResponse } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor, getTransactionTypeColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Wallet, Activity } from "lucide-react";
import { SpendingChart } from "@/components/charts/spending-chart";
import { HealthGauge } from "@/components/charts/health-gauge";

export default function DashboardPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spending, setSpending] = useState<SpendingResponse | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const custStr = localStorage.getItem("customer");
    if (custStr) setCustomer(JSON.parse(custStr));

    const loadDashboardData = async () => {
      try {
        const accs = await api.getAccounts();
        setAccounts(accs);

        if (accs.length > 0) {
          // Get transactions for the first account
          const txns = await api.getTransactions(accs[0].account_number);
          setTransactions(txns.slice(0, 5)); // Last 5
        }

        const spendData = await api.getSpending();
        setSpending(spendData);

        const healthData = await api.getHealthScore();
        setHealthScore(healthData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) return <PageLoader />;

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Total Balance */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {customer?.name.split(" ")[0]}!</h2>
          <p className="text-gray-400">Here's your financial overview for today.</p>
        </div>
        <Card className="bg-gradient-primary border-none shadow-xl shadow-primary/20">
          <CardContent className="p-6 sm:px-8">
            <p className="text-sm font-medium text-white/80">Total Balance</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatCurrency(totalBalance)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Accounts Summary */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map(account => (
              <Card key={account.account_number} className="hover:scale-[1.02] transition-transform">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      {account.type}
                    </CardTitle>
                    <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                  </div>
                  <CardDescription className="text-xs uppercase tracking-wider">{account.account_number}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</div>
                </CardContent>
              </Card>
            ))}
            
            {accounts.length === 0 && (
              <Card className="col-span-full border-dashed border-white/20 bg-transparent flex flex-col items-center justify-center p-8">
                <p className="text-gray-400 mb-4">You don't have any accounts yet.</p>
                <Link href="/accounts" className="text-primary hover:underline">Create Account</Link>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link href="/transfers" className="glass-card flex flex-col items-center justify-center gap-2 p-4 hover:bg-white/10 transition-colors">
              <div className="rounded-full bg-primary/20 p-3 text-primary"><ArrowRight size={20} /></div>
              <span className="text-sm font-medium text-white">Transfer</span>
            </Link>
            <Link href="/deposit" className="glass-card flex flex-col items-center justify-center gap-2 p-4 hover:bg-white/10 transition-colors">
              <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-400"><ArrowDownLeft size={20} /></div>
              <span className="text-sm font-medium text-white">Deposit</span>
            </Link>
            <Link href="/withdraw" className="glass-card flex flex-col items-center justify-center gap-2 p-4 hover:bg-white/10 transition-colors">
              <div className="rounded-full bg-rose-500/20 p-3 text-rose-400"><ArrowUpRight size={20} /></div>
              <span className="text-sm font-medium text-white">Withdraw</span>
            </Link>
            <Link href="/statements" className="glass-card flex flex-col items-center justify-center gap-2 p-4 hover:bg-white/10 transition-colors">
              <div className="rounded-full bg-secondary/20 p-3 text-secondary"><Activity size={20} /></div>
              <span className="text-sm font-medium text-white">Statements</span>
            </Link>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-sm text-primary hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {transactions.map(txn => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${txn.type.includes('IN') || txn.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {txn.type.includes('IN') || txn.type === 'DEPOSIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{txn.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{formatDate(txn.created_at)}</span>
                            {txn.category && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] py-0">{txn.category}</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${getTransactionTypeColor(txn.type)}`}>
                        {txn.type.includes('IN') || txn.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-4">No recent transactions found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Health Score */}
          <Card className="bg-gradient-to-b from-[#1a1a2e] to-background border-primary/20">
            <CardHeader className="text-center pb-0">
              <CardTitle>Financial Health</CardTitle>
              <CardDescription>Your AI-calculated health score</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {healthScore ? (
                <>
                  <HealthGauge score={healthScore.score} />
                  <p className="text-center text-sm text-gray-300 mt-2 px-4">
                    {healthScore.recommendations[0] || `Your financial health is looking ${healthScore.grade.toLowerCase()}.`}
                  </p>
                  <Link href="/health-score" className="mt-4 text-sm text-primary hover:underline">View detailed report</Link>
                </>
              ) : (
                <p className="text-gray-500 py-10">Data unavailable</p>
              )}
            </CardContent>
          </Card>

          {/* Spending */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Spending Highlights</CardTitle>
              <CardDescription>This month's breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {spending && spending.categories.length > 0 ? (
                <>
                  <div className="h-48 mt-4 -mx-4">
                    <SpendingChart data={spending.categories} />
                  </div>
                  <Link href="/analytics" className="block text-center mt-2 text-sm text-primary hover:underline">Explore analytics</Link>
                </>
              ) : (
                <p className="text-gray-500 text-center py-10">No spending data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
