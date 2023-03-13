import { Module } from '@nestjs/common';
import { EmailingService } from './emailing.service';

@Module({
  providers: [EmailingService],
})
export class EmailingModule {}
