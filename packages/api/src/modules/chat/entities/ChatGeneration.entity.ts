import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import {
  ChatGenerationStatus,
  ChatThreadScope,
} from "src/modules/chat/typedefs";
import { User } from "src/modules/user/entities/User.entity";

@Entity("chat_generations")
export class ChatGeneration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ChatGenerationStatus,
    default: ChatGenerationStatus.Pending,
  })
  status: ChatGenerationStatus;

  @Column({ type: "enum", enum: ChatThreadScope })
  scope: ChatThreadScope;

  @Column({ type: "text", nullable: true })
  error: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  startedAt: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  finishedAt: Date | null;

  @ManyToOne(() => ChatThread, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  thread: Relation<ChatThread>;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  requestedBy: Relation<User>;

  @OneToOne(() => ChatMessage, { onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  assistantMessage: Relation<ChatMessage> | null;
}
