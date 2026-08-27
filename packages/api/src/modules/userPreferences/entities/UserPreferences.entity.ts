import {
  Check,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { SpecialDiet } from "src/modules/userPreferences/typedefs.js";
import { User } from "src/modules/user/entities/User.entity.js";

@Entity("user_preferences")
@Check("CHK_age_range", '"age" > 14 AND "age" < 99')
@Check("CHK_height_range", '"height" > 0 AND "height" < 300')
@Check("CHK_weight_positive", '"weight" > 0')
@Check("CHK_kcal_positive", '"kcal_per_day" > 0')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  height: number;

  @Column({ type: "int" })
  weight: number;

  @Column({ type: "int" })
  age: number;

  @Column({ type: "int" })
  kcalPerDay: number;

  @Column({ type: "enum", enum: SpecialDiet, default: SpecialDiet.None })
  specialDiet: SpecialDiet;

  @OneToOne(() => User, (user) => user.userPreferences)
  user: Relation<User>;
}
