import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { Family } from "src/modules/family/Family.entity.js";

@Entity("products_inventory")
export class ProductsInventory {
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

  @OneToOne(() => Family, (family) => family.productsInventory)
  family: Relation<Family>;
}
