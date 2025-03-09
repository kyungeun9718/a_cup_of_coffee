import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductShape } from './entities/product-shape.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductFace } from './entities/product-face.entity';
import { Member } from '.././member/entities/member.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';

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

  /**
   * DEVICE_TOKEN을 기준으로 MEMBER를 찾고 없으면 생성
   */
  async findOrCreateMemberByDeviceToken(
    deviceToken: string,
    entityManager: EntityManager, // 트랜잭션 사용
  ): Promise<Member> {
    return await entityManager.transaction(async (manager) => {
      // 1. deviceToken이 있는지 확인
      let member = await manager.findOne(Member, { where: { deviceToken } });

      if (!member) {
        // 2️. 현재 시간 기반으로 MEMBER_NO
        const now = new Date();
        const dateString = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

        // 3️. 현재 초(YYYYMMDDHHMMSS)에 생성된 MEMBER_NO 중 가장 큰 값을 가져옴 (락 적용)
        const lastMember = await manager
          .createQueryBuilder(Member, 'member')
          .where('member.memberNo >= :minMemberNo', { minMemberNo: dateString + '000000' })
          .orderBy('member.memberNo', 'DESC')
          .setLock('pessimistic_write') // TypeORM의 QueryBuilder에서 제공하는 함수. 락 설정
          .getOne();

        // 4. 마지막 6자리 증가 (중복 방지)
        let sequence = '000000';
        if (lastMember) {
          const lastSeq = parseInt(lastMember.memberNo.slice(-6), 10);
          sequence = (lastSeq + 1).toString().padStart(6, '0');
        }

        const newMemberNo = dateString + sequence;

        // 5️. 새로운 멤버 생성
        member = manager.create(Member, {
          deviceToken,
          memberNo: newMemberNo,
          joinDtm: new Date(),
        });

        await manager.save(member);
      }

      return member;
    });
  }

  /**
 * 랜덤으로 새로운 값을 선택하거나, 최소 사용된 값을 선택
 */
  private async getRandomOrLeastUsed(
    manager: EntityManager,
    entity: any,
    column: string,
    existingValues: string[],
  ) {
    if (existingValues.length === 0) {
      return await manager.createQueryBuilder(entity, 'e').orderBy('RAND()').getOne();
    } else {
      let result = await manager
        .createQueryBuilder(entity, 'e')
        .where(`e.${column} NOT IN (:...existingValues)`, { existingValues })
        .orderBy('RAND()')
        .getOne();

      if (!result) { //모두 사용하여 사용할 수 있는 값이 없을 경우 랜덤값으로 나타내기.
        result = await manager.createQueryBuilder(entity, 'e').orderBy('RAND()').getOne();
      }
      return result;
    }
  }

  async findOptimalProduct(deviceToken: string) {

    return await this.entityManager.transaction(async (manager) => {
      // 1. deviceToken을 이용하여 member 조회 또는 생성
      const member = await this.findOrCreateMemberByDeviceToken(deviceToken, manager);
      const memberNo = member.memberNo;

      // 2. TB_MY_PRODUCT에서 현재 사용자의 shape_no, color_no, face_no 가져오기
      const myProducts = await this.myProductRepository
        .createQueryBuilder('product')
        .select(['product.SHAPE_NO', 'product.COLOR_NO', 'product.FACE_NO'])
        .where('product.MEMBER_NO = :memberNo', { memberNo })
        .getRawMany();

      // 3. 현재 보유한 SHAPE_NO, COLOR_NO, FACE_NO 리스트 추출
      const existingShapeNos = myProducts.map((p) => p.SHAPE_NO).filter((s) => s !== '');
      const existingColorNos = myProducts.map((p) => p.COLOR_NO).filter((c) => c !== '');
      const existingFaceNos = myProducts.map((p) => p.FACE_NO).filter((f) => f !== '');

      let shape, color, face;

      // 4️. 만약 `TB_MY_PRODUCT`에 내 `MEMBER_NO` 데이터가 없으면 랜덤 값 선택 후 `TB_MY_PRODUCT`에 저장
      if (myProducts.length === 0) {
        shape = await manager.createQueryBuilder(ProductShape, 'shape').orderBy('RAND()').getOne();
        color = await manager.createQueryBuilder(ProductColor, 'color').orderBy('RAND()').getOne();
        face = await manager.createQueryBuilder(ProductFace, 'face').orderBy('RAND()').getOne();
      } else {
        // 5️. 기존 데이터가 있는 경우
        shape = await this.getRandomOrLeastUsed(manager, ProductShape, 'SHAPE_NO', existingShapeNos);
        color = await this.getRandomOrLeastUsed(manager, ProductColor, 'COLOR_NO', existingColorNos);
        face = await this.getRandomOrLeastUsed(manager, ProductFace, 'FACE_NO', existingFaceNos);
      }

      return {
        memberNo,
        shapeNo: shape?.productNo || '',
        colorNo: color?.productNo || '',
        faceNo: face?.productNo || '',
      };
    });
  }
  async insertMyProduct(
    memberNo: string,
    shapeNo: string,
    colorNo: string,
    faceNo: string,
    productName: string,
    totalPrice: number,
    coffeePrice: number,
  ): Promise<Product> {
    const now = new Date();
    const productNo = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

    const newProduct = this.myProductRepository.create({
      productNo,
      memberNo,
      shapeNo,
      colorNo,
      faceNo,
      productName,
      totalPrice,
      coffeePrice,
      instDtm: new Date(),
    });

    return await this.myProductRepository.save(newProduct);
  }
}