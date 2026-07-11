"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Download } from "lucide-react";

export default function StatementsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [statement, setStatement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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
    
    const loadStatement = async () => {
      setIsGenerating(true);
      try {
        const data = await api.getStatement(selectedAccount);
        setStatement(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    };
    
    loadStatement();
  }, [selectedAccount]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Statements</h1>
          <p className="text-gray-400 mt-1">View, print, or download your official statements.</p>
        </div>
        
        <div className="flex gap-4">
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
          <Button onClick={handlePrint} variant="outline" className="gap-2" disabled={!statement}>
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      {isGenerating ? (
        <Card className="py-20 flex justify-center items-center print:hidden">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </Card>
      ) : statement ? (
        <Card className="bg-white text-black border-none rounded-none sm:rounded-lg overflow-hidden print:shadow-none print:m-0">
          <CardContent className="p-8 sm:p-12">
            {/* Statement Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">FinVerse</h1>
                <p className="text-gray-500">Official Account Statement</p>
                <p className="text-gray-500 mt-4">Generated on {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-800">{statement.account.type} Account</h2>
                <p className="font-mono text-gray-600 mt-1">{statement.account.account_number}</p>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg inline-block">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Closing Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(statement.summary.closing_balance)}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deposits</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(statement.summary.total_deposits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Withdrawals</span>
                    <span className="font-medium text-rose-600">{formatCurrency(statement.summary.total_withdrawals)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table (Light theme for print) */}
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3">Description / ID</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statement.transactions.map((txn: Transaction) => {
                  const isCredit = txn.type.includes('IN') || txn.type === 'DEPOSIT';
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(txn.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{txn.description || txn.type}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{txn.id}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {!isCredit ? formatCurrency(txn.amount) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {isCredit ? formatCurrency(txn.amount) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(txn.balance_after)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {statement.transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No transactions recorded for this account.
              </div>
            )}
            
            <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-8">
              This is a computer generated statement and does not require a signature.
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
