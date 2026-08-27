import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { User } from "src/modules/user/entities/User.entity.js";
import { ProductsInventory } from "src/modules/productsInventory/entities/ProductsInventory.entity.js";

@Entity("family")
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.family)
  users: Relation<User[]>;

  @OneToOne(() => ProductsInventory, (inventory) => inventory.family)
  @JoinColumn()
  productsInventory: Relation<ProductsInventory>;
}
