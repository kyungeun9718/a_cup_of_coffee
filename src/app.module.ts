import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ormConfig } from './orm.config';
import { ProductModule } from './domain/product/product.module';
import { ConfigModule } from '@nestjs/config'
import { ProductFace } from './domain/product/entities/product-face.entity';
import { ProductShape } from './domain/product/entities/product-shape.entity';
import { ProductColor } from './domain/product/entities/product-color.entity';
import { Product } from './domain/product/entities/product.entity';
import { Member } from './domain/member/entities/member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined :  '.development.env', // 운영이면 env 파일 없이 Cloudtype 환경변수 사용
    }),

  
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'mysql',
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
   //   port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      logging: true,
      synchronize: true,
      entities: [Product, ProductFace, ProductShape, ProductColor, Member],}),
//    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
