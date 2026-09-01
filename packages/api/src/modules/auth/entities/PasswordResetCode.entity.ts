import { User } from "src/modules/user/entities/User.entity.js";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity("password_reset_codes")
export class PasswordResetCode {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 255 })
    codeHash: string;

    @CreateDateColumn({type: "timestamptz", default: "NOW()"})
    createdAt: Date;

    @Column({type: "timestamptz"})
    expiresAt: Date;

    @ManyToOne(() => User, (user) => user.passwordResetCodes, { onDelete: "CASCADE" })
    user: Relation<User>;
}