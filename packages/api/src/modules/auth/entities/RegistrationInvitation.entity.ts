import { UserRole } from "src/modules/user/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity("registration_invitations")
@Check('"expires_at" > "created_at"')
export class RegistrationInvitation{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
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
