import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "src/modules/user/User.entity.js";
import type { MealScore } from "src/modules/mealHistory/typedefs.js";

@Entity("meal_history")
@Check("CHK_score_range", '"score" >= 1 AND "score" <= 5')
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
