import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Get('optimal/:deviceToken')
  async getOptimalProduct(@Param('deviceToken') deviceToken: string) {
    return await this.productService.findOptimalProduct(deviceToken);
  }
  @Post('insertMyProduct')
  async insertMyProduct(
    @Body('memberNo') memberNo: string,
    @Body('shapeNo') shapeNo: string,
    @Body('colorNo') colorNo: string,
    @Body('faceNo') faceNo: string,
    @Body('productName') productName: string,
    @Body('totalPrice') totalPrice: number,
    @Body('coffeePrice') coffeePrice: number,
  ) {
    return await this.productService.insertMyProduct(
      memberNo,
      shapeNo,
      colorNo,
      faceNo,
      productName,
      totalPrice,
      coffeePrice,
    );
  }
  
}
