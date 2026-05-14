// src/app/upload/page.tsx - Fixed file input
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import {
  processFile,
  debugFormData,
  clearKnowledgeBase,
  getSources,
  deleteSource,
} from "./actions";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [fileInfo, setFileInfo] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const result = await getSources();
      if (result.success && result.sources) {
        setSources(result.sources);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    } finally {
      setLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      setFileInfo(
        `${file.name} (${file.size.toLocaleString()} bytes, ${
          file.type || "unknown type"
        })`
      );
    } else {
      setFileInfo("");
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setMessage("");
    setMessageType(null);
    
    try {
      const result = await clearKnowledgeBase();
      if (result.success) {
        setMessage(result.message ?? "Knowledge base cleared.");
        setMessageType("success");
        setShowConfirm(false);
        fetchSources(); // Refresh list
      } else {
        setMessage(result.error ?? "Failed to clear.");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Clear error:', error);
      setMessage(`Clear failed: ${error}`);
      setMessageType("error");
    } finally {
      setClearing(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setUploading(true);
    setProgress(2);
    setProgressText("Preparing file...");
    setMessage("");
    setMessageType(null);
    
    // Small paint tick to force React UI re-rendering before blocking tasks
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Simulated progress progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 25) {
          setProgressText("Reading file data...");
          return prev + Math.random() * 5 + 2;
        } else if (prev < 55) {
          setProgressText("Parsing document content...");
          return prev + Math.random() * 3 + 1;
        } else if (prev < 85) {
          setProgressText("Generating vector embeddings...");
          return prev + Math.random() * 1 + 0.5;
        } else if (prev < 97) {
          setProgressText("Indexing knowledge base...");
          return prev + Math.random() * 0.2 + 0.1;
        }
        return prev;
      });
    }, 300);
    
    try {
      // First, debug what's in the formData
      const debugResult = await debugFormData(formData);
      console.log('Debug result:', debugResult);
      
      if (debugResult.files && debugResult.files.length > 0) {
        const file = debugResult.files[0];
        setFileInfo(
          `${file.name} (${file.size.toLocaleString()} bytes, ${
            file.type || "unknown type"
          })`
        );
      }
      
      if (debugResult.entries === 0) {
        clearInterval(interval);
        setProgress(0);
        setMessage("No form data was received.");
        setMessageType("error");
        return;
      }
      
      // Then process the file
      const result = await processFile(formData);
      
      clearInterval(interval);
      
      if (result.success) {
        setProgress(100);
        setProgressText("Successfully indexed!");
        setMessage(result.message ?? "File uploaded successfully.");
        setMessageType("success");
        fetchSources(); // Refresh list
        // Brief delay before removing progress bar to show 100%
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
        setProgress(0);
        setProgressText("");
        setMessage(result.error ?? "Upload failed.");
        setMessageType("error");
      }
    } catch (error) {
      clearInterval(interval);
      setProgress(0);
      setProgressText("");
      console.error('Upload error:', error);
      setMessage(`Upload failed: ${error}`);
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
      <section className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border glass px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
          <UploadCloud className="size-4" />
          Document Intake
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Expand your knowledge.</h1>
          <p className="max-w-prose text-lg text-muted-foreground leading-relaxed">
            Add documents to your RAG knowledge base. We'll automatically process, 
            chunk, and index your content for instant retrieval.
          </p>
        </div>
        <div className="grid gap-4 pt-4">
          {[
            { step: 1, text: "Select a plain text or PDF document." },
            { step: 2, text: "Submit for automatic indexing." },
            { step: 3, text: "Chat with your data instantly." },
          ].map((item) => (
            <div className="flex items-center gap-4 group" key={item.step}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {item.step}
              </span>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2.5rem] border glass-card p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
        
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedFile) return;
            const formData = new FormData(e.currentTarget);
            await handleSubmit(formData);
          }} 
          className="space-y-8"
        >
          <div className="space-y-3">
            <label htmlFor="file" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Select Document
            </label>
            <label
              className="group relative flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center transition-all hover:bg-muted/40 hover:border-primary/40 active:scale-[0.98]"
              htmlFor="file"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-background shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                <UploadCloud className="size-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold tracking-tight">Drop your file here</p>
                <p className="text-sm text-muted-foreground">
                  Support for .txt, .md, and .pdf files
                </p>
              </div>
              <div className="rounded-full border glass px-4 py-1.5 text-xs font-medium text-muted-foreground">
                Maximum file size: 10MB
              </div>
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className="sr-only"
              required
            />
          </div>

          {fileInfo && (
            <div className="flex items-center gap-4 rounded-2xl border glass p-4 text-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{selectedFile?.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile?.size || 0).toLocaleString()} bytes • {selectedFile?.type || "Document"}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="relative h-14 w-full overflow-hidden rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <UploadCloud className="size-6" />
                <span>Upload & Index</span>
              </div>
            )}
          </button>

          {uploading && (
            <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {progressText}
                </span>
                <span className="text-sm font-bold text-primary tabular-nums">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-primary/10" />
            </div>
          )}
        </form>

        {message && (
          <div className={`mt-8 flex items-center gap-4 rounded-2xl border p-4 text-sm font-medium animate-in slide-in-from-top-4 duration-500 ${
            messageType === "error"
              ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
              messageType === "error" ? "bg-red-500/20" : "bg-emerald-500/20"
            }`}>
              {messageType === "error" ? (
                <XCircle className="size-4" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
            </div>
            <span>{message}</span>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Knowledge Assets</h2>
            <p className="text-sm text-muted-foreground">Manage the documents currently powering your assistant.</p>
          </div>
          <div className="rounded-full border glass px-3 py-1 text-xs font-bold text-primary">
            {sources.length} {sources.length === 1 ? 'File' : 'Files'} Indexed
          </div>
        </div>

        <div className="grid gap-4">
          {loadingSources ? (
            <div className="flex items-center justify-center rounded-3xl border glass p-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              <span>Loading documents...</span>
            </div>
          ) : sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
              <FileText className="mb-4 size-10 opacity-20" />
              <p className="font-medium">No documents indexed yet.</p>
              <p className="text-xs">Upload your first file to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sources.map((source) => (
                <div
                  key={source}
                  className="group flex items-center justify-between rounded-2xl border glass p-4 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{source}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Verified Source</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete all information from "${source}"?`)) {
                        const res = await deleteSource(source);
                        if (res.success) fetchSources();
                        else alert(res.error);
                      }
                    }}
                    className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                    title="Delete document"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 transition-all hover:bg-red-500/10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Danger Zone</h3>
              <p className="text-sm opacity-80">Reset the entire knowledge base. This action cannot be undone.</p>
            </div>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-fit items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:scale-105 active:scale-95"
            >
              <Trash2 className="size-4" />
              Clear Knowledge Base
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Are you absolutely sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  {clearing ? <Loader2 className="size-4 animate-spin" /> : "Yes, Clear Everything"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={clearing}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold transition-all hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
