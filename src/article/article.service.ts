import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/create-article.dto';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) {}
  async createArticle(user: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.author = user;
    article.slug = this.generateArticleSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity) {
    return { article };
  }

  private generateArticleSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
