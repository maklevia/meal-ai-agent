import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";

@Entity()
export class FamilyInvitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "timestamptz", default: "NOW()" })
  createdAt: Date;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @ManyToOne(() => Family, { onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  family: Relation<Family>;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  invitedBy: Relation<User | null>;
}
