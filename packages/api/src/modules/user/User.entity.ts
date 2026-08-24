import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { UserPreferences } from "src/modules/userPreferences/UserPreferences.entity.js";
import { Family } from "src/modules/family/Family.entity.js";
import { MealHistory } from "src/modules/mealHistory/MealHistory.entity.js";
import { ChatThread } from "src/modules/chatThread/ChatThread.entity.js";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 25 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user)
  @JoinColumn()
  userPreferences: UserPreferences;

  @ManyToOne(() => Family, (family) => family.users, { nullable: true })
  @JoinColumn()
  family: Family | null;

  @OneToMany(() => MealHistory, (mealHistory) => mealHistory.user)
  mealHistory: MealHistory[];

  @OneToMany(() => ChatThread, (chatThread) => chatThread.user)
  chatThreads: ChatThread[];
}
