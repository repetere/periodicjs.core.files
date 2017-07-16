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

var multiupload_rename = function(fieldname, filename, req, res) {
  // console.log('multiupload_rename req.body', req.body);
  // console.log('multiupload_rename req', req);
  // console.log('fieldname,filename,',fieldname,filename);
  var userstampstring = (!req.body['exclude-userstamp'] && req.user) ? req.user._id + '-' : '',
    timestampstringformat = req.body['ts-format'] || 'YYYY-MM-DD_HH-m-ss',
    timestampstring = (!req.body['exclude-timestamp']) ? '-' + moment().format(timestampstringformat) : '';
  if (req.body['existing-file-name']) {
    return filename;
  } else {
    return userstampstring + filename + timestampstring;
  }
};

var multiupload_changeDest = function(dest, req, res) {
  var current_date = moment().format('YYYY/MM/DD');
  var upload_path_dir = (req.localuploadpath) ? req.localuploadpath : path.join(process.cwd(), upload_dir, current_date);
  // return upload_path_dir; 

  // logger.debug('upload_path_dir',upload_path_dir);
  fs.ensureDirSync(upload_path_dir);
  return upload_path_dir;
};


// function processFile(options) {
//   return new Promise((resolve, reject))
// }

function formFileHandler(fieldname, file, filename, encoding, mimetype) {
  const fieldHandler = formFieldHandler.bind(this);
  let filesize = 0;
  let response = (this.use_buffers) ? [] : '';
  console.log({ encoding, mimetype });
  // console.log('File [' + fieldname + ']: filename: ' + filename);
  file.on('data', (chunk) => {
    if (this.use_buffers) {
      response.push(chunk);
      filesize = filesize + Buffer.byteLength(chunk.length);
    } else {
      response += chunk;
      filesize = filesize + chunk.length;
    }
  });
  file.on('end', () => {
    this.files.push((this.use_buffers) ? Buffer.concat(response).toString() : response);
  });
  file.on('error', (e) => {
    console.log(e);
  });
  if (this.save_to_disk) {
    // var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
    //   file.pipe(fs.createWriteStream(saveTo));
  }

  fieldHandler(fieldname, filename);
}

function formFieldHandler(fieldname, val /*, fieldnameTruncated, valTruncated*/ ) {
  this.body[fieldname] = val;
}

function completeFormHandler(options) {
  const { req, res, next, } = options;
  const files = this.files;
  const body = this.body;
  this.periodic = true;
  console.log('uploadMiddleware this', { files, body, }, 'req.headers', req.headers, 'this', this);
  req.files = files;
  req.controllerData = Object.assign({}, req.controllerData, { files, });
  req.body = body;
  next();
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

function uploadMiddlewareHandler(options = {}) {
  return uploadMiddleware.bind(Object.assign({
    save_to_disk: true,
    save_to_req_files: true,
    save_file_to_asset: true,
    use_buffers: true,
    asset_core_data: 'standard_asset',
    periodic: {},
    send_response: true,
  }, options));
}

module.exports = {
  uploadMiddleware,
  uploadMiddlewareHandler,
};