import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('follows')
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  followerId: string;

  @Column()
  followingId: string;
}
