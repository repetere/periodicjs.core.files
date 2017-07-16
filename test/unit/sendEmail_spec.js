'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const getTransport = require('../../lib/getTransport');
const sendEmail = require('../../lib/sendEmail');
const directTransport = require('nodemailer-direct-transport');
const stubTransport = require('nodemailer-stub-transport');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('sendEmail', function() {
  this.timeout(1000);
  describe('sendEmail Promise', () => {
    it('should send stub emails', (done) => {
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
      sendEmail.call({},sampleemail)
        .then(email => {
          expect(email).to.be.a('object');
          expect(email).to.have.property('envelope');
          expect(email).to.have.property('response');
          expect(email).to.have.property('messageId');
          done();
        })
        .catch(done);
    });
    it('should reject an errors', (done) => {
      sendEmail({transportObject:{type:'invalid'}})
        .then(template => {
          done(new Error('should not product a transport'))
        })
        .catch(error => {
          expect(error).to.be.an('error');
          done();
        });
    });
    it('should return a promise', () => {
      expect(sendEmail()).to.be.a('promise');
    });
  });
});