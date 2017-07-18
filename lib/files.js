'use strict';
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const Busboy = require('busboy');

function generateAssetFromFile(options) {
  const newasset = {};
  const { periodic, file, req = { user: {}, }, } = options;

  newasset.attributes = {};
  newasset.size = file.size;
  newasset.status = req.body.file_status || 'VALID';
  newasset.filename = file.name;
  newasset.assettype = file.mimetype;
  // newasset.path = path;
  newasset.locationtype = file.locationtype || 'local';
  newasset.attributes.fieldname = file.fieldname;
  if (newasset.locationtype === 'local') {
    newasset.attributes.periodicDirectory = file.uploaddirectory;
    newasset.attributes.periodicPath = path.join(file.uploaddirectory, file.name);
  }
  newasset.fileurl = file.fileurl || newasset.attributes.periodicPath.replace('public/', '');
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
  newasset.name = periodic.core.utilities.makeNiceName(file.name);
  newasset.title = newasset.title || newasset.name;
  newasset.author = req.user._id;
  return newasset;
}

function renameFile(options) {
  const { filename, req, } = options;
  // console.log('renameFile req.body', req.body);
  if (req.body['existing-file-name']) {
    return filename;
  } else {
    const userstampstring = (!req.body['exclude-userstamp'] && req.user) ?
      req.user._id + '-' :
      '';
    const timestampstringformat = req.body['ts-format'] || 'YYYY-MM-DD_HH-m-ss';
    const timestampstring = (!req.body['exclude-timestamp']) ?
      moment().format(timestampstringformat) + '-' :
      '';
    return userstampstring + timestampstring + filename;
  }
}

function uploadDirectory(options) {
  const { req, periodic, upload_dir, } = options;
  // console.log({ upload_dir });
  const current_date = moment().format('YYYY/MM/DD');
  const upload_path_dir = (req.localuploadpath) ?
    req.localuploadpath :
    path.join(periodic.config.app_root, upload_dir, current_date);
  fs.ensureDirSync(upload_path_dir);
  return {
    current_date,
    upload_dir,
    upload_path_dir,
    periodicDir: path.join(upload_dir, current_date),
  };
}

function formFileHandler(fieldname, file, filename, encoding, mimetype) {
  const fieldHandler = formFieldHandler.bind(this);
  const upload_dir = this.periodic.settings.express.config.upload_directory;
  const name = renameFile({
    filename,
    req: this.req,
  });
  const uploadDir = uploadDirectory({
    req: this.req,
    periodic: this.periodic,
    upload_dir,
  });
  const fileurl = path.join(uploadDir.periodicDir, name).replace('public/uploads', '/uploads');
  const processedFile = {
    fieldname,
    encoding,
    mimetype,
    filename: name,
    name,
    fileurl,
    uploaddirectory: uploadDir.periodicDir,
  };
  // let response = (this.use_buffers) ? [] : '';
  let filesize = 0;
  file.on('data', (chunk) => {
    if (this.use_buffers) {
      // response.push(chunk);
      filesize = filesize + Buffer.byteLength(chunk);
    } else {
      // response += chunk;
      filesize = filesize + chunk.length;
    }
    processedFile.size = filesize;
  });
  file.on('end', () => {
    // console.log('file end this.req.body', this.req.body)
    this.files.push(generateAssetFromFile({
      req: this.req,
      periodic: this.periodic,
      file: processedFile,
    }));
  });
  file.on('error', (e) => {
    throw Error(e);
  });
  if (this.save_to_disk) {
    const saveTo = path.join(uploadDir.upload_path_dir, name);
    file.pipe(fs.createWriteStream(saveTo));
  }

  fieldHandler(fieldname, filename);
}

function formFieldHandler(fieldname, val /*, fieldnameTruncated, valTruncated*/ ) {
  this.body[fieldname] = val;
}

function sendFormResults(options) {
  const { req, res, next, } = options;
  if (this.send_response) {
    if (this.periodic.utilities.middleware.jsonReq(req)) {
      res.send(this.periodic.utilities.routing.formatResponse({
        data: req.controllerData,
      }));
    } else {
      res.redirect(this.redirect_path || req.redirect_path || req.headers.referer);
    }
  } else {
    next();
  }
}

function completeFormHandler(options) {
  const { req, res, next, } = options;
  const files = this.files;
  const body = this.body;
  const formResultResponse = sendFormResults.bind(this);
  // this.periodic = true;
  // this.periodic.logger.silly('files', files);
  // console.log('uploadMiddleware this', { files, body, }, 'req.headers', req.headers);
  req.files = files;
  req.controllerData = Object.assign({}, req.controllerData, { files, });
  req.body = body;
  if (this.save_file_to_asset) {
    const assetDBName = this.asset_core_data || this.periodic.settings.express.config.asset_core_data;
    const assetDB = this.periodic.datas.get(assetDBName);
    assetDB.create({
        bulk_create: true,
        newdoc: files,
      })
      .then(newassets => {
        req.controllerData[assetDBName] = newassets;
        formResultResponse({ req, res, next, });
      })
      .catch(next);
  } else {
    formResultResponse({ req, res, next, });
  }
}

function uploadMiddleware(req, res, next) {
  const busboy = new Busboy({ headers: req.headers, });
  const middlewareInstance = Object.assign({}, {
    body: {},
    files: [],
    req,
    res,
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
    // asset_core_data: 'standard_asset',
    periodic: {},
    send_response: true,
  }, options));
}

module.exports = {
  generateAssetFromFile,
  renameFile,
  uploadDirectory,
  formFileHandler,
  formFieldHandler,
  sendFormResults,
  completeFormHandler,
  uploadMiddleware,
  uploadMiddlewareHandler,
};