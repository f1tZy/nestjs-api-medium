import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDB1674408991317 implements MigrationInterface {
  name = 'SeedDB1674408991317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('reactjs'), ('nestjs')`);

    //pwd 123
    await queryRunner.query(
      `INSERT INTO users (id, username, email, password) VALUES ('8ffd682d-c868-476f-a424-13341d03c257', 'test', 'test@mail.ru', '$2b$10$yq4WCGcmrMFR/LErf34S6.EtiUau90hUZ8PtACnMUpzyrz9BfZRBS')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article description', 'first article body', 'reactjs,nestjs', '8ffd682d-c868-476f-a424-13341d03c257')`,
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
