import {Request, Response, NextFunction} from 'express';
import {ValidationError} from 'class-validator';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';

const multer = require('multer');

export const FILE_UPLOAD_SOURCE = {
  QM_CREATE_QUERY: 'qm_create_query',
  QM_SEND_FOLLOW_UP: 'qm_send_follow_up',
  GA_UPLOAD_EVIDENCE: 'ga_upload_evidence',
  GA_UPLOAD_N245: 'ga_upload_n245',
  GA_ADDITIONAL_DOCUMENTS: 'ga_additional_documents',
  GA_DIRECTIONS_ORDER: 'ga_directions_order',
  GA_ADDITIONAL_INFO: 'ga_additional_info',
  GA_RESPONDENT_UPLOAD: 'ga_respondent_upload',
  GA_WRITTEN_REPRESENTATION: 'ga_written_representation',
} as const;

/** Returns file upload errors only if session.fileUploadSource matches; otherwise clears and returns null. */
export function getFileUploadErrorsForSource(req: { session?: { fileUpload?: string; fileUploadSource?: string } }, source: string): ValidationError[] | null {
  const session = req.session;
  if (!session?.fileUpload) return null;
  if (session.fileUploadSource !== source) {
    session.fileUpload = undefined;
    session.fileUploadSource = undefined;
    return null;
  }
  try {
    const errors = JSON.parse(session.fileUpload) as ValidationError[];
    session.fileUpload = undefined;
    session.fileUploadSource = undefined;
    return errors;
  } catch {
    session.fileUpload = undefined;
    session.fileUploadSource = undefined;
    return null;
  }
}

export function clearFileUploadSession(req: { session?: { fileUpload?: string; fileUploadSource?: string } }): void {
  if (req.session) {
    req.session.fileUpload = undefined;
    req.session.fileUploadSource = undefined;
  }
}

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

/**
 * Multer error middleware for a single file field (e.g. 'selectedFile').
 * On error (e.g. LIMIT_FILE_SIZE), sets req.multerError and continues so the handler can show a validation message.
 * On success, req.file is set as with multer.single(fieldName).
 */
export const createMulterErrorMiddlewareForSingleField = (
  fieldName: string,
  loggerName = 'uploadDocumentsController',
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = createMulterUpload(FILE_SIZE_LIMIT);
    upload.single(fieldName)(req, res, (err: any) => {
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
