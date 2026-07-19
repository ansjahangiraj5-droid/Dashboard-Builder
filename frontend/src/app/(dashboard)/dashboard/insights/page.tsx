"use client";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Lightbulb, TrendingUp, AlertTriangle, GitBranch, BarChart3, Target, FileText } from "lucide-react";

interface Insight {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: number;
  createdAt: string;
  dataset: { name: string };
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  TREND: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  ANOMALY: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  CORRELATION: { icon: GitBranch, color: "text-purple-500", bg: "bg-purple-500/10" },
  SUMMARY: { icon: FileText, color: "text-green-500", bg: "bg-green-500/10" },
  KPI: { icon: Target, color: "text-pink-500", bg: "bg-pink-500/10" },
  FORECAST: { icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-500/10" },
};

function confidenceColor(c: number) {
  if (c >= 0.8) return "text-green-500";
  if (c >= 0.6) return "text-yellow-500";
  return "text-red-500";
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filter, setFilter] = useState("ALL");

  const loadInsights = useCallback(async () => {
    const { data } = await apiClient.get("/insights");
    setInsights(data);
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  const types = ["ALL", ...Object.keys(typeConfig)];
  const filtered = filter === "ALL" ? insights : insights.filter((i) => i.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="mt-1 text-muted-foreground">
          {insights.length} insight{insights.length !== 1 ? "s" : ""} generated across all datasets
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === t
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No insights yet. Upload a dataset to generate AI insights.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((insight) => {
            const cfg = typeConfig[insight.type] ?? typeConfig.SUMMARY;
            const Icon = cfg.icon;
            return (
              <div key={insight.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {insight.type}
                    </span>
                    <span className={`text-xs font-semibold ${confidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold leading-snug">{insight.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{insight.summary}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>{insight.dataset.name}</span>
                  <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
