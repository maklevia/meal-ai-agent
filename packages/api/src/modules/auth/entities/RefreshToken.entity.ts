import { User } from "src/modules/user/entities/User.entity.js";
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";

@Entity("refresh_tokens")
@Check('"expires_at" > "created_at"')
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 500, unique: true })
  refreshToken: string;

  @Index()
  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  user: Relation<User>;
}
