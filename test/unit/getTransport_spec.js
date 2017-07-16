'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const getTransport = require('../../lib/getTransport');
const directTransport = require('nodemailer-direct-transport');
const stubTransport = require('nodemailer-stub-transport');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('getTransport', function() {
  this.timeout(10000);
  describe('getTransport Promise', () => {
    it('should produce a default direct transport', (done) => {
      getTransport()
        .then(nodemailerTransporter => {
          expect(nodemailerTransporter).to.be.a('object');
          done();
        })
        .catch(done);
    });
    it('should produce multiple transports', (done) => {
      getTransport({
        transportObject: {
          type: 'stub',
          transportoptions: {
            debug: true,
            args: ['-t', '-i']
          }
        },
      })
        .then(nodemailerTransporter => {
          expect(nodemailerTransporter).to.be.a('object');
          done();
        })
        .catch(done);
    });
    it('should reject an errors', (done) => {
      getTransport({transportObject:{type:'invalid'}})
        .then(template => {
          done(new Error('should not product a transport'))
        })
        .catch(error => {
          expect(error).to.be.an('error');
          done();
        });
    });
    it('should return a promise', () => {
      expect(getTransport()).to.be.a('promise');
    });
  });
});