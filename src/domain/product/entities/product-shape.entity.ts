import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({'name':'TB_MY_PRODUCT_SHAPE'})
export class ProductShape {
@PrimaryColumn({name: 'SHAPE_NO', type: 'varchar',length:20})
productNo: string;

@PrimaryColumn({name: 'SHAPE_NAME', type: 'varchar',length:20})
shapeName: string;

}
