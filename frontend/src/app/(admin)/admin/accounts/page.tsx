"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/lib/types";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageLoader } from "@/components/ui/loading";
import { Search, Lock, Unlock } from "lucide-react";

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      const data = await api.adminGetAccounts();
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

  const handleToggleFreeze = async (accountNumber: string, isFrozen: boolean) => {
    setActionLoading(accountNumber);
    try {
      if (isFrozen) {
        await api.adminUnfreezeAccount(accountNumber);
      } else {
        await api.adminFreezeAccount(accountNumber);
      }
      await loadAccounts();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <PageLoader />;

  const filteredAccounts = accounts.filter(a => 
    a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts Management</h1>
          <p className="text-gray-400 mt-1">Monitor and manage all customer accounts.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search AC or CUST ID..." 
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead>Account Number</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map(account => {
                const isFrozen = account.status === "FROZEN";
                return (
                  <TableRow key={account.account_number} className="border-white/5">
                    <TableCell className="font-mono text-white font-medium">
                      {account.account_number}
                    </TableCell>
                    <TableCell className="font-mono text-gray-400 text-sm">
                      {account.customer_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{account.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-white">
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isFrozen ? "outline" : "danger"}
                        className="h-8 gap-1"
                        isLoading={actionLoading === account.account_number}
                        onClick={() => handleToggleFreeze(account.account_number, isFrozen)}
                      >
                        {isFrozen ? (
                          <><Unlock size={14} /> Unfreeze</>
                        ) : (
                          <><Lock size={14} /> Freeze</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
