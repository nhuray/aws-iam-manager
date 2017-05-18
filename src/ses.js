'use strict';

const bunyan = require('bunyan');

class SES {
  constructor (AWS) {
    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
    this.log = bunyan.createLogger({ name: 'ses' });
  }

  sendUserCredentialsEmail (username, password, accountName) {
    const recipent = `${username}@${process.env.EMAIL_DOMAIN}`;
    const subject = '[AWS-IAM-Manager] Your AWS account is ready.';
    const body = `Your IAM User has been created.\n\nAccount: ${accountName}\nCredentials: ${username} / ${password}`;

    this.log.info({
      Source: process.env.MAIL_SENDER,
      To: recipent,
    }, 'User created, sending email');

    return this.ses.sendEmail({
      Source: process.env.MAIL_SENDER,
      Destination: {
        ToAddresses: [
          process.env.MAIL_SENDER,
          recipent,
        ],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: body,
          },
        },
      },
    }).promise();
  }

  async sendProgrammaticAccessKeys (username, credentials, accountName) {
    // TODO: Implement
  }
}

module.exports = SES;
