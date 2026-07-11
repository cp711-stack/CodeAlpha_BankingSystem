"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account, Transaction } from "@/lib/types";
import { formatCurrency, formatDate, getTransactionTypeColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react";

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTxnLoading, setIsTxnLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await api.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccount(data[0].account_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    
    const loadTransactions = async () => {
      setIsTxnLoading(true);
      try {
        const data = await api.getTransactions(selectedAccount);
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTxnLoading(false);
      }
    };
    
    loadTransactions();
  }, [selectedAccount]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">View and filter your transaction history.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <Select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            disabled={accounts.length === 0}
          >
            {accounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              accounts.map(acc => (
                <option key={acc.account_number} value={acc.account_number}>
                  {acc.type} - {acc.account_number}
                </option>
              ))
            )}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>History</CardTitle>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isTxnLoading ? (
            <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div></div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              No transactions found for this account.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(txn => {
                  const isCredit = txn.type.includes('IN') || txn.type === 'DEPOSIT';
                  
                  return (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className={`p-2 rounded-full inline-flex ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white">{txn.description || txn.type}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{txn.id}</div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatDate(txn.created_at)}
                      </TableCell>
                      <TableCell>
                        {txn.category ? (
                          <Badge variant="outline" className="text-xs py-0.5">{txn.category}</Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getTransactionTypeColor(txn.type)}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {formatCurrency(txn.balance_after)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
