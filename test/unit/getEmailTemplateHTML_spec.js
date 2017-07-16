'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const getEmailTemplateHTMLString = require('../../lib/getEmailTemplateHTMLString');
const testTemplatePath = path.join(__dirname,'../mock/testemplate.ejs');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('getEmailTemplateHTMLString', function() {
  this.timeout(10000);
  describe('getEmailTemplateHTMLString Promise', () => {
    it('should resolve a template string', (done) => {
      getEmailTemplateHTMLString({
        emailtemplatefilepath: testTemplatePath,
      })
        .then(template => {
          expect(template).to.be.a('string');
          done();
        })
        .catch(done);
    });
    it('should reject an errors', (done) => {
      getEmailTemplateHTMLString()
        .then(template => {
          done(new Error('should not product a template'))
        })
        .catch(error => {
          expect(error).to.be.an('error');
          done();
        });
      // expect(getEmailTemplateHTMLString('throw')).to.eventually.be.rejected;
    });
    it('should return a promise', () => {
      expect(getEmailTemplateHTMLString()).to.be.a('promise');
    });
  });
});