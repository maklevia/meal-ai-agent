import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { ChatThread } from "src/modules/chatThread/entities/ChatThread.entity.js";
import { ChatMessageRole } from "src/modules/chatMessage/typedefs.js";

@Entity("chat_messages")
@Check("CHK_token_count_positive", '"token_count" >= 0')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: ChatMessageRole })
  role: ChatMessageRole;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "int" })
  tokenCount: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @ManyToOne(() => ChatThread, (thread) => thread.messages, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  thread: Relation<ChatThread>;
}
