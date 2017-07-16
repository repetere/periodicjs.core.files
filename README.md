# periodicjs.core.mailer [![Coverage Status](https://coveralls.io/repos/github/typesettin/periodicjs.core.mailer/badge.svg?branch=master)](https://coveralls.io/github/typesettin/periodicjs.core.mailer?branch=master) [![Build Status](https://travis-ci.org/typesettin/periodicjs.core.mailer.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs.core.mailer)

Periodic's Code mailer module exports a single function that asynchronously returns a node mailer transport to send transactional emails with.

 [API Documentation](https://github.com/typesettin/periodicjs.core.mailer/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.core.mailer
```

This is a part of Periodic's core.

## Usage

### Sending Emails
*JavaScript*
```javascript
var CoreMailer = require('periodicjs.core.mailer'),
  sampleemail ={
    to: "user@example.com",
    cc: "service@example.com",
    subject: "sample email test",
    generateTextFromHTML: true,
    html: "<h1>Welcome User</h1><p>email rocks</p>"
  },
  emailtransport;

  //instance methods
  const newCoreMailer = new CoreMailer({ 
    config: { 
      transportConfig: {
        type: 'stub',
        transportoptions: {
          debug: true,
          args: ['-t', '-i']
        },
      },
    },
  });
  newCoreMailer.sendEmail(sampleemail)
  .then(console.log)
  .catch(console.error);
  //static methods
  CoreMailer.sendEmail(sampleemail)
  .then(console.log)
  .catch(console.error);

//example transports
const sendmailTransportExample = {
  "type":"sendmail",
  "transportoptions":{
    "debug":true,
    "args":["-t","-i"]
  }
};
const SMTPTransportExample = {
  "type":"SMTP",
  "transportoptions":{
    "service": "SendGrid",
    "auth": {
      "user": "username",
      "pass": "password"
    }
  }
};
const SESTransportExample = {
  "type":"ses",
  "transportoptions":{
    "accessKeyId": "ACCESSKEYID",
    "secretAccessKey": "SECRETACCESSKEY"
  }
};
//all types:
const transports = {
  ses,
  sendmail: sendmailTransport,
  'smtp-pool': smtpPool,
  sendgrid: sgTransport,
  mailgun: mgTransport,
  stub: stubTransport,
  direct: directTransport,
}
```



## API

```javascript
//options.emailtemplatefilepath
CoreMailer.getEmailTemplateHTMLString(options); //Promise.resolve(templateString);
//options.transportObject.transportType, options.transportObject.transportOptions
CoreMailer.getTransport(options); //Promise.resolve(nodemailertransport); 
//options.to, options.from, options.html, options.subject, etc
CoreMailer.sendEmail(options); //Promise.resolve(emailstatus);
```
## Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

For tests
```
$ grunt test && grunt coveralls
```
For generating documentation
```
$ grunt doc
$ jsdoc2md lib/**/*.js > doc/api.md
```

## Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation