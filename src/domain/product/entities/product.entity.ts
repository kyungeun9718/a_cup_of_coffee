import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({'name':'TB_MY_PRODUCT'})
export class Product {
@PrimaryColumn({name: 'PRODUCT_NO', type: 'varchar',length:20})
productNo: string;

@PrimaryColumn({name: 'MEMBER_NO', type: 'varchar',length:20})
memberNo: string;

@PrimaryColumn({name: 'SHAPE_NO', type: 'varchar',length:20})
shapeNo: string;

}
