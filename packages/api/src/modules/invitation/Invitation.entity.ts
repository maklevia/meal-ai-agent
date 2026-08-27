import { UserRole } from "src/modules/user/typedefs";
import { User } from "src/modules/user/User.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity("invitations")
export class Invitation{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", length: 255})
    email: string;

    @Column({type: "enum", enum: UserRole})
    role: UserRole;

    @CreateDateColumn({type: "timestamptz", default: () => "NOW()"})
    createdAt: Date;

    @Column({type: "timestamptz"})
    expiresAt: Date;

    @ManyToOne(() => User, {onDelete: "SET NULL", nullable: true})
    @JoinColumn()
    invitedBy: Relation<User | null>;
}
