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
  Relation,
} from "typeorm";
import { UserPreferences } from "src/modules/userPreferences/entities/UserPreferences.entity";
import { Family } from "src/modules/family/entities/Family.entity";
import { MealHistory } from "src/modules/mealHistory/entities/MealHistory.entity";
import { ChatThread } from "src/modules/chatThread/entities/ChatThread.entity";
import { RefreshToken } from "src/modules/auth/entities/RefreshToken.entity";
import { UserRole } from "src/modules/user/typedefs";
import { PasswordResetCode } from "src/modules/auth/entities/PasswordResetCode.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 25 })
  name: string;

  @Column({type: "enum", enum: UserRole, default: UserRole.Member})
  role: UserRole;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, select: false })
  passwordHash?: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  userPreferences: Relation<UserPreferences>;

  @ManyToOne(() => Family, (family) => family.users, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  family: Relation<Family> | null;

  @OneToMany(() => MealHistory, (mealHistory) => mealHistory.user, {
    cascade: true,
  })
  mealHistory: Relation<MealHistory[]>;

  @OneToMany(() => ChatThread, (chatThread) => chatThread.user, {
    cascade: true,
  })
  chatThreads: Relation<ChatThread[]>;

  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: true,
  })
  refreshTokens: Relation<RefreshToken[]>;

  @OneToMany(() => PasswordResetCode, (code) => code.user, {
    cascade: true,
  })
  passwordResetCodes: Relation<PasswordResetCode[]>
}

