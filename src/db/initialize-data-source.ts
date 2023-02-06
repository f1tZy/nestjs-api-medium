import { DataSource } from 'typeorm';
import { ormOptions } from '@app/db/orm-options';

export const initializeDataSource = new DataSource(ormOptions).initialize();
