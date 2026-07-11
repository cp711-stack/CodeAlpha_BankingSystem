"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await api.adminGetFraudAlerts();
        setAlerts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-rose-500" />
          Fraud Intelligence
        </h1>
        <p className="text-gray-400 mt-1">AI-detected anomalies and suspicious activities.</p>
      </div>

      {alerts.length === 0 ? (
        <Card className="bg-[#12121a] border-white/5 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Active Alerts</h2>
            <p className="text-gray-400 max-w-md">
              The AI fraud detection system has not flagged any suspicious transactions recently. 
              All systems are operating normally.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Implement alert rendering here when backend produces alerts */}
          <p className="text-white">Alerts found: {alerts.length}</p>
        </div>
      )}
    </div>
  );
}
