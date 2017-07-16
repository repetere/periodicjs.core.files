'use strict';
const Busboy = require('busboy');
const path = require('path');

function get_asset_object_from_file(options) {
  var newasset = {},
    file = options.file,
    req = options.req || { user: {} };
  newasset.attributes = {};
  newasset.size = file.size;
  newasset.filename = file.name;
  newasset.assettype = file.mimetype;
  // newasset.path = path;
  newasset.locationtype = file.locationtype || 'local';
  newasset.attributes.fieldname = file.fieldname;
  if (newasset.locationtype === 'local') {
    newasset.attributes.periodicDirectory = file.uploaddirectory;
    newasset.attributes.periodicPath = path.join(file.uploaddirectory, file.name);
  }
  newasset.fileurl = file.fileurl || newasset.attributes.periodicPath.replace('/public', '');
  newasset.attributes.periodicFilename = file.name;
  newasset.attributes.etag = file.etag || null;
  newasset.attributes.lastModified = file.lastModified || null;
  newasset.attributes.delimiter = file.delimiter || null;
  newasset.attributes.location = file.location || null;
  if (file.attributes) {
    newasset.attributes = Object.assign({}, file.attributes, newasset.attributes);
  }
  // console.log('newasset',newasset);
  // newasset = extend(file,newasset);
  newasset.name = this.core.utilities.makeNiceName(file.name);
  newasset.title = newasset.title || newasset.name;
  newasset.author = req.user._id;
  return newasset;
}

// function processFile(options) {
//   return new Promise((resolve, reject))
// }

function formFileHandler(fieldname, file, filename, encoding, mimetype) {
  const fieldHandler = formFieldHandler.bind(this);
  let filesize = 0;
  let response = (this.use_buffers) ? [] : '';
  // console.log('File [' + fieldname + ']: filename: ' + filename);
  file.on('data', (chunk) => {
    if (this.use_buffers) {
      response.push(chunk);
      filesize = filesize + Buffer.byteLength(chunk.length);
    } else {
      response += chunk;
      filesize = filesize + chunk.length;
    }
    console.log('Buffer.byteLength(chunk.length)', Buffer.byteLength(chunk.length));
    console.log('(chunk.length)', (chunk.length));
    // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
  });
  file.on('end', () => {
    this.files.push[(this.use_buffers) ? Buffer.concat(response).toString() : response];
  });
  if (this.save_to_disk) {
    // var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
    //   file.pipe(fs.createWriteStream(saveTo));
  }

  fieldHandler(fieldname, filename);
}

function formFieldHandler(fieldname, val, fieldnameTruncated, valTruncated) {
  console.log('busyboy on field', { fieldname, val, fieldnameTruncated, valTruncated, });
  this.body[fieldname] = val;
}

function completeFormHandler(options) {
  const { req, res, next, } = options;
  const files = this.files;
  const body = this.body;
  console.log('uploadMiddleware this', { files, body, });
  req.files = files;
  req.controllerData = Object.assign({}, req.controllerData, { files, });
  req.body = body;
}

function uploadMiddleware(req, res, next) {
  const busboy = new Busboy({ headers: req.headers, });
  const middlewareInstance = Object.assign({}, {
    body: {},
    files: [],
  }, this);
  const fileHandler = formFileHandler.bind(middlewareInstance);
  const fieldHandler = formFieldHandler.bind(middlewareInstance);
  const completeHandler = completeFormHandler.bind(middlewareInstance, { req, res, next, });
  busboy.on('file', fileHandler);
  busboy.on('field', fieldHandler);
  busboy.on('finish', completeHandler);
  req.pipe(busboy);
}

function uploadMiddlewareHandler(options = {
  save_to_disk: true,
  save_to_req_files: true,
  save_file_to_asset: true,
  use_buffers: true,
  asset_core_data: 'standard_asset',
  periodic: {},
  send_response: true,
}) {
  return uploadMiddleware.bind(options);
}

module.exports = {
  uploadMiddleware,
  uploadMiddlewareHandler,
};