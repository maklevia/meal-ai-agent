import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { Family } from "src/modules/family/entities/Family.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "jsonb" })
  details: { volume: number; quantity: number };

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  finishedAt: Date | null;

  @ManyToOne(() => Family, (family) => family.products, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  family: Relation<Family>;
}
