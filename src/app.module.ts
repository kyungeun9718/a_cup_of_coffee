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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env', // 개발 환경에서는 이 파일을 로드
    }),
    
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'mysql',
      database: process.env.DB_DATABASE,
      host: process.env.host,
      port: Number(process.env.DB_PROT),
      username: process.env.DB_USERNAME,
      logging: true,
      synchronize: true,
      entities: [Product, ProductFace, ProductShape, ProductColor],}),
//    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
