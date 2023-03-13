import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailingModule } from '../emailing/emailing.module';
import { EmailingService } from '../emailing/emailing.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}),
    EmailingModule,
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    GoogleStrategy,
    EmailingService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
