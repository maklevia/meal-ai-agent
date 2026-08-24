import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../user/User.entity";
import { ProductsInventory } from "../productsInventory/ProductsInventory.entity";

@Entity("family")
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.family)
  users: User[];

  @OneToOne(() => ProductsInventory, (inventory) => inventory.family)
  @JoinColumn()
  productsInventory: ProductsInventory;
}
