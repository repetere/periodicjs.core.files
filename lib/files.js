'use strict';
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const Busboy = require('busboy');

/**
 * generate the asset document for the database based off of the processed file data
 * 
 * @param {any} options 
 * @returns 
 */
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

/**
 * format filename based on options, otherwise rename the file with a username stamp and timestamp
 * 
 * @param {string} options.filename original filename 
 * @param {object} options.req express request object [NOTE: this does not have form field processed on it]
 * @returns 
 */
function renameFile(options) {
  const { filename, req, } = options;
  const reqBody = Object.assign({}, this, req.query, req.body, req.controllerData);
  // console.log('renameFile req.body', req.body);
  if (reqBody['existing-file-name']) {
    return filename;
  } else {
    const userstampstring = (!reqBody['exclude-userstamp'] && req.user) ?
      req.user._id + '-' :
      '';
    const timestampstringformat = reqBody['ts-format'] || 'YYYY-MM-DD_HH-m-ss';
    const timestampstring = (!reqBody['exclude-timestamp']) ?
      moment().format(timestampstringformat) + '-' :
      '';
    return userstampstring + timestampstring + filename;
  }
}

/**
 * returns an object used to assign directory paths
 * 
 * @param {object} options.req express request object
 * @param {object} options.periodic periodic instance
 * @param {string} options.upload_dir upload directory path
 * @returns {object} returns {current_date,upload_dir,upload_path_dir,periodicDir}, current_date is the datestamp in format YYYY/MM/DD. upload_path_dir is the exact upload directory, upload_dir is the basename, periodicDir is the basename with the datestamp
 */
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

/**
 * handles file data from a multi-part form
 * 
 * @param {any} fieldname 
 * @param {any} file 
 * @param {any} filename 
 * @param {any} encoding 
 * @param {any} mimetype 
 */
function formFileHandler(fieldname, file, filename, encoding, mimetype) {
  const fieldHandler = formFieldHandler.bind(this);
  const upload_dir = this.periodic.settings.express.config.upload_directory;
  const name = renameFile.call(this, {
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
    original_filename: filename,
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
    this.files.push(processedFile);
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

/**
 * assigns form field from multi-part form to req.body
 * 
 * @param {string} fieldname req.body form name value
 * @param {any} val req.body[fieldname] value
 */
function formFieldHandler(fieldname, val /*, fieldnameTruncated, valTruncated*/ ) {
  this.body[fieldname] = val;
}

/**
 * send the result of file processing and responds appropriately
 * this.redirect_path, req.redirect_path and finally req.headers.referer are used to redirect after files have been processed
 * 
 * @param {object} options.req express request object
 * @param {object} options.res express response object
 * @param {function} options.next express next handler
 */
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
  const periodic = this.periodic;
  const formResultResponse = sendFormResults.bind(this);
  let newassets = [];
  // this.periodic = true;
  // this.periodic.logger.silly('files', files);
  // console.log('uploadMiddleware this', { files, body, }, 'req.headers', req.headers);
  req.body = body;
  req.files = files;
  newassets = files.map(file => generateAssetFromFile({
    req,
    periodic,
    file,
  }));
  req.controllerData = Object.assign({}, req.controllerData, { files, });
  if (this.save_file_to_asset) {
    const assetDBName = this.asset_core_data || this.periodic.settings.express.config.asset_core_data;
    const assetDB = this.periodic.datas.get(assetDBName);
    assetDB.create({
        bulk_create: true,
        newdoc: newassets,
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

/**
 * middleware function for handling multi-part form data
 * 
 * @param {object} req express request object
 * @param {object} res express response object
 * @param {function} next express next handler
 */
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

/**
 * return a middleware fuction for handling file uploads with busboy
 * 
 * @param {boolean} options.save_to_disk should the files be saved to disk 
 * @param {boolean} options.save_to_req_files append file data to req object on req.files 
 * @param {boolean} options.save_file_to_asset create an asset document in the database after the files have been processes
 * @param {boolean} options.use_buffers use buffers to process files
 * @param {string} options.asset_core_data core data collection name
 * @param {object} options.periodic periodic instance to use to save data
 * @param {boolean} options.send_response file middleware should call next or send http response
 * @returns 
 */
function uploadMiddlewareHandler(options = {}) {
  return uploadMiddleware.bind(Object.assign({
    'existing-file-name':false,
    'exclude-userstamp':false,
    'exclude-timestamp':false,
    'ts-format':false,
    save_to_disk: true,
    save_to_req_files: true,
    save_file_to_asset: true,
    use_buffers: true,
    // asset_core_data: 'standard_asset',
    periodic: {},
    send_response: true,
  }, options));
}

function removeMiddleware(req, res, next) {
  const periodic = this.periodic;
  const assetDBName = this.asset_core_data || this.periodic.settings.express.config.asset_core_data;
  const asset = req.controllerData[ assetDBName ];
  const assetDB = this.periodic.datas.get(assetDBName);
  const removeFilePromise = new Promise((resolve,reject) => { 
    try {
      if (asset.locationtype === 'local') {
        resolve(fs.remove(path.join(periodic.config.app_root, asset.attributes.periodicPath)));
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });

  Promise.all([
    removeFilePromise,
    assetDB.delete({
      id: asset._id,
    })
  ])
    .then(result => { 
      if (this.send_response) {
        if (periodic.utilities.middleware.jsonReq(req)) {
          res.send(periodic.utilities.routing.formatResponse({
            data: result,
          }));
        } else {
          res.redirect(this.redirect_path || req.redirect_path || req.headers.referer);
        }
      } else {
        next();
      }
    })
    .catch(next);
}

function removeMiddlewareHandler(options) {
  return removeMiddleware.bind(Object.assign({
    periodic: {},
    send_response:true,
  },options));
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
  removeMiddleware,
  removeMiddlewareHandler,
};