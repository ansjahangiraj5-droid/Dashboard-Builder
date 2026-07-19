"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

type Status = "idle" | "uploading" | "success" | "error";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setName(accepted[0].name.replace(/\.[^.]+$/, ""));
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/json": [".json"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name || file.name);
    if (description) formData.append("description", description);

    try {
      const { data } = await apiClient.post("/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setStatus("success");
      toast({ title: "Upload successful", description: `"${data.name}" has been uploaded.` });
      setTimeout(() => router.push(`/dashboard/datasets/${data.id}`), 1200);
    } catch (err) {
      setStatus("error");
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Upload failed"
        : "An unexpected error occurred";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Dataset</h1>
        <p className="mt-1 text-muted-foreground">
          Supported formats: CSV, Excel (.xlsx / .xls), JSON — up to 100 MB
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          file && "border-primary/30 bg-muted/40",
        )}
      >
        <input {...getInputProps()} />
        {!file ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Drag & drop your file here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
            </div>
            <p className="text-xs text-muted-foreground">CSV, XLSX, XLS, JSON — max 100 MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); setFile(null); setStatus("idle"); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Metadata */}
      {file && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-1">
            <Label htmlFor="ds-name">Dataset Name</Label>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Sales Data 2024"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="ds-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Monthly sales report for Q4 2024"
            />
          </div>

          {status === "uploading" && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{progress}% uploaded</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Upload complete — redirecting to dataset…
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={status === "uploading" || status === "success" || !name.trim()}
          >
            {status === "uploading" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Upload Dataset</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
