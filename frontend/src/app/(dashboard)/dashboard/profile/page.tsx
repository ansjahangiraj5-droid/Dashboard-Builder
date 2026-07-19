"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Building, Briefcase, Globe } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  timezone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ datasets: 0, dashboards: 0, insights: 0, reports: 0 });
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, company: user?.company ?? "", jobTitle: user?.jobTitle ?? "", timezone: user?.timezone ?? "UTC" },
  });

  const loadStats = useCallback(async () => {
    const { data } = await apiClient.get("/users/me/stats");
    setStats(data);
  }, []);

  useEffect(() => {
    loadStats();
    if (user) reset({ name: user.name, company: user.company ?? "", jobTitle: user.jobTitle ?? "", timezone: user.timezone ?? "UTC" });
  }, [user, loadStats, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { data: updated } = await apiClient.patch(`/users/${user.id}`, data);
      setUser(updated);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch {
      toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Avatar + Stats */}
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 sm:flex-row">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {[
              { label: "Datasets", value: stats.datasets },
              { label: "Dashboards", value: stats.dashboards },
              { label: "Insights", value: stats.insights },
              { label: "Reports", value: stats.reports },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-xl border border-border bg-card p-8">
        <h3 className="mb-6 text-lg font-semibold">Personal Information</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company" className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" /> Company
              </Label>
              <Input id="company" {...register("company")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Job Title
              </Label>
              <Input id="jobTitle" {...register("jobTitle")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="timezone" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Timezone
              </Label>
              <select
                id="timezone"
                {...register("timezone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
