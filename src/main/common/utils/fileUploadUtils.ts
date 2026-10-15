import {Request, Response, NextFunction} from 'express';
import {ValidationError} from 'class-validator';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';
import {createInvalidFileContentError, isFileContentAllowed} from 'common/utils/fileContentTypeUtils';

const multer = require('multer');

const rejectIfFileContentInvalid = (req: Request): boolean => {
  const files: Express.Multer.File[] = [];
  if (req.file) {
    files.push(req.file);
  }
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  }

  for (const file of files) {
    if (!isFileContentAllowed(file.buffer, file.mimetype)) {
      return true;
    }
  }
  return false;
};

const clearUploadedFiles = (req: Request): void => {
  delete (req as Request & {file?: Express.Multer.File}).file;
  delete (req as Request & {files?: Express.Multer.File[]}).files;
};

const handleMulterResult = (req: Request, err: any, loggerName: string, next: NextFunction): void => {
  const {Logger} = require('@hmcts/nodejs-logging');
  const logger = Logger.getLogger(loggerName);

  if (err) {
    logger.error(`[MULTER ERROR] Multer middleware error: ${err?.message || err}, code=${err?.code}, field=${err?.field}`, err);
    (req as any).multerError = err;
  } else if (rejectIfFileContentInvalid(req)) {
    const contentError = createInvalidFileContentError();
    logger.error(`[MULTER ERROR] Invalid file content type rejected, code=${contentError.code}`);
    (req as any).multerError = contentError;
    clearUploadedFiles(req);
  }
  next();
};

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

/**
 * Multer middleware for forms whose upload controls accept several files at once (case progression and
 * mediation upload documents). Unlike handleMulterResult, a file whose content does not match its type
 * only drops that file: the rest of the batch is kept, and the rejected field names are recorded on
 * req.rejectedFileFields so uploadAndValidateFile can show an error against the right upload control.
 */
const handleMultiFileMulterResult = (req: Request, err: any, loggerName: string, next: NextFunction): void => {
  if (err || !Array.isArray(req.files)) {
    handleMulterResult(req, err, loggerName, next);
    return;
  }
  const rejected = req.files.filter((file) => !isFileContentAllowed(file.buffer, file.mimetype));
  if (rejected.length) {
    const {Logger} = require('@hmcts/nodejs-logging');
    Logger.getLogger(loggerName).error(`[MULTER ERROR] Invalid file content type rejected for ${rejected.length} file(s), code=${createInvalidFileContentError().code}`);
    (req as any).rejectedFileFields = rejected.map((file) => file.fieldname);
    (req as Request & {files?: Express.Multer.File[]}).files = req.files.filter((file) => !rejected.includes(file));
  }
  next();
};

export const createMulterErrorMiddleware = (loggerName = 'uploadDocumentsController') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = createMulterUpload(FILE_SIZE_LIMIT);
    upload.any()(req, res, (err: any) => handleMultiFileMulterResult(req, err, loggerName, next));
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
    upload.single(fieldName)(req, res, (err: any) => handleMulterResult(req, err, loggerName, next));
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

/** Parses an action like 'witnessStatement[0][deleteFile][1]' into [category, sectionIndex, fileIndex]. */
export const extractCategorySectionAndFileIndex = (submitAction: string): [string, string, string] => {
  const parts = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  return [parts[0], parts[1], parts[3]];
};

/** Normalises a legacy single CaseDocument (pre-multi-file-upload data) or an existing array into an array. */
export const normaliseCaseDocuments = <T>(value: T | T[] | undefined | null): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

/**
 * Migrates sections persisted under the old single-document shape (`caseDocument`) onto the new
 * `caseDocuments` array, in place. Existing drafts saved before the multi-file-upload change only
 * have `caseDocument`, and every read path now only looks at `caseDocuments` - without this, an
 * already-uploaded document disappears from the page and is discarded on the next save.
 */
export const migrateLegacyCaseDocuments = (sections: Array<{caseDocuments?: unknown[]; caseDocument?: unknown}> | undefined): void => {
  sections?.forEach((section) => {
    if (!section.caseDocuments?.length && section.caseDocument) {
      section.caseDocuments = [section.caseDocument];
    }
  });
};

/** Migrates every section array on a plain upload-documents-shaped object (see migrateLegacyCaseDocuments). */
export const migrateLegacyCaseDocumentsOnForm = (form: Record<string, unknown> | undefined): void => {
  if (!form) {
    return;
  }
  Object.values(form).forEach((value) => {
    if (Array.isArray(value)) {
      migrateLegacyCaseDocuments(value as Array<{caseDocuments?: unknown[]; caseDocument?: unknown}>);
    }
  });
};

export const removeUploadedFile = (categoryModel: any, index: string, fileIndex: string): boolean => {
  const section = categoryModel?.[+index];
  const caseDocuments = normaliseCaseDocuments(section?.caseDocuments);
  if (!section || +fileIndex < 0 || +fileIndex >= caseDocuments.length) {
    return false;
  }
  caseDocuments.splice(+fileIndex, 1);
  section.caseDocuments = caseDocuments;
  return true;
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
  // The upload control allows selecting / dropping several files at once, all under the same field name.
  const inputFiles = ((req.files as Express.Multer.File[]) || []).filter((file: Express.Multer.File) =>
    file.fieldname === target,
  );

  const hasRejectedContent = ((req as any).rejectedFileFields as string[] | undefined)?.includes(target);

  if (!inputFiles.length && !hasRejectedContent) {
    return;
  }

  if (!form.errors) {
    form.errors = [];
  }

  // Only one error is shown per upload control, so stop reporting once the section has one.
  let sectionHasError = false;
  const addSectionError = (constraintKey: string, constraintValue: string) => {
    if (!sectionHasError) {
      form.errors.push(createFileUploadError(category, index, constraintKey, constraintValue));
      sectionHasError = true;
    }
  };

  if (hasRejectedContent) {
    addSectionError('multerError', getMulterErrorConstraint(createInvalidFileContentError()));
  }

  const categoryModel = form.model[category];

  for (const inputFile of inputFiles) {
    try {
      const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile);
      if (categoryModel && categoryModel[+index]) {
        categoryModel[+index].fileUpload = fileUpload;
      }

      const fileErrors = validator.validateSync(fileUpload);

      if (fileErrors && fileErrors.length > 0) {
        const firstError = fileErrors[0];
        const firstConstraintKey = firstError?.constraints ? Object.keys(firstError.constraints)[0] : null;
        const firstConstraintValue = firstError?.constraints?.[firstConstraintKey];
        addSectionError(firstConstraintKey || 'validationError', firstConstraintValue || 'ERRORS.FILE_UPLOAD_FAILED');
      } else if (categoryModel && categoryModel[+index]) {
        try {
          const uploadedDocument = await civilServiceClient.uploadDocument(req, fileUpload);

          if (!uploadedDocument?.documentLink) {
            logger.error('[SAVE FILE] File upload response missing documentLink');
            addSectionError('uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
          } else {
            const caseDocuments = normaliseCaseDocuments(categoryModel[+index].caseDocuments);
            caseDocuments.push(uploadedDocument);
            categoryModel[+index].caseDocuments = caseDocuments;
          }
        } catch (uploadError) {
          logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`, uploadError);
          addSectionError('uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
        }
      }
    } catch (error) {
      logger.error(`[SAVE FILE] Unexpected error: ${error?.message || error}`, error);
      addSectionError('unexpectedError', 'ERRORS.FILE_UPLOAD_FAILED');
    } finally {
      if (categoryModel && categoryModel[+index]) {
        delete categoryModel[+index].fileUpload;
      }
    }
  }
};
