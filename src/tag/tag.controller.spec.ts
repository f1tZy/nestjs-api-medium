import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from '@app/tag/tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormOptions } from '@app/db/orm-options';
import { TagEntity } from '@app/tag/tag.entity';

describe('TagController', () => {
  let controller: TagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormOptions), TypeOrmModule.forFeature([TagEntity])],
      controllers: [TagController],
    }).compile();

    controller = module.get<TagController>(TagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
