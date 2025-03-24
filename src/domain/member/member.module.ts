import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Member } from '.././member/entities/member.entity';
import { ProductShape } from '../product/entities/product-shape.entity';
import { ProductColor } from '../product/entities/product-color.entity';
import { ProductFace } from '../product/entities/product-face.entity';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
  imports: [TypeOrmModule.forFeature([Product, ProductShape,ProductColor,ProductFace,Member])],
})
export class MemberModule {}
