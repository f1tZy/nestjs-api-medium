import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profile-response.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfileByName(@Param('username') username: string): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfileByName(username);
    return this.profileService.buildProfileResponse(profile);
  }
}
