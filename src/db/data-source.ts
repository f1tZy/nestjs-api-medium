import { DataSource } from 'typeorm';
import { ormOptions } from '@app/db/orm-options';

export default new DataSource(ormOptions);
