"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { EMIResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Calculator } from "lucide-react";

export default function EMICalculatorPage() {
  const [principal, setPrincipal] = useState<number>(1000000); // 10 Lakhs
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(60); // 5 years
  const [result, setResult] = useState<EMIResult | null>(null);
  
  // Debounce API calls
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const data = await api.calculateEMI({
          principal,
          annual_rate: rate,
          tenure_months: tenure
        });
        setResult(data);
      } catch (err) {
        console.error("EMI calc failed", err);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [principal, rate, tenure]);

  const chartData = result ? [
    { name: 'Principal', value: Number(principal) },
    { name: 'Interest', value: Number(result.total_interest) }
  ] : [];

  const COLORS = ['#0ea5e9', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">EMI Calculator</h1>
        <p className="text-gray-400 mt-1">Plan your loans with our C++ powered financial engine.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Parameters</CardTitle>
            <CardDescription>Adjust the sliders to see real-time calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-gray-300">Loan Amount</label>
                <span className="text-xl font-bold text-white">{formatCurrency(principal)}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="10000000" 
                step="10000"
                value={principal} 
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10K</span>
                <span>1Cr</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-gray-300">Interest Rate (% p.a.)</label>
                <span className="text-xl font-bold text-white">{rate.toFixed(1)}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="0.1"
                value={rate} 
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-gray-300">Tenure (Months)</label>
                <span className="text-xl font-bold text-white">{tenure} Mo ({(tenure/12).toFixed(1)} Yrs)</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="360" 
                step="1"
                value={tenure} 
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>6 Mo</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary mb-4">
                <Calculator size={24} />
              </div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Monthly EMI</p>
              <h2 className="text-4xl font-bold text-white">
                {result ? formatCurrency(result.emi) : "..."}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {result && (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-40 w-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4 flex-1 w-full">
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
                        <span className="text-sm text-gray-400">Principal</span>
                      </div>
                      <span className="font-semibold text-white">{formatCurrency(principal)}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                        <span className="text-sm text-gray-400">Total Interest</span>
                      </div>
                      <span className="font-semibold text-white">{formatCurrency(result.total_interest)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-sm text-gray-400 font-medium">Total Payment</span>
                      <span className="font-bold text-white">{formatCurrency(result.total_payment)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
