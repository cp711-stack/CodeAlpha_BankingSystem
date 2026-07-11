"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HealthScoreResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import { HealthGauge } from "@/components/charts/health-gauge";
import { Target, TrendingUp, Shuffle, DollarSign, Lightbulb } from "lucide-react";

export default function HealthScorePage() {
  const [data, setData] = useState<HealthScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getHealthScore();
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load health score data.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Health Score</h1>
        <p className="text-gray-400 mt-1">AI-driven analysis of your financial habits and stability.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-[#12121a] border-primary/20 flex flex-col items-center justify-center p-6 text-center">
          <HealthGauge score={data.score} />
          <h2 className="text-2xl font-bold text-white mt-4">{data.grade} Standing</h2>
          <p className="text-sm text-gray-400 mt-2">Based on your activity over the last 30 days compared to optimal financial patterns.</p>
        </Card>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="bg-white/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Target size={18} />
                <CardTitle className="text-sm">Savings Ratio</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(data.breakdown.savings_ratio * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">Income saved this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp size={18} />
                <CardTitle className="text-sm">Balance Growth</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(data.breakdown.balance_growth * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">MoM balance increase</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-rose-400">
                <Shuffle size={18} />
                <CardTitle className="text-sm">Expense Volatility</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(data.breakdown.expense_volatility * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">Lower is better</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-secondary">
                <DollarSign size={18} />
                <CardTitle className="text-sm">Category Diversity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(data.breakdown.category_diversity * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-1">Spread of expenses</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-amber-400" size={20} />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
          <CardDescription>Personalized tips based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-4">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="text-gray-300 pt-1 leading-relaxed">{rec}</p>
              </li>
            ))}
            {data.recommendations.length === 0 && (
              <p className="text-gray-500">No specific recommendations at this time.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
