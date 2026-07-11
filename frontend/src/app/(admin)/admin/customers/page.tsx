"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageLoader } from "@/components/ui/loading";
import { Search } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await api.adminGetCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, []);

  if (isLoading) return <PageLoader />;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers Directory</h1>
          <p className="text-gray-400 mt-1">Manage platform users.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search by name, email, or ID..." 
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
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="border-white/5">
                  <TableCell className="font-mono text-gray-400 text-sm">{customer.id}</TableCell>
                  <TableCell className="font-medium text-white">{customer.name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300">{customer.email}</div>
                    <div className="text-xs text-gray-500">{customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.role === 'admin' ? 'danger' : 'default'} className="text-[10px] uppercase">
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.is_active ? (
                      <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                    ) : (
                      <Badge variant="danger" className="text-[10px]">INACTIVE</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-gray-400 text-sm">
                    {formatDate(customer.created_at).split(',')[0]}
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No customers found matching your search.
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
