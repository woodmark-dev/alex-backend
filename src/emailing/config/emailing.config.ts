/* eslint-disable prettier/prettier */
import { ApiClient, TransactionalEmailsApi } from 'sib-api-v3-sdk';

export async function sendEmail(
  receiverEmail: string,
  content: string,
  subject: string,
) {
  const client = ApiClient.instance;

  const apiKey = client.authentications['api-key'];

  apiKey.apiKey = process.env.EMAIL_API_KEY;

  const tranEmail = new TransactionalEmailsApi();
  const sender = {
    email: 'cipiofinance@gmail.com',
  };
  const mailOptions = {
    sender,
    to: [
      {
        email: receiverEmail,
      },
    ],
    subject: subject,
    htmlContent: content,
  };
  return await tranEmail.sendTransacEmail(mailOptions);
}
