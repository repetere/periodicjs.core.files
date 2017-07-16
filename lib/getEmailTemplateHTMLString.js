'use strict';

const fs = require('fs-extra');

/**
 * reads a filepath and returns the email template string (will use EJS to render later by default)
 * @param {object} options options object, requires an emailtemplatefilepath property
 * @param {string} options.emailtemplatefilepath file path to email template 
 * @returns {promise} resolves the contents of the passed filepath with the contents of the file as a utf8 string
 */
function getEmailTemplateHTMLString(options) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(options.emailtemplatefilepath, 'utf8', (err, file) => {
        if (err) {
          reject(err);
        } else {
          resolve(file);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = getEmailTemplateHTMLString;