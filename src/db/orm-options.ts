import { DataSourceOptions } from 'typeorm';

export const ormOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  database: 'mediumclone',
  port: 5432,
  username: 'mediumclone',
  password: '123',
  entities: ['dist/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['dist/db/migrations/**/*{.ts,.js}', 'src/db/migrations/**/*{.ts,.js}'],
};
