import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from '@app/tag/tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@app/tag/tag.entity';
import { ormOptions } from '@app/db/orm-options';

describe('TagService', () => {
  let service: TagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormOptions), TypeOrmModule.forFeature([TagEntity])],
      providers: [TagService],
    }).compile();

    service = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
