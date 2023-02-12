import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from '@app/profile/types/profile-response.interface';
import { ProfileType } from '@app/profile/types/profile.type';
import { FollowEntity } from '@app/profile/follow.entity';
import { ArticleEntity } from '@app/article/article.entity';
import { initializeDataSource } from '@app/db/initialize-data-source';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getUserByName(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async getFollow(followerId: string, followingId: string): Promise<FollowEntity | undefined> {
    if (followerId === followingId) {
      throw new HttpException('Follower and following cant be equal', HttpStatus.BAD_REQUEST);
    }

    const dataSource = await initializeDataSource;
    const queryBuilder = dataSource.getRepository(FollowEntity).createQueryBuilder('follows');

    return queryBuilder
      .where('follows.followerId = :followerId AND follows.followingId = :followingId', { followerId, followingId })
      .getOne();
  }

  async getProfileByName(currentUserId: string | null, username: string): Promise<ProfileType> {
    const user = await this.getUserByName(username);
    const follow = await this.getFollow(currentUserId, user.id);

    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: !!follow };
  }

  async followToProfile(currentUserId: string, username: string): Promise<ProfileType> {
    const user = await this.getUserByName(username);
    const follow = await this.getFollow(currentUserId, user.id);

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: true };
  }

  async unfollowToProfile(currentUserId: string, username: string): Promise<ProfileType> {
    const user = await this.getUserByName(username);
    const follow = await this.getFollow(currentUserId, user.id);

    if (!follow) {
      throw new HttpException('You not following to user', HttpStatus.BAD_REQUEST);
    }

    await this.followRepository.delete(follow);
    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    return {
      profile,
    };
  }
}
