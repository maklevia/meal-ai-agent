import { z } from "zod";
import { ChatThreadScope } from "src/modules/chat/typedefs";

export const createThreadBodySchema = z.object({
  title: z.string().trim().min(1).max(255),
  scope: z.nativeEnum(ChatThreadScope).default(ChatThreadScope.User),
});

export type CreateThreadBody = z.infer<typeof createThreadBodySchema>;

export const threadParamsSchema = z.object({
  threadId: z.coerce.number().int().positive(),
});

export type ThreadParams = z.infer<typeof threadParamsSchema>;

export const threadHistoryQuerySchema = z.object({
  beforeId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type ThreadHistoryQuery = z.infer<typeof threadHistoryQuerySchema>;

export const threadIdPayloadSchema = z.object({
  threadId: z.number().int().positive(),
});

export type ThreadIdPayload = z.infer<typeof threadIdPayloadSchema>;

export const sendMessagePayloadSchema = z.object({
  threadId: z.number().int().positive(),
  content: z.string().trim().min(1).max(4000),
  clientMessageId: z.string().uuid().optional(),
});

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
