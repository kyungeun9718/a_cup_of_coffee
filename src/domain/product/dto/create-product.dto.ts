import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: '20250307173415000000', description: '회원 번호' })
    memberNo: string;
  
    @ApiProperty({ example: 'CIRC001', description: 'Shape 번호' })
    shapeNo: string;
  
    @ApiProperty({ example: 'FFBE4A', description: 'Color 번호' })
    colorNo: string;
  
    @ApiProperty({ example: 'COMF001', description: 'Face 번호' })
    faceNo: string;
  
    @ApiProperty({ example: '노트북', description: '제품 이름' })
    productName: string;
  
    @ApiProperty({ example: 2000000, description: '총 가격' })
    totalPrice: number;
  
    @ApiProperty({ example: 3000, description: '커피 가격' })
    coffeePrice: number;
}
