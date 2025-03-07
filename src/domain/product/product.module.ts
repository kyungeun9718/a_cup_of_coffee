import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Member } from '.././member/entities/member.entity';
import { ProductShape } from './entities/product-shape.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductFace } from './entities/product-face.entity';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product, ProductShape,ProductColor,ProductFace,Member])],
})
export class ProductModule {}
