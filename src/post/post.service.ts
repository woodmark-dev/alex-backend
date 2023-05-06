import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import * as cloudinary from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private db: PrismaService) {}
  async uploadImage({ req, userId }: { req: Request; userId: string }) {
    const { files, body } = req;
    const title = body['title'];
    const content = body['content'];

    if (files) {
      const imagePath = files['file']['tempFilePath'];
      const { secure_url } = await cloudinary.v2.uploader.upload(imagePath, {
        use_filename: true,
        folder: 'alex-project',
      });
      await this.createNewPost({
        title,
        content,
        imageUrl: secure_url,
        userId,
      });
      return;
    }
    await this.createNewPost({ title, content, imageUrl: '', userId });
  }

  async getAllUserPosts({ userId }: { userId: string }) {
    const posts = await this.db.post.findMany({
      where: {
        authorId: userId,
      },
    });
    if (!posts) {
      throw new HttpException(
        'No Posts found for this user',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: posts, statusCode: HttpStatus.OK };
  }

  async addComment({ content, authorId, postId }) {
    await this.db.comments.create({
      data: {
        content,
        authorId,
        postId,
      },
    });
    return { message: 'Success', statusCode: HttpStatus.CREATED };
  }

  async getComments() {
    const comments = await this.db.comments.findMany({
      include: {
        author: {
          select: {
            imageUrl: true,
            firstName: true,
            lastName: true,
            id: true,
          },
        },
      },
    });
    return { message: comments, statusbar: HttpStatus.OK };
  }

  async deleteComment(id: number) {
    await this.db.comments.delete({
      where: {
        id,
      },
    });

    return { message: 'Success', statusCode: HttpStatus.CREATED };
  }

  async deletePost(id: number) {
    await this.db.post.delete({
      where: { id },
    });

    return { message: 'Success', statusCode: HttpStatus.CREATED };
  }

  async getAllPosts() {
    const data = await this.db.post.findMany({});
    return { message: data, statusCode: HttpStatus.OK };
  }

  //helper functions:

  async createNewPost({
    title,
    content,
    imageUrl,
    userId,
  }: {
    title: string;
    content: string;
    imageUrl: string;
    userId: string;
  }) {
    await this.db.post.create({
      data: {
        title,
        content,
        imageUrl,
        authorId: userId,
      },
    });
  }
}
