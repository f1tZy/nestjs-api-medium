import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from '@app/profile/types/profile-response.interface';
import { ProfileType } from '@app/profile/types/profile.type';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getUserByName(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async getProfileByName(username: string): Promise<ProfileType> {
    const user = await this.getUserByName(username);

    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: false };
  }

  async followToProfile(currentUserId: string, username: string): Promise<ProfileType> {
    const user = await this.getUserByName(username);

    if (user.id === currentUserId) {
      throw new HttpException('Follower and following cant be equal', HttpStatus.BAD_REQUEST);
    }

    const follow = await this.followRepository.findOne({ where: { followerId: currentUserId, followingId: user.id } });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: true };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    return {
      profile,
    };
  }
}
