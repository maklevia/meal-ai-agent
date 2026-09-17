import { ChatRealtimeNotifier } from "src/modules/chat/realTime/ChatRealtimeNotifier";

class NoopChatRealtimeNotifier implements ChatRealtimeNotifier {
  notifyNewMessage(): void {}
}

let instance: ChatRealtimeNotifier = new NoopChatRealtimeNotifier();

export function setChatRealtimeNotifier(next: ChatRealtimeNotifier): void {
  instance = next;
}

export function getChatRealtimeNotifier(): ChatRealtimeNotifier {
  return instance;
}
