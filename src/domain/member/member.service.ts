import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../product/entities/product.entity';
import { ProductShape } from '../product/entities/product-shape.entity';
import { ProductColor } from '../product/entities/product-color.entity';
import { ProductFace } from '../product/entities/product-face.entity';
import { Member } from '.././member/entities/member.entity';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class MemberService {

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
  
  async deleteMember(deviceToken: string): Promise<{ message: string }> {
    const member = await this.memberRepository.findOne({ where: { deviceToken } });
    if (!member) {
      throw new NotFoundException('존재하지 않는 회원입니다.');
    }
  
    const memberNo = member.memberNo;
  
    await this.myProductRepository.delete({ memberNo });
    await this.memberRepository.delete({ deviceToken });
  
    return { message: `탈퇴되셨습니다.` };
  }
  

}