import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { User } from "src/modules/user/entities/User.entity";
import { ProductsInventory } from "src/modules/productsInventory/entities/ProductsInventory.entity";

@Entity("families")
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @Column({ type: "uuid", nullable: true, unique: true })
  invitationToken: string | null;

  @OneToMany(() => User, (user) => user.family)
  users: Relation<User[]>;

  @ManyToOne(() => User, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn()
  owner: Relation<User>;

  @OneToOne(() => ProductsInventory, (inventory) => inventory.family, {
    nullable: true,
    onDelete: "SET NULL",
    cascade: true,
  })
  @JoinColumn()
  productsInventory: Relation<ProductsInventory> | null;
}
