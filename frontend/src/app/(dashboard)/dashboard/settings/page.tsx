"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Moon, Sun, Shield, Bell } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match", path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isChangingPw, setIsChangingPw] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const changePassword = async (data: PasswordForm) => {
    if (!user) return;
    setIsChangingPw(true);
    try {
      await apiClient.patch(`/users/${user.id}`, { password: data.newPassword });
      toast({ title: "Password updated", description: "Your password has been changed." });
      reset();
    } catch {
      toast({ title: "Failed", description: "Could not update password.", variant: "destructive" });
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your application preferences</p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Dataset processed", desc: "When your uploaded dataset is ready" },
            { label: "New insights generated", desc: "When AI generates new insights for your data" },
            { label: "Report completed", desc: "When a scheduled report is ready to download" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        <Separator className="mb-6" />
        <form onSubmit={handleSubmit(changePassword)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...register("newPassword")} />
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={isChangingPw}>
            {isChangingPw ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isChangingPw ? "Saving…" : "Update Password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
