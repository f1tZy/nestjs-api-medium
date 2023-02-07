import { DataSource } from 'typeorm';
import { ormSeedOptions } from '@app/db/orm-options';

export default new DataSource(ormSeedOptions);
