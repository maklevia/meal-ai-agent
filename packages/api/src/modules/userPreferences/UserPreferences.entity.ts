import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SpecialDiet } from "./typedefs";
import { User } from "../user/User.entity";

@Entity("user_preferences")
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
  user: User;
}
