import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [JwtModule.register({}), PrismaModule, PassportModule],
  providers: [PostService, JwtStrategy, PrismaService],
  controllers: [PostController],
})
export class PostModule {}
