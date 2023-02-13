import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { UserResponseInterface } from '@app/user/types/user-response.inteface';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';
import { CustomValidationPipe } from '@app/shared/pipes/custom-validation.pipe';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new CustomValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new CustomValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);

    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(
    @Body('user') updateUserDto: UpdateUserDto,
    @User('id') userId: string,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateUser(updateUserDto, userId);
    return this.userService.buildUserResponse(updatedUser);
  }
}
