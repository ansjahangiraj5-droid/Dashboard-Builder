"use client";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import {
  Database, BarChart3, Lightbulb, FileText, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  datasets: number;
  dashboards: number;
  insights: number;
  reports: number;
}

interface Dataset {
  id: string;
  name: string;
  status: string;
  rowCount: number | null;
  fileSize: number;
  updatedAt: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  delta?: number;
}) {
  const TrendIcon = delta === undefined ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {TrendIcon && delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${delta > 0 ? "text-green-500" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(delta)}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Link>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    READY: "bg-green-500/10 text-green-500",
    PROCESSING: "bg-yellow-500/10 text-yellow-500",
    PENDING: "bg-blue-500/10 text-blue-500",
    FAILED: "bg-red-500/10 text-red-500",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ datasets: 0, dashboards: 0, insights: 0, reports: 0 });
  const [recentDatasets, setRecentDatasets] = useState<Dataset[]>([]);
  const { user } = useAuthStore();

  const loadData = useCallback(async () => {
    const [statsRes, datasetsRes] = await Promise.all([
      apiClient.get("/users/me/stats"),
      apiClient.get("/datasets"),
    ]);
    setStats(statsRes.data);
    setRecentDatasets((datasetsRes.data as Dataset[]).slice(0, 5));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {user?.name?.split(" ")[0]}. Here&apos;s your workspace at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Database} label="Total Datasets" value={stats.datasets} href="/dashboard/datasets" />
        <StatCard icon={BarChart3} label="Dashboards" value={stats.dashboards} href="/dashboard/dashboards" />
        <StatCard icon={Lightbulb} label="AI Insights" value={stats.insights} href="/dashboard/insights" />
        <StatCard icon={FileText} label="Reports" value={stats.reports} href="/dashboard/reports" />
      </div>

      {/* Recent Datasets */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold">Recent Datasets</h2>
          <Link href="/dashboard/datasets" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentDatasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No datasets yet.</p>
            <Link href="/dashboard/upload" className="mt-3 text-sm text-primary hover:underline">
              Upload your first dataset →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentDatasets.map((ds) => (
              <div key={ds.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <Link
                    href={`/dashboard/datasets/${ds.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {ds.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {ds.rowCount != null ? `${ds.rowCount.toLocaleString()} rows · ` : ""}
                    {formatFileSize(ds.fileSize)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(ds.status)}`}>
                    {ds.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ds.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
