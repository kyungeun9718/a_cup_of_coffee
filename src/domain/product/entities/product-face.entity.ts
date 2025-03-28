import { Entity, Column, PrimaryColumn, IntegerType } from "typeorm";

@Entity({'name':'TB_PRODUCT_FACE'})
export class ProductFace {
@PrimaryColumn({name: 'FACE_NO', type: 'varchar',length:20})
faceNo: string;

@PrimaryColumn({name: 'FACE_NAME', type: 'varchar',length:20})
faceName: string;

@PrimaryColumn({ name: 'SIZE', type: 'varchar', length: 20 })
size: string;

@PrimaryColumn({name: 'INST_DTM', type: 'datetime',default: () => 'CURRENT_TIMESTAMP' })
instDtm: Date;

@Column({name: 'UPDT_DTM', type: 'datetime', nullable: true})
updtDtm: Date;
}
