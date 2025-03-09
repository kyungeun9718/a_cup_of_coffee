import { Module } from '@nestjs/common';
import { SwaggerService } from './swaggerDB.service';
import { SwaggerController } from './swaggerDB.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductShape } from '../product/entities/product-shape.entity';
import { ProductColor } from '../product/entities/product-color.entity';
import { ProductFace } from '../product/entities/product-face.entity';
import { Member } from '../member/entities/member.entity';

@Module({
  controllers: [SwaggerController],
  providers: [SwaggerService],
  exports: [SwaggerService],
  imports: [TypeOrmModule.forFeature([Product, ProductShape,ProductColor,ProductFace,Member])],
})
export class SwaggerDBModule {}
