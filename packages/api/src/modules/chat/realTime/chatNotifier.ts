import { ChatRealtimeNotifier } from "src/modules/chat/realtime/ChatRealtimeNotifier";

class NoopChatRealtimeNotifier implements ChatRealtimeNotifier {
  notifyNewMessage(): void {}

  agentStarted(): void {}
  agentDelta(): void {}
  agentCompleted(): void {}
  agentInterrupted(): void {}
  agentFailed(): void {}
}

let instance: ChatRealtimeNotifier = new NoopChatRealtimeNotifier();

export function setChatRealtimeNotifier(next: ChatRealtimeNotifier): void {
  instance = next;
}

export function getChatRealtimeNotifier(): ChatRealtimeNotifier {
  return instance;
}
