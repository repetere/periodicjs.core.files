'use strict';

const fs = require('fs-extra');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const ses = require('nodemailer-ses-transport');
const sendmailTransport = require('nodemailer-sendmail-transport');
const directTransport = require('nodemailer-direct-transport');
const smtpPool = require('nodemailer-smtp-pool');
const stubTransport = require('nodemailer-stub-transport');
const sgTransport = require('nodemailer-sendgrid-transport');
const mgTransport = require('nodemailer-mailgun-transport');
const nodemailer = require('nodemailer');

/**
 *  map of labels of node mailer transports
 */
const transportMap = {
  ses,
  sendmail: sendmailTransport,
  'smtp-pool': smtpPool,
  sendgrid: sgTransport,
  mailgun: mgTransport,
  stub: stubTransport,
  direct: directTransport,
}

/**
 * returns a node mailer transport based off of a json configuration
 * 
 * @param {any} [options={}]
 * @param {object} options.transportObject the json configuration for a node mailer transport
 * @param {string} options.transportObject.transportType [ses|direct|sendmail|smtp-pool|sendgrid|mailgun|stub]
 * @param {object} options.transportObject.transportOptions options for a node mailer transport
 * @returns {promise} resolves a node mailer transport
 */
function getTransport(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const defaultTransport = {
        type: 'direct',
        transportOptions: { debug: true }
      };
      const { transportObject = defaultTransport, } = options;
      const nodemailerTransporter = nodemailer.createTransport(transportMap[transportObject.type](transportObject.transportoptions));
      if (transportObject.type === 'stub') {
        const originalSendmail = nodemailerTransporter.sendMail;
        nodemailerTransporter.sendMail = (data, callback) => {
          (function(maildata, mailcallback, fn) {
            return fn.call(nodemailerTransporter, maildata, function(err, email_status) {
              email_status.response = email_status.response.toString();
              mailcallback(err, email_status);
            });
          })(data, callback, originalSendmail);
        };
      }
      nodemailerTransporter.use('compile', htmlToText());
      resolve(nodemailerTransporter);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = getTransport;