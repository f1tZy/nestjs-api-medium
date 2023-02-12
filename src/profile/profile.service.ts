import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { UserResponseInterface } from '@app/user/types/user-response.inteface';
import { ProfileResponseInterface } from '@app/profile/types/profile-response.interface';
import { UserType } from '@app/user/types/user.type';
import { ProfileType } from '@app/profile/types/profile.type';

@Injectable()
export class ProfileService {
  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}

  async getProfileByName(username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    return { username: user.username, bio: user.bio, image: user.image, id: user.id, fallowing: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    return {
      profile,
    };
  }
}
