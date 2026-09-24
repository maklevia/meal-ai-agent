import { SNAPSHOT_TTL_MS } from "src/modules/agent/constants";
import {
  ActiveAgentGeneration,
  AgentGenerationSnapshot,
} from "src/modules/agent/typedefs";

type AcquireResult =
  | { acquired: true }
  | { acquired: false; active: AgentGenerationSnapshot };

/**
 * In-memory, per-thread registry of agent generations.
 *
 * - `activeByThread` / `activeByRequest` are two indexes over the same
 *   running generation object. Both point at the same instance, so mutations
 *   (e.g. `contentSoFar`) are visible through either key.
 * - `snapshots` keeps the last finished generation per thread for a short TTL
 *   so a reconnecting client can still recover the state via `thread:join`.
 */
export class AgentGenerationRegistry {
  private readonly activeByThread = new Map<number, ActiveAgentGeneration>();
  private readonly activeByRequest = new Map<string, ActiveAgentGeneration>();
  private readonly snapshots = new Map<number, AgentGenerationSnapshot>();
  private readonly timers = new Map<number, NodeJS.Timeout>();

  tryAcquire(input: { threadId: number; requestId: string }): AcquireResult {
    const active = this.activeByThread.get(input.threadId);
    if (active) return { acquired: false, active: this.toSnapshot(active) };

    const generation: ActiveAgentGeneration = {
      requestId: input.requestId,
      threadId: input.threadId,
      messageId: null,
      status: "running",
      contentSoFar: "",
      startedAt: new Date().toISOString(),
      abort: new AbortController(),
    };

    this.activeByRequest.set(input.requestId, generation);
    this.activeByThread.set(input.threadId, generation);
    return { acquired: true };
  }

  attachMessage(requestId: string, messageId: number): void {
    const generation = this.activeByRequest.get(requestId);
    if (generation) generation.messageId = messageId;
  }

  getByRequest(requestId: string): ActiveAgentGeneration | undefined {
    return this.activeByRequest.get(requestId);
  }

  isBusy(threadId: number): boolean {
    return this.activeByThread.has(threadId);
  }

  getByThread(threadId: number): AgentGenerationSnapshot | null {
    const active = this.activeByThread.get(threadId);

    if (active) {
      return this.toSnapshot(active);
    }
    return this.snapshots.get(threadId) ?? null;
  }

  appendDelta(requestId: string, delta: string): void {
    const generation = this.activeByRequest.get(requestId);
    if (generation) {
      generation.contentSoFar += delta;
    }
  }

  finish(requestId: string, status: "completed" | "failed"): void {
    const generation = this.activeByRequest.get(requestId);
    if (!generation) return;

    generation.status = status;
    this.activeByRequest.delete(requestId);
    this.activeByThread.delete(generation.threadId);

    const snapshot = this.toSnapshot(generation);
    this.snapshots.set(generation.threadId, snapshot);

    this.scheduleSnapshotEviction(generation.threadId, snapshot);
  }

  release(requestId: string): void {
    const generation = this.activeByRequest.get(requestId);
    if (!generation) return;

    this.activeByRequest.delete(requestId);
    this.activeByThread.delete(generation.threadId);
  }

  cancel(requestId: string): boolean {
    const generation = this.activeByRequest.get(requestId);
    if (!generation) return false;

    generation.abort.abort();
    this.finish(requestId, "failed");
    return true;
  }

  private scheduleSnapshotEviction(
    threadId: number,
    snapshot: AgentGenerationSnapshot,
  ): void {
    const previousTimer = this.timers.get(threadId);
    if (previousTimer) clearTimeout(previousTimer);

    const timer = setTimeout(() => {
      if (this.snapshots.get(threadId) === snapshot) {
        this.snapshots.delete(threadId);
        this.timers.delete(threadId);
      }
    }, SNAPSHOT_TTL_MS);

    timer.unref();
    this.timers.set(threadId, timer);
  }

  private toSnapshot(
    generation: ActiveAgentGeneration,
  ): AgentGenerationSnapshot {
    return {
      requestId: generation.requestId,
      messageId: generation.messageId,
      status: generation.status,
      contentSoFar: generation.contentSoFar,
      startedAt: generation.startedAt,
    };
  }
}

let instance: AgentGenerationRegistry | undefined;

export function getAgentGenerationRegistry(): AgentGenerationRegistry {
  return (instance ??= new AgentGenerationRegistry());
}

export function setAgentGenerationRegistry(
  next: AgentGenerationRegistry,
): void {
  instance = next;
}
