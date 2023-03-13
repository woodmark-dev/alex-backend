import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { EmailingService } from '../emailing/emailing.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailingService: EmailingService,
  ) {}

  async signUp(userData: CreateUserDTO): Promise<string> {
    //hashing our password using the argon 2 library
    const password = await this.generateHash(userData.password);
    const verificationId = this.generateVerificationId();
    const createUser = this.prismaService.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password,
        verificationId,
      },
    });
    const sendEmail = this.emailingService.sendVerificationEmail(
      userData.email,
      verificationId,
      'Verify Email',
    );
    //It should all resolve to be successful
    await Promise.all([createUser, sendEmail]);
    return 'You have successfully signed up';
  }

  async login(userData: LoginUserDTO) {
    const user = await this.findUser(userData.email);
    const isPassword = await argon2.verify(user.password, userData.password);
    console.log(isPassword);
    if (!user || !isPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, name: user.name };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async googleLogin(userData: any) {
    const { email, firstName } = userData;

    //Search for the user in the database
    const user = await this.findUser(email);

    if (user && !user.isGoogleAccount) {
      throw new ForbiddenException(
        'User with this email address already exists',
      );
    }

    //If user does not exist, create one
    if (!user) {
      await this.prismaService.user.create({
        data: {
          email,
          //We'll add firstName from google as name
          name: firstName,
          isEmailVerified: true,
          isGoogleAccount: true,
        },
      });
    }
    //create a jwt token from the data
    const payload = { email, sub: user.id, name: firstName };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async verifyUserEmail(email: string, verificationId: string) {
    const user = await this.findUser(email);
    const isIdValid = user.verificationId === verificationId;
    if (!user || !isIdValid) {
      throw new UnauthorizedException('Access Denied');
    }
    await this.updateUser(email, '');
    return 'User email has been verified';
  }

  async verifyUser(email: string) {
    const user = await this.findUser(email);
    const verificationId = this.generateVerificationId();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.updateUser(email, verificationId);
    await this.emailingService.sendVerificationEmail(
      user.email,
      verificationId,
      'Change Password',
    );
    return 'Check your email to change your password';
  }

  async updatePassword(
    email: string,
    password: string,
    verificationId: string,
  ) {
    const hashedPassword = await this.generateHash(password);
    const user = await this.findUser(email);
    const isIdValid = user.verificationId === verificationId;
    if (!user || !isIdValid) {
      throw new UnauthorizedException('Access denied');
    }
    await this.updateUser(email, '', hashedPassword);
    return 'Password has been successfully updated';
  }

  //Healper functions below

  async findUser(email: string) {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUser(email: string, verificationId: string, password?: string) {
    return await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        verificationId,
        password,
      },
    });
  }
  generateVerificationId() {
    return randomBytes(40).toString('hex');
  }
  async generateHash(data: string) {
    return await argon2.hash(data);
  }
}
