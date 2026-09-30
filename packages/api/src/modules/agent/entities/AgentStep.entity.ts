import { FinishReason, LanguageModelUsage } from "ai";
import type { AgentResponseMessage } from "src/modules/agent/typedefs";
import { AgentRun } from "src/modules/agent/entities/AgentRun.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from "typeorm";

@Entity("agent_steps")
@Unique("UQ_agent_steps_run_id_step_number", ["agentRun", "stepNumber"])
export class AgentStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  stepNumber: number;

  @Column({ type: "varchar", length: 32, nullable: true })
  finishReason: FinishReason | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  rawFinishReason: string | null;

  @Column({ type: "jsonb" })
  usage: LanguageModelUsage;

  @Column({ type: "jsonb" })
  responseMessages: AgentResponseMessage[];

  @CreateDateColumn({type: "timestamptz", default: () => "NOW()"})
  createdAt: Date;

  @ManyToOne(() => AgentRun, (agentRun) => agentRun.agentStep, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "agent_run_id",
    foreignKeyConstraintName: "FK_agent_steps_agent_run_id",
  })
  agentRun: Relation<AgentRun>;
}
