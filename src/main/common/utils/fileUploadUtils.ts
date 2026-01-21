import {Request, Response, NextFunction} from 'express';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';

const multer = require('multer');

export const createMulterUpload = (fileSizeLimit: number = FILE_SIZE_LIMIT) => {
  const storage = multer.memoryStorage({
    limits: {
      fileSize: fileSizeLimit,
    },
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: fileSizeLimit,
    },
  });
};

export const createMulterErrorMiddleware = (loggerName = 'uploadDocumentsController') => {
  return (req: Request, res: Response, next: NextFunction) => {
    /* istanbul ignore next */
    const {Logger} = require('@hmcts/nodejs-logging');
    const logger = Logger.getLogger(loggerName);
    logger.info(`[MULTER MIDDLEWARE] Processing request: claimId=${req.params?.id}, contentType=${req.headers['content-type']}`);
    
    const upload = createMulterUpload(FILE_SIZE_LIMIT);
    upload.any()(req, res, (err: any) => {
      if (err) {
        /* istanbul ignore next */
        logger.error(`[MULTER ERROR] Multer middleware error: ${err?.message || err}, code=${err?.code}, field=${err?.field}`, err);
        (req as any).multerError = err;
      } else {
        /* istanbul ignore next */
        logger.info(`[MULTER MIDDLEWARE] Multer processing complete: filesCount=${req.files?.length || 0}`);
      }
      next();
    });
  };
};

export const createFileUploadError = (
  category: string,
  index: string | number,
  constraintKey: string,
  constraintValue: string,
) => {
  return {
    property: category,
    children: [{
      property: index,
      children: [{
        property: 'fileUpload',
        constraints: {
          [constraintKey]: constraintValue,
        },
      }],
    }],
  };
};

export const getMulterErrorConstraint = (multerError: any): string => {
  if (multerError.code === 'LIMIT_FILE_SIZE') {
    return 'ERRORS.VALID_SIZE_FILE';
  } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE' || multerError.field) {
    return 'ERRORS.VALID_MIME_TYPE_FILE';
  }
  return 'ERRORS.FILE_UPLOAD_FAILED';
};

export const extractCategoryAndIndex = (submitAction: string): [string, string] => {
  const parts = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  return [parts[0], parts[1]];
};

export const createUploadOneFileError = () => {
  return [{
    target: {
      fileUpload: '',
      typeOfDocument: '',
    },
    value: '',
    property: '',
    constraints: {
      isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE',
    },
  }];
};
