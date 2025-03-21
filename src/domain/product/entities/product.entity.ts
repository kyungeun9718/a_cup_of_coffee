import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({'name':'TB_MY_PRODUCT'})
export class Product {
@PrimaryColumn({name: 'PRODUCT_NO', type: 'varchar',length:20})
productNo: string;

@PrimaryColumn({name: 'MEMBER_NO', type: 'varchar',length:20})
memberNo: string;

@PrimaryColumn({name: 'SHAPE_NO', type: 'varchar',length:20})
shapeNo: string;

@PrimaryColumn({name: 'COLOR_NO', type: 'varchar',length:20})
colorNo: string;

@PrimaryColumn({name: 'FACE_NO', type: 'varchar',length:20})
faceNo: string;

@PrimaryColumn({name: 'PRODUCT_NAME', type: 'varchar',length:20})
productName: string;

@PrimaryColumn({name: 'TOTAL_PRICE', type: 'int'})
totalPrice: number;

@PrimaryColumn({name: 'COFFEE_PRICE', type: 'int'})
coffeePrice: number;

@Column({name: 'memo', type: 'varchar', length:200, nullable: true})
memo: string;

@PrimaryColumn({name: 'BUY_DTM', type: 'datetime',default: () => 'CURRENT_TIMESTAMP' })
buyDtm: Date;

@PrimaryColumn({name: 'INST_DTM', type: 'datetime',default: () => 'CURRENT_TIMESTAMP' })
instDtm: Date;

@Column({name: 'UPDT_DTM', type: 'datetime', nullable: true})
updtDtm: Date;
}
