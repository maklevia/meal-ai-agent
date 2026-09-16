export enum ChatMessageRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

export enum ChatThreadStatus {
  Active = "active",
  Archived = "archived",
}

export enum ChatThreadScope {
  User = "user",
  Family = "family",
}

export enum ChatGenerationStatus {
  Pending = "pending",
  Streaming = "streaming",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
}
