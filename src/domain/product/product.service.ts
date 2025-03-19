import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductShape } from './entities/product-shape.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductFace } from './entities/product-face.entity';
import { Member } from '.././member/entities/member.entity';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';
import { getChosung } from '../utils/chosungUtil';

@Injectable()
export class ProductService {

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

  /**
 * 내 제품 등록
 */
  async insertMyProduct(
    memberNo: string,
    shapeNo: string,
    colorNo: string,
    faceNo: string,
    productName: string,
    totalPrice: number,
    coffeePrice: number,
  ): Promise<Product> {

    this.validatePrice(totalPrice, coffeePrice);

    await this.validateProductInput(memberNo, shapeNo, colorNo, faceNo);

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
      buyDtm: new Date(),
      instDtm: new Date(),
    });

    return await this.myProductRepository.save(newProduct);
  }

  //총 가격과 요청한 커피 가격 비교
  private validatePrice(totalPrice: number, coffeePrice: number) {
    if (coffeePrice > totalPrice) {
      throw new BadRequestException('커피 가격은 총 가격보다 클 수 없습니다.');
    }
  }

  //DB값 존재하는지 확인
  private async validateProductInput(
    memberNo: string,
    shapeNo: string,
    colorNo: string,
    faceNo: string,
  ) {
    const memberExists = await this.memberRepository.findOne({ where: { memberNo } });
    if (!memberExists) {
      throw new BadRequestException(`회원 번호(${memberNo})가 존재하지 않습니다.`);
    }

    const shapeExists = await this.productShapeRepository.findOne({ where: { shapeNo: shapeNo } });
    if (!shapeExists) {
      throw new BadRequestException(`Shape 번호(${shapeNo})가 존재하지 않습니다.`);
    }

    const colorExists = await this.productColorRepository.findOne({ where: { colorNo: colorNo } });
    if (!colorExists) {
      throw new BadRequestException(`Color 번호(${colorNo})가 존재하지 않습니다.`);
    }

    const faceExists = await this.productFaceRepository.findOne({ where: { faceNo: faceNo } });
    if (!faceExists) {
      throw new BadRequestException(`Face 번호(${faceNo})가 존재하지 않습니다.`);
    }
  }

  /**
  * 내 제품 조회
  */
  async getProductsByMemberNo(memberNo: string, includeCompleted: boolean = false, searchTerm?: string,): Promise<any> {

    // 1️. 데이터 조회
    const products = await this.getSortedProducts(memberNo, searchTerm);

    // 2️. `Cup` 및 `total_cup` 계산
    let response = products.map((product) => this.mapProductWithCup(product));

    // 3. 완료일 경우 값 제외
    if (!includeCompleted) {
      response = response.filter(product => !product.completed);
    }
    return response;
  }

  private mapProductWithCup(product: Product) {
    const totalCup = this.calculateTotalCup(product);
    const cup = this.calculateCurrentCup(product);

    return {
      product_no: product.productNo,
      shape_no: product.shapeNo,
      color_no: product.colorNo,
      face_no: product.faceNo,
      product_name: product.productName,
      cup: this.isCompleted(cup, totalCup) ? totalCup : cup,
      total_cup: totalCup,
      completed: this.isCompleted(cup, totalCup),
    };
  }

  // `PRODUCT_NAME` 기준으로 오름차순 정렬하여 데이터 조회
  private async getSortedProducts(memberNo: string, searchTerm?: string): Promise<Product[]> {
    let query = this.myProductRepository
      .createQueryBuilder('product')
      .select([
        'product.productNo',
        'product.shapeNo',
        'product.colorNo',
        'product.faceNo',
        'product.productName',
        'product.totalPrice',
        'product.coffeePrice',
        'product.buyDtm',
      ])
      .where('product.memberNo = :memberNo', { memberNo });

    if (searchTerm) {
      const chosungTerm = getChosung(searchTerm); // getChosung을 사용하여 초성 변환

      // 초성 검색을 위해 fn_choSearch 사용
      query = query.andWhere(
        new Brackets(qb => {
          qb.where('product.productName LIKE :searchTerm COLLATE utf8mb4_unicode_ci', { searchTerm: `%${searchTerm}%` }) // 일반 검색
            .orWhere('fn_choSearch(product.productName) LIKE :chosungTerm COLLATE utf8mb4_unicode_ci', { chosungTerm: `${chosungTerm}%` }) // 초성 검색
            .orWhere('SUBSTRING(product.productName, 1, 1) = :searchFirstChar COLLATE utf8mb4_unicode_ci', { searchFirstChar: searchTerm.charAt(0) }); // 첫 글자 검색
        })

      );
    }

    return await query.orderBy('product.productName', 'ASC').getMany();
  }

  //cup값 계산
  private calculateCurrentCup(product: Product): number {
    const now = new Date();
    const buyDate = new Date(product.buyDtm);

    const daysSinceInst = ((now.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceInst * 10) / 10;
  }

  //total cup계산
  private calculateTotalCup(product: Product): number {
    return Math.ceil(product.totalPrice / product.coffeePrice);
  }

  //완료 여부 계산
  private isCompleted(cup: number, totalCup: number): boolean {
    return cup >= totalCup;
  }

  /*
  * 제품 prodcut_no로 조회
  */
  async getProductNo(productNo: string) {
    // 1. 제품 조회
    const product = await this.getProductByNo(productNo);

    // 2. 날짜 포맷 변경
    const formattedInstDtm = this.formatDate(product.buyDtm);
    const formattedToday = this.formatDate(new Date());

    // 3.`cup` 및 `total_cup` 계산
    const cup = this.calculateCurrentCup(product);
    const totalCup = this.calculateTotalCup(product);

    return {
      productNo: product.productNo,
      product_name: product.productName,
      shape_no : product.shapeNo,
      color_no : product.colorNo,
      face_no : product.faceNo,
      total_price : product.totalPrice,
      buy_dtm: formattedInstDtm,
      today: formattedToday,
      cup,
      total_cup: totalCup,
    };

  }

  private async getProductByNo(productNo: string): Promise<Product> {
    const product = await this.myProductRepository.findOne({ where: { productNo } });
    if (!product) {
      throw new NotFoundException(`Product with productNo ${productNo} not found`);
    }
    return product;
  }

  //`YYYY/MM/DD` 형식으로 날짜 변환
   
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 1월은 0부터 시작
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /*
  * 랜덤한 제품 모양, 색, 표정 조회
  */
  async getRandomAttributes() {
    const shape = await this.getRandomEntity(this.productShapeRepository, 'shape');
    const color = await this.getRandomEntity(this.productColorRepository, 'color');
    const face = await this.getRandomEntity(this.productFaceRepository, 'face');

    return {
      shape_no: shape?.shapeNo || '',
      color_no: color?.colorNo || '',
      face_no: face?.faceNo || '',
    };
  }

  private async getRandomEntity<T>(repository: Repository<T>, alias: string): Promise<T | null> {
    return await repository.createQueryBuilder(alias).orderBy('RAND()').getOne();
  }

/*
* 내 제품 상세 수정
*/
async updateMyProductDetail(
  productNo: string,
  shapeNo: string,
  faceNo: string,
  colorNo: string,
  productName: string,
  totalPrice: number,
  buyDtm: string,
): Promise<{ message: string; product_no: string; updated_fields: Partial<Product> }> {
  
  // 제품 조회 (존재 여부 확인)
  await this.getProductByNo(productNo);

  const updateFields: Partial<Product> = {
    shapeNo,
    faceNo,
    colorNo,
    productName,
    totalPrice,
    buyDtm: buyDtm ? new Date(buyDtm) : new Date(), 
    updtDtm: new Date(),
  };

  await this.myProductRepository.update({ productNo }, updateFields);

  return {
    message: 'Product updated successfully',
    product_no: productNo,
    updated_fields: updateFields,
  };
  }

  /*
  * 제품 삭제
  */
  async deleteMyProduct(productNo: string): Promise<{ message: string; product_no: string }> {

    const product = await this.myProductRepository.findOne({ where: { productNo } });
    if (!product) {
      throw new NotFoundException(`Product with productNo ${productNo} not found.`);
    }

    await this.myProductRepository.delete({ productNo });

    return {
      message: 'Product deleted successfully',
      product_no: productNo,
    };
  }

  /**
   * 제품 메모 업데이트
   */
  async updateMemo(productNo: string, memo: string): Promise<Product> {

    this.validateMemoLength(memo);

    const product = await this.myProductRepository.findOne({ where: { productNo } });

    if (!product) {
      throw new NotFoundException(`Product with productNo: ${productNo} not found`);
    }

    product.memo = memo;
    product.updtDtm = new Date();

    return await this.myProductRepository.save(product);
  }

  // 메모 길이 검증 (200자 초과 시 예외 발생)
  private validateMemoLength(memo: string): void {
    if (memo.length > 200) {
      throw new BadRequestException('메모의 최대 길이는 200자입니다.');
    }
  }


}