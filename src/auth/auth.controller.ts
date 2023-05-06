import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Signs up with username and password
  @Post('register')
  async signUp(@Body() user: CreateUserDTO) {
    return this.authService.signUp(user);
  }

  //Login with username and password
  @Post('login')
  async login(
    @Body() userData: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.login(userData, response);
  }

  @Get('get-user')
  @UseGuards(JwtAuthGuard)
  test(@User() user) {
    return { message: user, statusCode: HttpStatus.OK };
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('auth-cookie');
    return { message: 'Success', statusCode: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-users')
  async getUsers() {
    return await this.authService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-user')
  async deleteUser(@Body() data: { id: string }) {
    return await this.authService.deleteUser(data.id);
  }
}
