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
    const upload = createMulterUpload(FILE_SIZE_LIMIT);
    upload.any()(req, res, (err: any) => {
      if (err) {
        const {Logger} = require('@hmcts/nodejs-logging');
        const logger = Logger.getLogger(loggerName);
        logger.error(`[MULTER ERROR] Multer middleware error: ${err?.message || err}, code=${err?.code}, field=${err?.field}`, err);
        (req as any).multerError = err;
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

export const uploadAndValidateFile = async (
  req: Request,
  submitAction: string,
  form: {model: Record<string, any>, errors?: any[]},
  civilServiceClient: {uploadDocument: (req: Request, file: any) => Promise<any>},
  loggerName = 'uploadDocumentsController',
): Promise<void> => {
  const {Validator} = require('class-validator');
  const {Logger} = require('@hmcts/nodejs-logging');
  const logger = Logger.getLogger(loggerName);
  const validator = new Validator();
  const {TypeOfDocumentSectionMapper} = require('services/features/caseProgression/TypeOfDocumentSectionMapper');

  const [category, index] = extractCategoryAndIndex(submitAction);
  const target = `${category}[${index}][fileUpload]`;
  const inputFile = (req.files as Express.Multer.File[]).find((file: Express.Multer.File) =>
    file.fieldname === target,
  );

  if (!inputFile) {
    return;
  }

  try {
    const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile as Express.Multer.File);
    const categoryModel = form.model[category];
    if (categoryModel && categoryModel[+index]) {
      categoryModel[+index].fileUpload = fileUpload;
      categoryModel[+index].caseDocument = undefined;
    }

    if (!form.errors) {
      form.errors = [];
    }

    const fileErrors = validator.validateSync(fileUpload);

    if (fileErrors && fileErrors.length > 0) {
      const firstError = fileErrors[0];
      const firstConstraintKey = firstError?.constraints ? Object.keys(firstError.constraints)[0] : null;
      const firstConstraintValue = firstError?.constraints?.[firstConstraintKey];

      const nestedError = createFileUploadError(
        category,
        index,
        firstConstraintKey || 'validationError',
        firstConstraintValue || 'ERRORS.FILE_UPLOAD_FAILED',
      );
      form.errors.push(nestedError);
    } else {
      try {
        if (categoryModel && categoryModel[+index]) {
          categoryModel[+index].caseDocument = await civilServiceClient.uploadDocument(req, fileUpload);
         
          if (!categoryModel[+index].caseDocument?.documentLink) {
            logger.error(`[SAVE FILE] File upload response missing documentLink: ${JSON.stringify(categoryModel[+index].caseDocument)}`);
            const apiError = createFileUploadError(category, index, 'uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
            form.errors.push(apiError);
            categoryModel[+index].caseDocument = undefined;
          }
        }
      } catch (uploadError) {
        logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`, uploadError);

        const apiError = createFileUploadError(category, index, 'uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
        form.errors.push(apiError);
      }
    }

    if (categoryModel && categoryModel[+index]) {
      delete categoryModel[+index].fileUpload;
    }
  } catch (error) {
    logger.error(`[SAVE FILE] Unexpected error: ${error?.message || error}`, error);

    if (!form.errors) {
      form.errors = [];
    }
    const unexpectedError = createFileUploadError(category, index, 'unexpectedError', 'ERRORS.FILE_UPLOAD_FAILED');
    form.errors.push(unexpectedError);
  }
};
