import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('optimal/:deviceToken')
  @ApiOperation({ summary: '모양,색깔,표정 랜덤 값 전달', description: '등록되어있지 않은 값을 랜덤으로 전달합니다.' })
  async getOptimalProduct(@Param('deviceToken') deviceToken: string) {
    return await this.productService.findOptimalProduct(deviceToken);
  }
  @Post('insertMyProduct')
  @ApiOperation({ summary: '새로운 제품 추가', description: 'INSERT INTO TB_MY_PRODUCT' })
  @ApiResponse({ status: 201, description: '성공적으로 제품이 추가됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async insertMyProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    const result = await this.productService.insertMyProduct(
      createProductDto.memberNo,
      createProductDto.productName,
      createProductDto.totalPrice,
      createProductDto.coffeePrice,
      createProductDto.shapeNo,
    );

    // 문자열이면 에러 메시지로 간주
    if (typeof result === 'string') {
      throw new BadRequestException(result);
    }

    // 정상 Product 객체 반환 (201 상태)
    return result;
  }
  @Get('getProductsByMemberNo')
  @ApiOperation({ summary: '회원 제품 조회', description: 'SELECT * FROM TB_MY_PRODUCT' })
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
          shape_no: 'round_158px',
          color_no: 'E99024',
          face_no: 'face_06_60px',
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

  @Get('getProductNo/:productNo')
  @ApiOperation({ summary: '제품 조회', description: 'SELECT * FROM TB_MY_PRODUCT WHERE PRODUCT_NO' })
  @ApiParam({ name: 'productNo', required: true })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        product_no : '20250327142055',
        product_name: '노트북',
        shapeNo: "umm_111px",
        colorNo: "FFD599",
        faceNo: "face_06_111px",
        total_price:"100000",
        buy_dtm: '2025/02/01',
        end_dtm: '2025/02/11',
        cup: 9.7,
        total_cup: 10,
      },
    },
  })
  async getProductNo(@Param('productNo') productNo: string) {
    return await this.productService.getProductNo(productNo);
  }

  @Get('randomProduct')
  @ApiOperation({ summary: '모양,색깔,표정 랜덤 값 전달', description: '등록여부와 상관없이 값을 랜덤으로 전달합니다.' })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        shape_no: 'round_158px',
        color_no: 'E99024',
        face_no: 'face_06_60px',
      },
    },
  })
  async getRandomAttributes() {
    return await this.productService.getRandomAttributes();
  }

  @Post('updateMyProductDetail')
  @ApiOperation({ summary: '내 제품 상세 수정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        product_no: { type: 'string', example: '20250320181049' },
        shape_no: { type: 'string', example: 'round_66px' },
        face_no: { type: 'string', example: 'face_06_66px' },
        color_no: { type: 'string', example: 'E99024' },
        product_name: { type: 'string', example: '맥북 프로' },
        total_price: { type: 'number', example: 6000 },
        buy_dtm: { type: 'string', format: 'date', example: '2025-03-19' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        message: 'Product updated successfully',
        product_no: '20250320181049',
        updated_fields: {
          shape_no: 'round_66px',
          face_no: 'face_06_66px',
          color_no: 'E99024',
          product_name: '맥북 프로',
          total_price: 6000,
          buy_dtm: '2025-03-19',
          updt_dtm: '2025-03-19'
        },
      },
    },
  })
  async updateMyProductDetail(
    @Body('product_no') productNo: string,
    @Body('shape_no') shapeNo: string,
    @Body('face_no') faceNo: string,
    @Body('color_no') colorNo: string,
    @Body('product_name') productName: string,
    @Body('total_price') totalPrice: number,
    @Body('buy_dtm') buyDtm: string,
  ) {
    return await this.productService.updateMyProductDetail(
      productNo,
      shapeNo,
      faceNo,
      colorNo,
      productName,
      totalPrice,
      buyDtm,
    );
  }

  @Post('deleteMyProduct')
  @ApiOperation({ summary: '내 제품 삭제'})
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        product_no: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        message: '삭제 성공',
        product_no: '20250320181049',
      },
    },
  })
  async deleteMyProduct(@Body('product_no') productNo: string) {
    return await this.productService.deleteMyProduct(productNo);
  }

  @Post('updateMemo')
  @ApiOperation({
    summary: '메모 수정',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productNo: { type: 'string', example: '20250320181049' },
        memo: { type: 'string', example: '내가 만든 쿠키' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '메모 수정 성공',
    schema: {
      example: {
        productNo: '20250320181049',
        memo: '내가 만든 쿠키',
        updtDtm: '2025-03-18T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '메모 길이가 200자를 초과하는 경우',
    schema: {
      example: {
        statusCode: 400,
        message: '메모의 최대 길이는 200자입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 제품이 존재하지 않는 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '없는 제품입니다.',
        error: 'Not Found',
      },
    },
  })
  async updateMemo(@Body() updateMemoDto: { productNo: string; memo: string }) {
    const { productNo, memo } = updateMemoDto;
    return await this.productService.updateMemo(productNo, memo);
  }

  @Get('details/:productNo')
  @ApiOperation({
    summary: '제품 상세 조회',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        product_no: '20250320181049',
        shape_no: 'round_158px',
        color_no: 'E99024',
        face_no: 'face_06_60px',
        product_name: '맥북 프로',
        total_price: 6000,
        coffee_price: 1000,
        buy_dtm: '2025/03/19',
        end_dtm : '2025/03/25',
        memo: '메모메모메모',
        cup: 3.4,
        total_cup: 6,
        together_time: '5일 2시간 48분 22초'
      },
    },
  })
  async getProductDetails(@Param('productNo') productNo: string) {
    return await this.productService.getProductDetails(productNo);
  }

  @Get('getProductListByMember')
  @ApiOperation({
    summary: '메인API > 내 제품 리스트 조회',
    description: `조회하였을 때 완료된 값은 제외됩니다. 
  - size 0 : 10만원 이하 
  - size 1 : 10만원~100만원 
  - size 2 : 100만원 이상`,
  })
  @ApiQuery({ name: 'memberNo', required: true, description: '회원 번호' })
  @ApiQuery({ name: 'includeCompleted', required: false, type: Boolean, description:
    '완료된 제품 포함 여부. true(완료포함), false(완료미포함)  / null값 허용이며, null일 경우 false로 전달' })

  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: [
        {
          product_no: '20250320181049',
          shape_no: 'round_158px',
          color_no: 'E99024',
          face_no: 'face_06_60px',
          size: 1,
        },
      ],
    },
  })
  
  @ApiResponse({
    status: 400,
    description: '쿼리 파라미터가 잘못된 경우',
    schema: {
      example: {
        statusCode: 400,
        message: '회원번호 오류',
        error: 'Bad Request',
      },
    },
  })
  
  async getProductListByMember(
    @Query('memberNo') memberNo: string,
    @Query('includeCompleted') includeCompleted?: boolean,
  ) {
    return this.productService.getProductListByMember(memberNo, includeCompleted);
  }

  @Get('getCompletedProductsDetail')
  @ApiOperation({
    summary: '기록함 > 제품 상세 리스트',
    description: `완료된 제품 상세 리스트`
  })
  @ApiQuery({ name: 'memberNo', required: true, description: '회원 번호' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['buy_dtm', 'product_name'], description: '정렬 기준' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: '정렬 순서' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: [
        {
          product_no: '20250320123456',
          shape_no: 'CIRC001',
          color_no: '000000',
          face_no: 'FACE001',
          cup: 10.0,
          total_price: 10000,
          end_dt: '2025/03/10',
          together_time: '10',
          buy_dtm: "2025/03/01",
          product_name: "텀블러"
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: '쿼리 파라미터가 잘못된 경우',
    schema: {
      example: {
        statusCode: 400,
        message: '회원번호 오류',
        error: 'Bad Request',
      },
    },
  })
  async getCompletedProductsDetail(
    @Query('memberNo') memberNo: string,
    @Query('orderBy') orderBy: 'buy_dtm' | 'product_name' = 'buy_dtm',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC'
  ) {
    return this.productService.getCompletedProductsDetail(memberNo, orderBy, order);
  }

  
  @Get('getCompletedProductsSummary')
  @ApiOperation({
    summary: '기록함 > 제품 리스트',
    description: `완료된 제품 리스트`
  })
  @ApiQuery({ name: 'memberNo', required: true, description: '회원 번호' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['buy_dtm', 'product_name'], description: '정렬 기준' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: '정렬 순서' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: [
        {
          product_no: '20250320123456',
          shape_no: 'CIRC001',
          color_no: '000000',
          face_no: 'FACE001',
          cup: 10.0,
          buy_dtm: "2025/03/01",
          product_name: "텀블러"
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: '쿼리 파라미터가 잘못된 경우',
    schema: {
      example: {
        statusCode: 400,
        message: '회원번호 오류',
        error: 'Bad Request',
      },
    },
  })
  async getCompletedProductsSummary(
    @Query('memberNo') memberNo: string,
    @Query('orderBy') orderBy: 'buy_dtm' | 'product_name' = 'buy_dtm',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC'
  ) {
    return this.productService.getCompletedProductsSummary(memberNo, orderBy, order);
  }

}
