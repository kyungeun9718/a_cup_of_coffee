import { BadRequestException, Injectable } from '@nestjs/common';
import { Product } from '../product/entities/product.entity';
import { ProductShape } from '../product/entities/product-shape.entity';
import { ProductColor } from '../product/entities/product-color.entity';
import { ProductFace } from '../product/entities/product-face.entity';
import { Member } from '../member/entities/member.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class SwaggerService {

  constructor(

    private readonly entityManager: EntityManager,

    @InjectRepository(Product)
    private readonly myProductRepository: Repository<Product>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(ProductShape)
    private readonly productShapeRepository: Repository<ProductShape>,

    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,

    @InjectRepository(ProductFace)
    private readonly productFaceRepository: Repository<ProductFace>,
  ) { }

  async getAllShapes(): Promise<ProductShape[]> {
    return await this.productShapeRepository.find();
  }

  async getAllColor(): Promise<ProductColor[]> {
    return await this.productColorRepository.find();
  }

  async getAllFace(): Promise<ProductFace[]> {
    return await this.productFaceRepository.find();
  }

  async getAllMember(): Promise<Member[]> {
    return await this.memberRepository.find();
  }

  async getMyProducts(memberNo?: string): Promise<Product[]> {
    if (memberNo) {
      return await this.myProductRepository.find({ where: { memberNo } });
    }
    return await this.myProductRepository.find();
  }
}