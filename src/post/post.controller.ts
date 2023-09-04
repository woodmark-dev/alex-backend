/* eslint-disable prettier/prettier */
import { Request } from 'express';
import {
  Controller,
  Post,
  Req,
  Get,
  UseGuards,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) { }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadImage(@Req() req: Request, @User() user) {
    return await this.postService.uploadImage({ req, userId: user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-posts')
  async getAllUserPosts(@User() user) {
    return this.postService.getAllUserPosts({ userId: user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Post('post-comment')
  async addComment(
    @User() user,
    @Body() comData: { content: string; postId: string },
  ) {
    return this.postService.addComment({
      authorId: user.id,
      content: comData.content,
      postId: comData.postId,
    });
  }

  @Get('get-comments')
  async getComments() {
    return await this.postService.getComments();
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-comment')
  async deleteComment(@Body() data: { id: number }) {
    return await this.postService.deleteComment(data.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-post')
  async deletePost(@Body() data: { id: number }) {
    return await this.postService.deletePost(data.id);
  }

  @Get('all-posts')
  async getAllPosts(@Query('id') id) {
    return await this.postService.getAllPosts(+id);
  }
}
