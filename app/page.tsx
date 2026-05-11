import {
  ArrowRight,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Upload source files",
    description: "Add text documents to build the searchable knowledge base.",
    icon: UploadCloud,
  },
  {
    title: "Retrieve context",
    description: "Relevant chunks are pulled from storage for each question.",
    icon: Search,
  },
  {
    title: "Chat with answers",
    description: "Ask focused questions and get responses grounded in your data.",
    icon: MessageSquareText,
  },
];


export default function Home() {
  redirect("/chat");
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:py-24">
      <section className="relative flex flex-col items-center text-center gap-8">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[120px] rounded-full -z-10" />
        
        <div className="inline-flex items-center gap-2 rounded-full border glass px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles className="size-4 text-primary animate-pulse" />
          <span>Intelligent Document Analysis</span>
        </div>

        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-7xl text-gradient animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Chat with your data, <br className="hidden sm:block" />
            grounded in reality.
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-8 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            The ultimate RAG-powered assistant for your personal knowledge base. 
            Upload, index, and query your documents with unmatched precision.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Link href="/chat">
              Get Started
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8 glass transition-all hover:bg-muted/50 hover:scale-105 active:scale-95">
            <Link href="/upload">
              Upload Files
              <UploadCloud className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              className="group glass-card p-8 rounded-3xl transition-all hover:-translate-y-2 hover:shadow-2xl duration-500"
              key={step.title}
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-7" />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-primary/60">
                  Step 0{index + 1}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[2.5rem] border glass-card p-8 sm:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/5 to-transparent -z-10" />
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Enterprise-grade capabilities for everyone</h2>
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <div className="size-2 rounded-full bg-current" />
                </div>
                <div>
                  <h4 className="font-bold">Next-gen AI SDK</h4>
                  <p className="text-sm text-muted-foreground">Lightning-fast streaming responses and modular AI components.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <div className="size-2 rounded-full bg-current" />
                </div>
                <div>
                  <h4 className="font-bold">Advanced RAG Pipeline</h4>
                  <p className="text-sm text-muted-foreground">Sophisticated retrieval logic for high-context accuracy.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <div className="size-2 rounded-full bg-current" />
                </div>
                <div>
                  <h4 className="font-bold">Secure Authentication</h4>
                  <p className="text-sm text-muted-foreground">Clerk-powered security to keep your knowledge base private.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-2xl border glass overflow-hidden shadow-2xl animate-float">
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-chart-2/20 mix-blend-overlay" />
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500/50" />
                <div className="size-3 rounded-full bg-yellow-500/50" />
                <div className="size-3 rounded-full bg-green-500/50" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded-full bg-foreground/10" />
                <div className="h-4 w-1/2 rounded-full bg-foreground/10" />
                <div className="h-4 w-5/6 rounded-full bg-foreground/10" />
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-32 rounded-lg bg-primary/20 border border-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
