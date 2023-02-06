import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persist-article.dto';
import { ArticleResponseInterface } from '@app/article/types/article-response.interface';
import { GetArticlesQueryInterface } from '@app/article/types/get-articles-query.interface';
import { ArticlesResponseInterface } from '@app/article/types/articles-response.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAllArticles(
    @User('id') userId: string,
    @Query() query: GetArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getAllArticles(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(user, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticleBySlug(@User('id') userId: string, @Param('slug') slug: string) {
    return this.articleService.deleteArticleBySlug(userId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticleBySlug(
    @User('id') userId: string,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.updateArticleBySlug(userId, slug, updateArticleDto);
    return this.articleService.buildArticleResponse(updatedArticle);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorite(
    @User('id') userId: string,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorite(userId, slug);
    return this.articleService.buildArticleResponse(article);
  }
}
