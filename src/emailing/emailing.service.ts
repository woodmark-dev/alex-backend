import { Injectable } from '@nestjs/common';
import { sendEmail } from './config/emailing.config';

@Injectable()
export class EmailingService {
  async sendVerificationEmail(
    receiverEmail: string,
    verificationID: string,
    subject: string,
  ) {
    //change content to match need
    const content = `<p>Click the link to verify your email:</p> <a href="https://web-production-4e4a.up.railway.app/api/v1/verify-user-email?email=${receiverEmail}&verificationID=${verificationID}">${subject}</a>`;
    return await sendEmail(receiverEmail, content, subject);
  }

  //create a function around the content to specify the usecase
}
