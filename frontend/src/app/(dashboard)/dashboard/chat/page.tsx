"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiClient, aiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Send, MessageSquare, Loader2, Plus, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Session {
  id: string;
  title?: string;
  datasetId: string;
  dataset: { name: string };
  updatedAt: string;
}

interface Dataset {
  id: string;
  name: string;
  status: string;
  schema?: object[];
  previewData?: object[];
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    const { data } = await apiClient.get("/chat/sessions");
    setSessions(data);
  }, []);

  const loadDatasets = useCallback(async () => {
    const { data } = await apiClient.get("/datasets");
    setDatasets((data as Dataset[]).filter((d) => d.status === "READY"));
  }, []);

  useEffect(() => {
    loadSessions();
    loadDatasets();
  }, [loadSessions, loadDatasets]);

  useEffect(() => {
    if (activeSession) {
      apiClient.get(`/chat/sessions/${activeSession}`).then(({ data }) => setMessages(data.messages ?? []));
    }
  }, [activeSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createSession = async () => {
    if (!selectedDataset) return;
    const { data } = await apiClient.post("/chat/sessions", { datasetId: selectedDataset });
    setSessions((prev) => [data, ...prev]);
    setActiveSession(data.id);
    setShowNewSession(false);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || isSending) return;
    const content = input.trim();
    setInput("");
    setIsSending(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    await apiClient.post(`/chat/sessions/${activeSession}/messages`, { role: "user", content });

    try {
      const session = sessions.find((s) => s.id === activeSession);
      const ds = datasets.find((d) => d.id === session?.datasetId);
      const { data } = await aiClient.post("/chat/ask", {
        schema_info: ds?.schema ?? [],
        preview: ds?.previewData ?? [],
        message: content,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      });
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      await apiClient.post(`/chat/sessions/${activeSession}/messages`, { role: "assistant", content: data.reply });
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sessions sidebar */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <Button size="sm" className="w-full" onClick={() => setShowNewSession(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>

        {showNewSession && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Select dataset</p>
            <select
              className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
            >
              <option value="">— Choose —</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={createSession} disabled={!selectedDataset}>Start</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewSession(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-8">No chat sessions yet</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeSession === s.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 shrink-0" />
                <span className="truncate font-medium">{s.title ?? s.dataset?.name ?? "Chat"}</span>
              </div>
              <p className="mt-0.5 text-xs opacity-70">{new Date(s.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">
        {!activeSession ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">Start an AI Conversation</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a dataset and start chatting with your data using natural language.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about your data…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={isSending}
                />
                <Button onClick={sendMessage} disabled={isSending || !input.trim()}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
