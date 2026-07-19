"use client";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Search, Trash2, Eye, Upload, FileText, CheckCircle2, Clock, XCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface Dataset {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  rowCount: number | null;
  columnCount: number | null;
  createdAt: string;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "READY") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "PROCESSING") return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
  if (status === "FAILED") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-blue-500" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDatasets = useCallback(async () => {
    const { data } = await apiClient.get("/datasets");
    setDatasets(data);
  }, []);

  useEffect(() => { loadDatasets(); }, [loadDatasets]);

  const handleDelete = async (id: string, name: string) => {
    setDeleting(id);
    try {
      await apiClient.delete(`/datasets/${id}`);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Dataset deleted", description: `"${name}" has been removed.` });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = datasets.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.fileName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Datasets</h1>
          <p className="mt-1 text-muted-foreground">{datasets.length} dataset{datasets.length !== 1 ? "s" : ""} in your workspace</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Upload className="mr-2 h-4 w-4" /> Upload New
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search datasets…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Database className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {datasets.length === 0 ? "No datasets yet." : "No datasets match your search."}
            </p>
            {datasets.length === 0 && (
              <Button asChild className="mt-4" variant="outline">
                <Link href="/dashboard/upload"><Upload className="mr-2 h-4 w-4" /> Upload Dataset</Link>
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Rows</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ds) => (
                <tr key={ds.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <Link href={`/dashboard/datasets/${ds.id}`} className="font-medium hover:text-primary hover:underline">
                          {ds.name}
                        </Link>
                        {ds.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{ds.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {ds.rowCount != null ? ds.rowCount.toLocaleString() : "—"}
                    {ds.columnCount != null ? ` × ${ds.columnCount}` : ""}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatFileSize(ds.fileSize)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={ds.status} />
                      <span className="capitalize text-xs">{ds.status.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/datasets/${ds.id}`} aria-label="View dataset">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ds.id, ds.name)}
                        disabled={deleting === ds.id}
                        aria-label="Delete dataset"
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === ds.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
