import slugify from 'slugify';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persist-article.dto';
import { initializeDataSource } from '../db/initialize-data-source';
import { GetArticlesQueryInterface } from '@app/article/types/get-articles-query.interface';
import { ArticlesResponseInterface } from '@app/article/types/articles-response.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { GetArticlesFeedQueryInterface } from '@app/article/types/get-articles-feed-query.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>,
  ) {}

  async getAllArticles(userId: string, query: GetArticlesQueryInterface): Promise<ArticlesResponseInterface> {
    const dataSource = await initializeDataSource;
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
      const author = await this.getCurrentUserByName(query.author);

      if (!author) {
        throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
      }

      queryBuilder.andWhere('articles.author = :id', {
        id: author.id,
      });
    }

    if (query.favorited) {
      const user = await this.getCurrentUserByName(query.favorited, ['favorites']);

      if (!user) {
        throw new HttpException('Favorite user not found', HttpStatus.NOT_FOUND);
      }

      const articlesIds = user.favorites.map((article) => article.id);

      if (articlesIds.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids: articlesIds });
      } else {
        queryBuilder.andWhere('0=1');
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: string[] = [];

    if (userId) {
      const currentUser = await this.getCurrentUserById(userId, ['favorites']);
      favoriteIds = currentUser.favorites.map((article) => article.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      return { ...article, favorited: favoriteIds.includes(article.id) };
    });

    const articlesCount = await queryBuilder.getCount();

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getArticlesFeed(userId: string, query: GetArticlesFeedQueryInterface): Promise<ArticlesResponseInterface> {
    const followedUsers = await this.followsRepository.find({ where: { followerId: userId } });

    if (!followedUsers.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = followedUsers.map((follow) => follow.followingId);
    const dataSource = await initializeDataSource;
    const queryBuilder = dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

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

  async addArticleToFavorite(userId: string, slug: string): Promise<ArticleEntity> {
    const currentArticle = await this.getArticleBySlug(slug);
    const user = await this.getCurrentUserById(userId, ['favorites']);
    const articleIsFavorites = user.favorites.find((article) => article.id === currentArticle.id);

    if (!articleIsFavorites) {
      user.favorites.push(currentArticle);
      currentArticle.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(currentArticle);
    }

    return currentArticle;
  }

  async deleteArticleFromFavorite(userId: string, slug: string): Promise<ArticleEntity> {
    const currentArticle = await this.getArticleBySlug(slug);
    const user = await this.getCurrentUserById(userId, ['favorites']);
    const articleFavoriteIndex = user.favorites.findIndex((article) => article.id === currentArticle.id);

    if (articleFavoriteIndex >= 0) {
      user.favorites.splice(articleFavoriteIndex, 1);
      currentArticle.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(currentArticle);
    }

    return currentArticle;
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

  async getCurrentUserById(userId: string, relations?: Array<'favorites'>): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { id: userId }, relations });
  }

  async getCurrentUserByName(userName: string, relations?: Array<'favorites'>): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { username: userName }, relations });
  }

  private generateArticleSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
