import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { UserResponseInterface } from '@app/user/types/user-response.inteface';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { compare } from 'bcrypt';
import { JWT_SECRET } from '@app/config';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    const userByUsername = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException('User already exist', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: ['id', 'bio', 'password', 'username', 'image', 'email'],
    });

    if (!user) {
      throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return user;
  }

  generateJwtToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  findUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: string): Promise<UserEntity> {
    const currentUser = await this.userRepository.findOneBy({ id: userId });
    const updatedUser = Object.assign(currentUser, updateUserDto);

    return this.userRepository.save(updatedUser);
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        username: user.username,
        email: user.email,
        bio: user.bio,
        id: user.id,
        image: user.image,
        token: this.generateJwtToken(user),
        articles: user.articles,
        favorites: user.favorites,
      },
    };
  }
}
