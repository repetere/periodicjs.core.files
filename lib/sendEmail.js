'use strict';
const getEmailTemplateHTMLString = require('./getEmailTemplateHTMLString');
const getTransport = require('./getTransport');
const ejs = require('ejs');

/**
 * sends email with nodemailer
 * 
 * @static
 * @param {any} [options={}] all of the options to a node mailer transport sendMail function
 * @param {object|string} options.to 
 * @param {object|string} options.cc
 * @param {object|string} options.bcc 
 * @param {object|string} options.replyto 
 * @param {object|string} options.subject 
 * @param {object|string} options.html 
 * @param {object|string} options.text 
 * @param {object|string} options.generateTextFromHTML 
 * @param {object|string} options.emailtemplatestring 
 * @param {object|string} options.emailtemplatedata 
 * @returns {promise} resolves the status of an email
 * 
 * @memberof Mailer
 */
function sendEmail(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const mailoptions = options;
      let mailTransportConfig = (this && this.config && this.config.transportConfig)
        ? this.config.transportConfig
        : options.transportConfig;
      let mailtransport = (this && this.transport)
        ? this.transport
        : options.transport;
      Promise.resolve(mailoptions)
        .then(mailoptions => {
          if (mailoptions.html || mailoptions.emailtemplatestring) {
            return mailoptions.html || mailoptions.emailtemplatestring;
          } else {
            return getEmailTemplateHTMLString(mailoptions);
          }
        })
        .then(emailTemplateString => {
          mailoptions.emailtemplatestring = emailTemplateString;
          if (mailoptions.html) {
            return mailoptions.html;
          } else {
            if (mailoptions.emailtemplatefilepath && !mailoptions.emailtemplatedata.filename) {
              mailoptions.emailtemplatedata.filename = mailoptions.emailtemplatefilepath;
            }
            mailoptions.html = ejs.render(mailoptions.emailtemplatestring, mailoptions.emailtemplatedata);
            return mailoptions.html;
          }
        })
        .then(mailhtml => {
          if (mailtransport && mailtransport.sendMail) {
            return mailtransport;
          } else {
            return getTransport({ transportObject: mailTransportConfig })
              .then(transport => {
                mailtransport = transport;
                return Promise.resolve(transport);
              })
              .catch(reject);
          }
        })
        .then(mt => {
          mt.sendMail(mailoptions, (err, status) => {
            if (err) {
              reject(err);
            } else {
              resolve(status);
            }
          });
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = sendEmail;