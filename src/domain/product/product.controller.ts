import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('optimal/:deviceToken')
  async getOptimalProduct(@Param('deviceToken') deviceToken: string) {
    return await this.productService.findOptimalProduct(deviceToken);
  }
  @Post('insertMyProduct')
  @ApiOperation({ summary: '새로운 제품 추가', description: 'TB_MY_PRODUCT에 새 제품을 추가합니다.' })
  @ApiResponse({ status: 201, description: '성공적으로 제품이 추가됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async insertMyProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.insertMyProduct(
      createProductDto.memberNo,
      createProductDto.shapeNo,
      createProductDto.colorNo,
      createProductDto.faceNo,
      createProductDto.productName,
      createProductDto.totalPrice,
      createProductDto.coffeePrice,
    );
  }
  
  
}
