"use client";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import ReactECharts from "echarts-for-react";
import { BarChart3, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  dataset: { name: string; status: string };
  widgets: { type: string }[];
}

const DEMO_OPTION = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
  yAxis: { type: "value" },
  series: [
    { type: "bar", data: [120, 200, 150, 80, 170, 110], itemStyle: { color: "#3b82f6" } },
    { type: "line", data: [100, 180, 130, 90, 160, 95], itemStyle: { color: "#8b5cf6" } },
  ],
};

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await apiClient.get("/dashboards");
    setDashboards(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await apiClient.delete(`/dashboards/${id}`).catch(() => {});
    setDashboards((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <p className="mt-1 text-muted-foreground">{dashboards.length} dashboard{dashboards.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" /> Create Dashboard
          </Link>
        </Button>
      </div>

      {dashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No dashboards yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Upload a dataset and generate your first AI dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {dashboards.map((db) => (
            <div key={db.id} className="overflow-hidden rounded-xl border border-border bg-card">
              {/* Mini chart preview */}
              <div className="bg-muted/30 px-4 pt-4">
                <ReactECharts option={DEMO_OPTION} style={{ height: "160px" }} />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{db.name}</h3>
                    {db.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{db.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {db.dataset.name} · {db.widgets.length} widget{db.widgets.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/dashboards/${db.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(db.id)}
                      disabled={deleting === db.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
