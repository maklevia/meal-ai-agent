import {
  Check,
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
import { User } from "src/modules/user/entities/User.entity";
import { Family } from "src/modules/family/entities/Family.entity";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThreadStatus } from "src/modules/chat/typedefs";

@Entity("chat_threads")
@Check("CHK_thread_owner", '("user_id" IS NOT NULL AND "family_id" IS NULL) OR ("user_id" IS NULL AND "family_id" IS NOT NULL)')
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
    nullable: true,
  })
  @JoinColumn()
  user: Relation<User> | null;

  @ManyToOne(() => Family, (family) => family.chatThreads, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn()
  family: Relation<Family> | null;

  @OneToMany(() => ChatMessage, (message) => message.thread, {
    cascade: true,
  })
  messages: Relation<ChatMessage[]>;
}
