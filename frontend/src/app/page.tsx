import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Brain, Upload, Zap, Shield, ArrowRight,
  TrendingUp, Database, MessageSquare, FileDown,
} from "lucide-react";

const features = [
  { icon: Upload, title: "Smart Data Ingestion", desc: "Upload CSV, Excel, or JSON files. AI automatically profiles your data and detects schema." },
  { icon: Brain, title: "AI-Powered Insights", desc: "GPT-4 and IBM watsonx analyse your data and surface actionable business insights automatically." },
  { icon: BarChart3, title: "Dynamic Dashboards", desc: "Auto-generate beautiful Apache ECharts dashboards tailored to your dataset and KPIs." },
  { icon: MessageSquare, title: "Conversational Analytics", desc: "Chat with your data in natural language. Ask questions, get visualisations, explore trends." },
  { icon: TrendingUp, title: "KPI Recommendations", desc: "AI recommends the most relevant KPIs for your industry and dataset automatically." },
  { icon: FileDown, title: "Report Export", desc: "Export professional reports in PDF, CSV, XLSX, or JSON formats with a single click." },
  { icon: Database, title: "Custom Datasets", desc: "Transform, filter, and combine your data to create purpose-built analytical datasets." },
  { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, role-based access control, and end-to-end TLS encryption." },
];

const stats = [
  { value: "10x", label: "Faster Insights" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50+", label: "Chart Types" },
  { value: "< 30s", label: "Analysis Time" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">InsightForge AI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Button asChild size="sm">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          <Zap className="mr-1 h-3 w-3" />
          Powered by GPT-4 &amp; IBM watsonx
        </Badge>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Turn Raw Data Into{" "}
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Business Intelligence
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          InsightForge AI analyses your datasets, generates interactive dashboards, and delivers
          actionable insights — all in under 30 seconds.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In to Dashboard</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            A complete AI-driven BI platform — from raw file to boardroom-ready report.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/40 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three steps from data to insight.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Upload Your Data", desc: "Drag and drop CSV, Excel, or JSON files. Our AI instantly profiles your dataset." },
              { step: "02", title: "AI Analyses It", desc: "Machine learning detects trends, anomalies, correlations, and recommends KPIs." },
              { step: "03", title: "Get Actionable Insights", desc: "Explore interactive dashboards, chat with your data, and export reports." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="mb-6 text-4xl font-bold">Ready to Forge Your Insights?</h2>
        <p className="mb-10 text-lg text-muted-foreground">
          Join thousands of analysts using InsightForge AI to make faster, smarter decisions.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/register">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-semibold">InsightForge AI</span>
          </div>
          <span>© {new Date().getFullYear()} InsightForge AI. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
