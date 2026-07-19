"use client";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { FileText, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Report {
  id: string;
  name: string;
  format: string;
  createdAt: string;
  dataset: { name: string };
}

const formatBadge: Record<string, string> = {
  PDF: "bg-red-500/10 text-red-500",
  CSV: "bg-green-500/10 text-green-500",
  XLSX: "bg-blue-500/10 text-blue-500",
  JSON: "bg-purple-500/10 text-purple-500",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  const load = useCallback(async () => {
    const { data } = await apiClient.get("/reports");
    setReports(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-muted-foreground">{reports.length} report{reports.length !== 1 ? "s" : ""} generated</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/datasets">
            <FileDown className="mr-2 h-4 w-4" /> Export from Dataset
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No reports yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Navigate to a dataset and export a report.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Report Name</th>
                <th className="px-6 py-3">Dataset</th>
                <th className="px-6 py-3">Format</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.dataset.name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${formatBadge[r.format] ?? ""}`}>
                      {r.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" aria-label="Download report">
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
