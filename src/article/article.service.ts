import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persist-article.dto';
import slugify from 'slugify';
import dataSourceConstructor from '../db/data-source';
import { GetArticlesQueryInterface } from '@app/article/types/get-articles-query.interface';
import { ArticlesResponseInterface } from '@app/article/types/articles-response.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(ArticleEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAllArticles(userId: string, query: GetArticlesQueryInterface): Promise<ArticlesResponseInterface> {
    const dataSource = await dataSourceConstructor;
    const queryBuilder = dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({ where: { username: query.author } });

      if (author) {
        queryBuilder.andWhere('articles.author = :id', {
          id: author.id,
        });
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();

    return { articles, articlesCount };
  }

  async createArticle(user: UserEntity, createArticleDto: PersistArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.author = user;
    article.slug = this.generateArticleSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string) {
    const article = await this.articleRepository.findOneBy({ slug });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async deleteArticleBySlug(userId: string, slug: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticleBySlug(userId: string, slug: string, updateArticleDto: PersistArticleDto): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity) {
    return { article };
  }

  private generateArticleSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
