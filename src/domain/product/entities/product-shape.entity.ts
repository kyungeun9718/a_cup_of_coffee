import { Entity, Column, PrimaryColumn, IntegerType } from "typeorm";

@Entity({'name':'TB_PRODUCT_SHAPE'})
export class ProductShape {
@PrimaryColumn({name: 'SHAPE_NO', type: 'varchar',length:20})
shapeNo: string;

@PrimaryColumn({name: 'SHAPE_NAME', type: 'varchar',length:20})
shapeName: string;

@PrimaryColumn({ name: 'SIZE', type: 'varchar', length: 20 })
size: string;

@PrimaryColumn({name: 'INST_DTM', type: 'datetime',default: () => 'CURRENT_TIMESTAMP' })
instDtm: Date;

@Column({name: 'UPDT_DTM', type: 'datetime', nullable: true})
updtDtm: Date;
}
