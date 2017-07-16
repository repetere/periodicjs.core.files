'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const getTransport = require('../../lib/getTransport');
const mailer = require('../../lib/mailer');
const sendEmail = require('../../lib/sendEmail');
const directTransport = require('nodemailer-direct-transport');
const stubTransport = require('nodemailer-stub-transport');
const testTemplatePath = path.join(__dirname,'../mock/testemplate.ejs');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('mailer', function() {
  this.timeout(1000);
  describe('Class', () => {
    it('should have a default config', () => { 
      const newMailer = new mailer();
      expect(newMailer).to.be.an.instanceof(mailer);
      expect(newMailer.config.transportConfig.type).to.eql('stub');
    });
    it('should have static getEmailTemplateString method', (done) => {
      mailer.getEmailTemplateHTMLString({
        emailtemplatefilepath: testTemplatePath,
      })
        .then(template => {
          expect(template).to.be.a('string');
          done();
        })
        .catch(done);
    })
    it('should have static getTransport method', (done) => {
      mailer.getTransport()
        .then(nodemailerTransporter => {
          expect(nodemailerTransporter).to.be.a('object');
          done();
        })
        .catch(done);
    });
    it('should have static sendEmail method', (done) => {
      const sampleemail = {
        to: "user@example.com",
        from: "service@example.com",
        subject: "sample email test",
        generateTextFromHTML: true,
        html: "<h1>Welcome User</h1><p>email rocks</p>",
        transportConfig: {
          type: 'stub',
          transportoptions: {
            debug: true,
            args: ['-t', '-i']
          }
        },
      };
      mailer.sendEmail.call({},sampleemail)
        .then(email => {
          expect(email).to.be.a('object');
          expect(email).to.have.property('envelope');
          expect(email).to.have.property('response');
          expect(email).to.have.property('messageId');
          done();
        })
        .catch(done);
    });

  });
});