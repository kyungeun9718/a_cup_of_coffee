import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery} from '@nestjs/swagger';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('optimal/:deviceToken')
  @ApiOperation({ summary: '새로운 제품 모양,색깔,표정 전달', description: '캐릭터의 모양, 색깔, 표정을 랜덤으로 값 전달합니다.' })
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
  @Get('getProductsByMemberNo')
  @ApiOperation({ summary: '회원 제품 조회', description: 'TB_MY_PRODUCT에서 특정 회원의 제품을 조회합니다.' })
  @ApiQuery({ name: 'memberNo', required: true, description: '회원 번호' })
  @ApiQuery({ name: 'includeCompleted', required: false, description: '완료된 제품 포함 여부 (기본값: false)' })
  @ApiQuery({ name: 'searchTerm', required: false, description: '검색' })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: [
        {
          product_no: '20250310153000',
          shape_no: 'CIRC001',
          color_no: '000000',
          face_no: 'BASE001',
          product_name: '노트북',
          cup: 5,
          total_cup: 10,
        },
      ],
    },
  })
  async getMyProducts(
    @Query('memberNo') memberNo: string,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    const includeCompletedBool = includeCompleted ? JSON.parse(includeCompleted.toLowerCase()) : false;

    return await this.productService.getProductsByMemberNo(memberNo, includeCompletedBool, searchTerm);
  }
}
