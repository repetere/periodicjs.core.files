# periodicjs.core.files [![Coverage Status](https://coveralls.io/repos/github/typesettin/periodicjs.core.files/badge.svg?branch=master)](https://coveralls.io/github/typesettin/periodicjs.core.files?branch=master) [![Build Status](https://travis-ci.org/typesettin/periodicjs.core.files.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs.core.files)

Periodic's Code files module exports helper functions to handle multi-part form data. `periodic.core.files` uses `Busyboy` to parse form data from an HTTP reqest.

 [API Documentation](https://github.com/typesettin/periodicjs.core.files/blob/master/doc/api.md)

## Installation

```
$ npm install periodicjs.core.files
```

This is a part of Periodic's core.

## Usage

### Sending Emails
*JavaScript*
```javascript
const CoreFiles = require('periodicjs.core.files');//mounted inside of periodic on periodic.core.files
const periodic = require('periodicjs');
const fs = require('fs');
const encryption_key = fs.readFileSync('/path/to/encrytion/key').toString() ||'encryption_password';
const createFileMiddleware = periodic.core.files.uploadMiddlewareHandler({
  periodic,
});
const createEncryptedFileMiddleware = periodic.core.files.uploadMiddlewareHandler({
  periodic,
  encrypted_client_side: true, 
  encryption_key,
});
const removeFileMiddleware = periodic.core.files.removeMiddlewareHandler({   
  periodic, 
});
const decrypteFileMiddleware =  periodic.core.files.decryptAssetMiddlewareHandler({
  periodic,
  encryption_key,
}));

const testFileRouter = periodic.express.Router();

testFileRouter.post('/standard_assets',createFileMiddleware);
testFileRouter.post('/standard_assets/encrypted_files',createEncryptedFileMiddleware);
testFileRouter.get('/standard_assets/decrypt_asset/:id/:filename', decrypteFileMiddleware);
testFileRouter.delete('/standard_assets/:id',removeFileMiddleware);
testFileRouter.get('/standard_assets/upload_new_file',(req,res)=>{
  res.send(`<html>
  <head>
    <title>Upload a file</title>
  </head>
  <body>
    <form method="POST" action="/standard_assets" enctype="multipart/form-data">
      <h3>Upload normal files</h3>
      <input name="assetFile" type="file" multiple="">
    </form>
    <form method="POST" action="/standard_assets/encrypted_files" enctype="multipart/form-data">
      <h3>Upload encrypted files</h3>
      <input name="encryptedAssetFile" type="file" multiple="">
    </form>
  </body>
</html>`);
});
```



## API

```javascript
CoreFiles.generateAssetFromFile(options);// => new asset doc
CoreFiles.renameFile(options);//options.filename,options.req => new file string
CoreFiles.uploadDirectory(options);//options.req,options.periodic,options.upload_dir => {dir path info}
CoreFiles.formFileHandler(fieldname, file, filename, encoding, mimetype);// - busboy file handler
CoreFiles.formFieldHandler(fieldname, val);//fieldname, val - busboy form field handler
CoreFiles.sendFormResults(options);//options.req,options.res,options.next - send http reponse or redirects
CoreFiles.completeFormHandler(options);//options.req,options.res,options.next - callback for busboy form processing completion
CoreFiles.uploadMiddlewareHandlerDefaultOptions;
CoreFiles.uploadMiddleware(req, res, next);//busboy multipart form handler
CoreFiles.uploadMiddlewareHandler(options);//returns bound uploadMiddleware function with options
CoreFiles.removeMiddlewareHandlerDefaultOptions;
CoreFiles.removeMiddleware(req,res,next);//removes file from disk and db
CoreFiles.removeMiddlewareHandler(options);//returns bound removeMiddleware function with optoins
CoreFiles.decryptAssetMiddlewareHandlerDefaultOptions;
CoreFiles.decryptAssetMiddleware(req,res,next);//decrypts encrypted file and pipes file content to response
CoreFiles.decryptAssetMiddlewareHandler(options);//returns bound decryptAssetMiddleware function with options
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