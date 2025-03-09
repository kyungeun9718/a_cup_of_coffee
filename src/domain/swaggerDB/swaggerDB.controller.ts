import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SwaggerService } from './swaggerDB.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductShape } from '../product/entities/product-shape.entity';
import { ProductColor } from '../product/entities/product-color.entity';
import { ProductFace } from '../product/entities/product-face.entity';
import { Member } from '../member/entities/member.entity';
import { Product } from '../product/entities/product.entity';

@ApiTags('Swagger DB')
@Controller('swagger')
export class SwaggerController {
  constructor(private readonly swaggerService: SwaggerService) {}

  @Get('tbProductShape')
  @ApiOperation({ summary: '모양 조회', description: 'TB_PRODUCT_SHAPE 테이블의 모든 데이터를 조회합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: [ProductShape] })
  async getAllShapes(): Promise<ProductShape[]> {
    return await this.swaggerService.getAllShapes();
  }

  @Get('tbProductColor')
  @ApiOperation({ summary: '색깔 조회', description: 'TB_PRODUCT_Color 테이블의 모든 데이터를 조회합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: [ProductColor] })
  async getAllColor(): Promise<ProductColor[]> {
    return await this.swaggerService.getAllColor();
  }

  @Get('tbProductFace')
  @ApiOperation({ summary: '표정 조회', description: 'TB_PRODUCT_Face 테이블의 모든 데이터를 조회합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: [ProductFace] })
  async getAllFace(): Promise<ProductFace[]> {
    return await this.swaggerService.getAllFace();
  }

  @Get('tbMember')
  @ApiOperation({ summary: '전체 회원 조회'})
  @ApiResponse({ status: 200, description: '성공', type: [Member] })
  async getAllMember(): Promise<Member[]> {
    return await this.swaggerService.getAllMember();
  }
  
  @Get('tbMyProduct')
  @ApiOperation({ summary: '제품 조회'})
  @ApiResponse({ status: 200, description: '성공', type: [Member] })
  @ApiQuery({ name: 'memberNo', required: false, description: '회원 번호 (선택 사항, 없으면 전체 조회)' })
  async getMyProducts(@Query('memberNo') memberNo?: string): Promise<Product[]> {
    return await this.swaggerService.getMyProducts(memberNo);
  }
}
