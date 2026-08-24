import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/User.entity";
import type { MealScore } from "./typedefs";

@Entity("meal_history")
export class MealHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "smallint" })
  score: MealScore;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.mealHistory)
  @JoinColumn()
  user: User;
}
