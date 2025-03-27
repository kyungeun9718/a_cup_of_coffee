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
  
    // 유효성 검사 메소드
    private validateMemberName(name: string) {
      const trimmed = name.trim();
      if (trimmed.length < 1) {
        throw new BadRequestException('최소 1자 이상이어야 합니다.');
      }
    
      if (trimmed.length > 20) {
        throw new BadRequestException('최대 20자까지 입력할 수 있습니다.');
      }
    }
  
    // memberName 업데이트 메소드
    async updateMemberName(memberNo: string, newName: string): Promise<Member> {
      this.validateMemberName(newName);
  
      const member = await this.memberRepository.findOne({ where: { memberNo } });
      if (!member) {
        throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
      }
  
      member.memberName = newName;
      member.updtDtm = new Date();
      return await this.memberRepository.save(member);
    }

}