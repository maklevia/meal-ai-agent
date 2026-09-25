import { FinishReason } from "ai";
import { AgentStep } from "src/modules/agent/entities/AgentStep.entity";
import { AgentRunStatus } from "src/modules/agent/typedefs";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

@Entity("agent_runs")
export class AgentRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", default: 0 })
  totalTokenCount: number;

  @Column({ type: "uuid", unique: true })
  requestId: string;

  @Column({ type: "enum", enum: AgentRunStatus })
  status: AgentRunStatus;

  @Column({ type: "varchar", length: 64, nullable: true })
  modelProvider: string;

  @Column({ type: "varchar", length: 128, nullable: true })
  modelId: string;

  @Column({ type: "int", default: 0 })
  stepCount: number;

  @Column({ type: "jsonb", nullable: true })
  error: string | null;

  @Column({ type: "varchar", length: 32, nullable: true })
  finishReason: FinishReason | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  rawFinishReason: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @OneToOne(() => ChatMessage, (agentMessage) => agentMessage.agentRun, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "agent_message_id",
    foreignKeyConstraintName: "FK_agent_runs_agent_message_id",
  })
  agentMessage: Relation<ChatMessage> | null;

  @OneToOne(() => ChatMessage, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_message_id",
    foreignKeyConstraintName: "FK_agent_runs_user_message_id",
  })
  userMessage: Relation<ChatMessage>;

  @OneToMany(() => AgentStep, (agentStep) => agentStep.agentRun)
  agentStep: Relation<AgentStep[]>;
}
