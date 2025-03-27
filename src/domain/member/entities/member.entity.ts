import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({'name':'TB_MEMBER'})
export class Member {
@PrimaryColumn({name: 'DEVICE_TOKEN', type: 'varchar',length:255})
deviceToken: string;

@PrimaryColumn({name: 'MEMBER_NO', type: 'varchar',length:20})
memberNo: string;

@Column({name: 'MEMBER_NAME', type: 'varchar',length:20, nullable: true})
memberName: string;

@PrimaryColumn({name: 'JOIN_DTM', type: 'datetime',default: () => 'CURRENT_TIMESTAMP' })
joinDtm: Date;

@Column({name: 'UPDT_DTM', type: 'datetime', nullable: true})
updtDtm: Date;
}
