import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './orm.config';
import { ProductModule } from './domain/product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}