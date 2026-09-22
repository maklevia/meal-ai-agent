import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatMessageRole } from "src/modules/chat/typedefs";

@Entity("chat_messages")
@Check("CHK_token_count_positive", '"token_count" >= 0')
@Index(
  "UQ_chat_messages_thread_client_message_id",
  ["thread", "clientMessageId"],
  { unique: true },
)
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: ChatMessageRole })
  role: ChatMessageRole;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "int" })
  tokenCount: number;

  @Column({ type: "uuid", nullable: true })
  clientMessageId: string | null;

  @Column({ type: "uuid", nullable: true })
  generationRequestId: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @ManyToOne(() => ChatThread, (thread) => thread.messages, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  thread: Relation<ChatThread>;
}
