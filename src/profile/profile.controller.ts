import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profile-response.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfileByName(
    @User('id') currentUserId: string | null,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfileByName(currentUserId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followToProfile(
    @User('id') currentUserId: string,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followToProfile(currentUserId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowToProfile(
    @User('id') currentUserId: string,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unfollowToProfile(currentUserId, username);
    return this.profileService.buildProfileResponse(profile);
  }
}
