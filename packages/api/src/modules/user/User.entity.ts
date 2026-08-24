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
import { UserPreferences } from "../userPreferences/UserPreferences.entity";
import { Family } from "../family/Family.entity";
import { MealHistory } from "../mealHistory/MealHistory.entity";

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
}
