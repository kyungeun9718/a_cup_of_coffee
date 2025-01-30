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
  ) {}
  
  async findOptimalProduct(memberNo: string) {
    const shapeNo = await this.findOptimalValue(
      'SHAPE_NO',
      this.productShapeRepository,
      memberNo,
    );
    const colorNo = await this.findOptimalValue(
      'COLOR_NO',
      this.productColorRepository,
      memberNo,
    );
    const faceNo = await this.findOptimalValue(
      'FACE_NO',
      this.productFaceRepository,
      memberNo,
    );

    return { shapeNo, colorNo, faceNo };
  }

  private async findOptimalValue(
    column: string,
    repository: Repository<any>,
    memberNo: string,
  ): Promise<any> {
    // 1. 특정 MEMBER_NO가 가진 값 목록 가져오기
    const usedValues = await this.myProductRepository
      .createQueryBuilder('Product')
      .select(`Product.${column}`)
      .where(`Product.memberNo = :memberNo`, { memberNo })
      .getRawMany();

      console.log(usedValues.toString);

    const usedValueNos = usedValues.map((row) => row[column]);

    // 2. 사용되지 않은 값이 있는 경우 랜덤으로 하나 가져오기
    const unusedValue = await repository
      .createQueryBuilder('entity')
      .where(`entity.${column} NOT IN (:...usedValueNos)`, { usedValueNos })
      .orderBy('RAND()')
      .getOne();

    if (unusedValue) {
      return unusedValue[column];
    }

    // 3. 모든 값이 사용된 경우, 가장 적게 사용된 값 가져오기
    const leastUsedValue = await this.myProductRepository
      .createQueryBuilder('myProduct')
      .select(`myProduct.${column}`)
      .groupBy(`myProduct.${column}`)
      .orderBy('COUNT(myProduct.productNo)', 'ASC')
      .limit(1)
      .getRawOne();

    return leastUsedValue ? leastUsedValue[column] : null;
  }
}
