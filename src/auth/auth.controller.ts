import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
    return this.authService.getUser(user.email);
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

  @UseGuards(JwtAuthGuard)
  @Post('edit-f-name')
  async editFName(@User() user, @Body() data: { newFName: string }) {
    return await this.authService.editFName(user.email, data.newFName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('edit-l-name')
  async editLName(@User() user, @Body() data: { newLName: string }) {
    return await this.authService.editLName(user.email, data.newLName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('edit-dept')
  async editDept(@User() user, @Body() data: { newDept: string }) {
    return await this.authService.editDept(user.email, data.newDept);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  async uploadImage(@Req() req: Request, @User() user) {
    const { userId } = user;
    return await this.authService.uploadImage({ req, userId });
    // return await this.postService.uploadImage({ req, userId });
  }
}
