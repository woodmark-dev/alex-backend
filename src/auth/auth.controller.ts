import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Signs up with username and password
  @Post('signup')
  async signUp(@Body() user: CreateUserDTO) {
    return this.authService.signUp(user);
  }

  //Login with username and password
  @Post('login')
  async login(@Body() userData: LoginUserDTO) {
    return this.authService.login(userData);
  }

  @Get('verify-email')
  async verifyUserEmail(
    @Body() data: { email: string; verificationId: string },
  ) {
    return await this.authService.verifyUserEmail(
      data.email,
      data.verificationId,
    );
  }

  @Get('forgot-password')
  async verifyUser(@Query() email: string) {
    return await this.authService.verifyUser(email);
  }

  @Post('change-password')
  async changePassword(
    @Body() data: { email: string; password: string; verificationId: string },
  ) {
    return await this.authService.updatePassword(
      data.email,
      data.password,
      data.verificationId,
    );
  }

  //This is the link to authenticate a google account. If the email exists in our database, it issues a jwt. Otherwise, it creates one and issue a jwt
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@User() user) {
    return this.authService.googleLogin(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  test(@User() user) {
    //returns user information whether authentication is made with google or username and password
    return user;
  }
}
