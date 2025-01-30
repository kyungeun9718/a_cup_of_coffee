import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({'name':'TB_PRODUCT_COLOR'})
export class ProductColor {
@PrimaryColumn({name: 'COLOR_NO', type: 'varchar',length:20})
productNo: string;

@PrimaryColumn({name: 'COLOR_NAME', type: 'varchar',length:20})
colorName: string;

@PrimaryColumn({name: 'INST_DTM', type: 'timestamp',default: () => 'CURRENT_TIMESTAMP' })
instDtm: Date;

@PrimaryColumn({name: 'UPDT_DTM', type: 'timestamp'})
updtDtm: Date;
}
