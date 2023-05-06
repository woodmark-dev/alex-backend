import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(userData: CreateUserDTO) {
    const user = await this.findUser(userData.email);
    if (user) {
      throw new HttpException(
        'User with email aready exists',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const password = await this.generateHash(userData.password);
    await this.prismaService.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        department: userData.department,
        password,
      },
    });
    return {
      message: 'Registration successful! procedd to ',
      statusCode: HttpStatus.CREATED,
    };
  }

  async login(userData: LoginUserDTO, res: Response) {
    const user = await this.findUser(userData.email);
    if (!user) {
      throw new HttpException(
        'User with these details does not exist',
        HttpStatus.FORBIDDEN,
      );
    }
    const isPassword = await argon2.verify(user?.password, userData.password);
    if (!user || !isPassword) {
      throw new HttpException(
        'User with these details does not exist',
        HttpStatus.FORBIDDEN,
      );
    }
    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      imageUrl: user.imageUrl,
    };

    const token = {
      role: user.role,
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
      }),
    };

    res.cookie('auth-cookie', token, {
      httpOnly: true,
      maxAge: 28800000,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: { role: token.role }, statusCode: HttpStatus.CREATED };
  }

  async getUsers() {
    const users = await this.prismaService.user.findMany({});
    return { message: users, statusCode: HttpStatus.OK };
  }

  async deleteUser(id: string) {
    const comments = await this.prismaService.comments.findMany({
      where: { authorId: id },
    });

    if (comments.length !== 0) {
      await this.prismaService.comments.deleteMany({ where: { authorId: id } });
    }

    const posts = await this.prismaService.comments.findMany({
      where: { authorId: id },
    });

    if (posts.length !== 0) {
      await this.prismaService.post.deleteMany({ where: { authorId: id } });
    }

    await this.prismaService.user.delete({
      where: {
        id,
      },
    });

    return { message: 'User deleted', statusCode: HttpStatus.CREATED };
  }

  //Healper functions below

  async findUser(email: string) {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async generateHash(data: string) {
    return await argon2.hash(data);
  }
}
