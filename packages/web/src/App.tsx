import { useEffect, useRef, useState, type CSSProperties } from "react";
import { io, type Socket } from "socket.io-client";
import { apiFetch } from "src/lib/api.ts";

// Auto-opens thread 4 (override with ?threadId=123).
const THREAD_ID = 4

// In dev the API is on :3000 (Vite proxies /api but not /socket.io).
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

type Role = "user" | "assistant" | "system";

type ChatMessage = {
  id: number | string;
  role: Role;
  content: string;
  pending?: boolean;
  failed?: boolean;
  senderName?: string | null;
};

type Ack<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type MessageSendAck = {
  message: { id: number; role: Role; content: string; sender?: { name: string } | null };
  clientMessageId: string;
  requestId: string;
  inserted: boolean;
};

type AgentStarted = { threadId: number; requestId: string; messageId: number };
type AgentDelta = { threadId: number; requestId: string; delta: string };
type AgentCompleted = {
  threadId: number;
  requestId: string;
  message: { id: number; role: Role; content: string };
};
type AgentFailed = { threadId: number; requestId: string; reason: string };
type MessageCreated = {
  message: { id: number; role: Role; content: string; sender?: { name: string } | null };
};

const agentBubbleId = (requestId: string) => `agent:${requestId}`;

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("connecting…");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reconnectKey, setReconnectKey] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const loadHistory = async () => {
      try {
        const res = await apiFetch<{
          messages: Array<{
            id: number;
            role: Role;
            content: string;
            sender?: { name: string } | null;
          }>;
        }>(`/chat/threads/${THREAD_ID}/messages?limit=50`);

        setMessages(
          res.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            senderName: m.sender?.name ?? null,
          })),
        );
      } catch (err) {
        setStatus(`history error: ${(err as Error).message}`);
      }
    };

    socket.on("connect", () => {
      setAuthed(true);
      setStatus(`connected · thread ${THREAD_ID}`);
      socket.emit("thread:join", { threadId: THREAD_ID }, (ack: Ack<unknown>) => {
        if (!ack?.ok) {
          setStatus(`join failed: ${ack?.error?.message ?? "unknown"}`);
        }
      });
      void loadHistory();
    });

    socket.on("connect_error", (err: Error) => {
      setAuthed(false);
      setStatus(`connection error: ${err.message}`);
    });

    socket.on("disconnect", () => setStatus("disconnected"));

    socket.on("agent:started", (p: AgentStarted) => {
      if (p.threadId !== THREAD_ID) return;
      setBusy(true);
      setMessages((prev) =>
        prev.some((m) => m.id === agentBubbleId(p.requestId))
          ? prev
          : [
              ...prev,
              { id: agentBubbleId(p.requestId), role: "assistant", content: "", pending: true },
            ],
      );
    });

    socket.on("agent:delta", (p: AgentDelta) => {
      if (p.threadId !== THREAD_ID) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentBubbleId(p.requestId)
            ? { ...m, content: m.content + p.delta }
            : m,
        ),
      );
    });

    socket.on("agent:completed", (p: AgentCompleted) => {
      if (p.threadId !== THREAD_ID) return;
      setBusy(false);
      setMessages((prev) => {
        // terminal events are broadcast to both the thread and owner rooms,
        // so dedupe by the persisted message id
        if (prev.some((m) => m.id === p.message.id)) return prev;
        return [
          ...prev.filter((m) => m.id !== agentBubbleId(p.requestId)),
          { id: p.message.id, role: "assistant", content: p.message.content },
        ];
      });
    });

    socket.on("agent:failed", (p: AgentFailed) => {
      if (p.threadId !== THREAD_ID) return;
      setBusy(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentBubbleId(p.requestId)
            ? { ...m, pending: false, failed: true, content: m.content || `⚠️ ${p.reason}` }
            : m,
        ),
      );
    });

    socket.on("message:created", (p: MessageCreated) => {
      setMessages((prev) =>
        prev.some((m) => m.id === p.message.id)
          ? prev
          : [
              ...prev,
              {
                id: p.message.id,
                role: p.message.role,
                content: p.message.content,
                senderName: p.message.sender?.name ?? null,
              },
            ],
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [reconnectKey]);

  const send = () => {
    const content = input.trim();
    const socket = socketRef.current;
    if (!content || !socket) return;

    const clientMessageId = crypto.randomUUID();
    const tempId = `local:${clientMessageId}`;

    setMessages((prev) => [...prev, { id: tempId, role: "user", content, pending: true }]);
    setInput("");

    socket.emit(
      "message:send",
      { threadId: THREAD_ID, content, clientMessageId },
      (ack: Ack<MessageSendAck>) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== tempId) return m;
            if (ack?.ok) {
              return {
                ...m,
                id: ack.data.message.id,
                pending: false,
                senderName: ack.data.message.sender?.name ?? null,
              };
            }
            return {
              ...m,
              pending: false,
              failed: true,
              content: `${content}\n\n⚠️ ${ack?.error?.message ?? "send failed"}`,
            };
          }),
        );
      },
    );
  };

  const login = async () => {
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStatus("logged in, reconnecting…");
      setReconnectKey((k) => k + 1);
    } catch (err) {
      setStatus(`login failed: ${(err as Error).message}`);
    }
  };

  if (authed === false) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Agent test · login</h2>
          <p style={styles.muted}>No valid session cookie. Log in to continue.</p>
          <input
            style={styles.input}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void login()}
          />
          <button style={styles.button} onClick={() => void login()}>
            Log in
          </button>
          <p style={styles.muted}>{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <strong>Agent test · thread {THREAD_ID}</strong>
          <span style={styles.muted}>
            {status}
            {busy ? " · generating…" : ""}
          </span>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && <p style={styles.muted}>No messages yet. Say hi.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.assistantBubble),
                ...(m.failed ? styles.failedBubble : {}),
              }}
            >
              <div style={styles.bubbleMeta}>
                {m.role}
                {m.senderName ? ` · ${m.senderName}` : ""}
                {m.pending ? " · …" : ""}
              </div>
              <div style={styles.bubbleText}>{m.content || (m.pending ? "…" : "")}</div>
            </div>
          ))}
        </div>

        <div style={styles.composer}>
          <input
            style={styles.input}
            placeholder={busy ? "agent is answering…" : "Type a message"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && send()}
            disabled={busy}
          />
          <button style={styles.button} onClick={send} disabled={busy || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    margin: 0,
    background: "#0f1115",
    color: "#e8eaed",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 760,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#171a21",
    border: "1px solid #262b36",
    borderRadius: 12,
    padding: 16,
  },
  title: { margin: 0 },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  muted: { color: "#9aa3b2", fontSize: 12, margin: 0 },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 320,
    maxHeight: "60vh",
    overflowY: "auto",
    padding: 8,
    background: "#11141a",
    borderRadius: 8,
  },
  bubble: { padding: "8px 10px", borderRadius: 8, maxWidth: "85%", whiteSpace: "pre-wrap" },
  userBubble: { alignSelf: "flex-end", background: "#1f3b6e" },
  assistantBubble: { alignSelf: "flex-start", background: "#232833" },
  failedBubble: { border: "1px solid #a33" },
  bubbleMeta: { fontSize: 11, color: "#9aa3b2", marginBottom: 4 },
  bubbleText: { fontSize: 14, lineHeight: 1.4 },
  composer: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #333a47",
    background: "#0f1115",
    color: "#e8eaed",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #3b6fd4",
    background: "#2f5fb3",
    color: "#fff",
    cursor: "pointer",
  },
};
