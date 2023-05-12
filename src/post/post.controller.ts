import { Request } from 'express';
import { Controller, Post, Req, Get, UseGuards, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadImage(@Req() req: Request, @User() user) {
    const { userId } = user;
    return await this.postService.uploadImage({ req, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-posts')
  async getAllUserPosts(@User() user) {
    const { userId } = user;
    return this.postService.getAllUserPosts({ userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post('post-comment')
  async addComment(
    @User() user,
    @Body() comData: { content: string; postId: string },
  ) {
    const { userId } = user;
    return this.postService.addComment({
      authorId: userId,
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
  async getAllPosts() {
    return await this.postService.getAllPosts();
  }
}
