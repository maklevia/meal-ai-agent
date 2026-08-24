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
import { ChatThread } from "src/modules/chatThread/ChatThread.entity.js";
import { ChatMessageRole } from "src/modules/chatMessage/typedefs.js";

@Entity("chat_message")
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

  @ManyToOne(() => ChatThread, (thread) => thread.messages)
  @JoinColumn()
  thread: Relation<ChatThread>;
}
