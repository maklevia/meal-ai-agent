import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { User } from "src/modules/user/entities/User.entity.js";
import { ChatMessage } from "src/modules/chatMessage/entities/ChatMessage.entity.js";
import { ChatThreadStatus } from "src/modules/chatThread/typedefs.js";

@Entity("chat_threads")
export class ChatThread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({
    type: "enum",
    enum: ChatThreadStatus,
    default: ChatThreadStatus.Active,
  })
  status: ChatThreadStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.chatThreads, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => ChatMessage, (message) => message.thread, {
    cascade: true,
  })
  messages: Relation<ChatMessage[]>;
}
