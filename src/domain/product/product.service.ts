import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductShape } from './entities/product-shape.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductFace } from './entities/product-face.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductService {
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  constructor(
    @InjectRepository(Product)
    private readonly myProductRepository: Repository<Product>,

    @InjectRepository(ProductShape)
    private readonly productShapeRepository: Repository<ProductShape>,

    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,

    @InjectRepository(ProductFace)
    private readonly productFaceRepository: Repository<ProductFace>,
  ) { }

  async findOptimalProduct(memberNo: string) {
    // 1. TB_MY_PRODUCT에서 현재 사용자의 shape_no, color_no, face_no 가져오기
    const myProducts = await this.myProductRepository
      .createQueryBuilder('product')
      .select(['product.SHAPE_NO', 'product.COLOR_NO', 'product.FACE_NO'])
      .where('product.MEMBER_NO = :memberNo', { memberNo })
      .getRawMany();

    // 2. 현재 보유한 SHAPE_NO, COLOR_NO, FACE_NO 리스트 추출
    const existingShapeNos = myProducts.map((p) => p.SHAPE_NO).filter((s) => s !== '');
    const existingColorNos = myProducts.map((p) => p.COLOR_NO).filter((c) => c !== '');
    const existingFaceNos = myProducts.map((p) => p.FACE_NO).filter((f) => f !== '');

    // 3. SHAPE_NO가 NULL이면 랜덤 선택
    let shape = null;
    if (existingShapeNos.length === 0) {
      console.log('existingShapeNos    :  ' + existingShapeNos.length);
      shape = await this.productShapeRepository
        .createQueryBuilder('shape')
        .orderBy('RAND()')
        .getOne();
    } else {
      shape = await this.productShapeRepository
        .createQueryBuilder('shape')
        .where('shape.SHAPE_NO NOT IN (:...existingShapeNos)', { existingShapeNos })
        .orderBy('RAND()')
        .getOne();
      // 조회 결과가 없을 경우 다시 랜덤 조회
      if (!shape) {
        shape = await this.productShapeRepository
          .createQueryBuilder('shape')
          .orderBy('RAND()')
          .getOne();
      }
    }

    // 4. COLOR_NO가 NULL이면 랜덤 선택
    let color = null;
    console.log('existingColorNos.length ' + existingColorNos.length);
    if (existingColorNos.length === 0) {
      console.log('existingColorNos.length in' + existingColorNos.length);
      color = await this.productColorRepository
        .createQueryBuilder('color')
        .orderBy('RAND()')
        .getOne();
    } else {
      color = await this.productColorRepository
        .createQueryBuilder('color')
        .where('color.COLOR_NO NOT IN (:...existingColorNos)', { existingColorNos })
        .orderBy('RAND()')
        .getOne();
      // 조회 결과가 없을 경우 다시 랜덤 조회
      if (!color) {
        color = await this.productColorRepository
          .createQueryBuilder('color')
          .orderBy('RAND()')
          .getOne();
      }
    }

    // 5. FACE_NO가 NULL이면 랜덤 선택
    let face = null;
    if (existingFaceNos.length === 0) {
      face = await this.productFaceRepository
        .createQueryBuilder('face')
        .orderBy('RAND()')
        .getOne();
    } else {
      face = await this.productFaceRepository
        .createQueryBuilder('face')
        .where('face.FACE_NO NOT IN (:...existingFaceNos)', { existingFaceNos })
        .orderBy('RAND()')
        .getOne();
      // 조회 결과가 없을 경우 다시 랜덤 조회
      if (!face) {
        face = await this.productFaceRepository
          .createQueryBuilder('face')
          .orderBy('RAND()')
          .getOne();
      }
    }

    return {
      shape: shape?.productNo || '',
      color: color?.productNo || '',
      face: face?.productNo || '',
    };
  }
}