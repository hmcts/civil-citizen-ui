import {Request, Response, NextFunction} from 'express';
import {ValidationError, Validator} from 'class-validator';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';
import {createInvalidFileContentError, isFileContentAllowed} from 'common/utils/fileContentTypeUtils';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {CaseDocument} from 'models/document/caseDocument';

const multer = require('multer');
const {Logger} = require('@hmcts/nodejs-logging');

export type RequestWithRejectedFiles = Request & {rejectedFileFields?: string[]};

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

export const MAX_FILES_PER_UPLOAD = 10;

export const createMulterUpload = (fileSizeLimit: number = FILE_SIZE_LIMIT, maxFiles?: number) => {
  const storage = multer.memoryStorage({
    limits: {
      fileSize: fileSizeLimit,
    },
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: fileSizeLimit,
      ...(maxFiles && {files: maxFiles}),
    },
  });
};

const handleMulterResultDroppingDisallowedFiles = (req: Request, err: any, loggerName: string, next: NextFunction): void => {
  if (err || !Array.isArray(req.files)) {
    handleMulterResult(req, err, loggerName, next);
    return;
  }
  const rejected = req.files.filter((file) => !isFileContentAllowed(file.buffer, file.mimetype));
  if (rejected.length) {
    Logger.getLogger(loggerName).error(`[MULTER ERROR] Invalid file content type rejected for ${rejected.length} file(s), code=${createInvalidFileContentError().code}`);
    (req as RequestWithRejectedFiles).rejectedFileFields = rejected.map((file) => file.fieldname);
    (req as Request & {files?: Express.Multer.File[]}).files = req.files.filter((file) => !rejected.includes(file));
  }
  next();
};

export const createMulterErrorMiddleware = (loggerName = 'uploadDocumentsController') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = createMulterUpload(FILE_SIZE_LIMIT);
    upload.any()(req, res, (err: any) => handleMulterResultDroppingDisallowedFiles(req, err, loggerName, next));
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

export const createMulterErrorMiddlewareForMultipleFiles = (
  fieldName: string,
  loggerName = 'uploadDocumentsController',
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = createMulterUpload(FILE_SIZE_LIMIT, MAX_FILES_PER_UPLOAD);
    upload.array(fieldName)(req, res, (err: any) => handleMulterResult(req, err, loggerName, next));
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
  } else if (multerError.code === 'LIMIT_FILE_COUNT') {
    return 'ERRORS.TOO_MANY_FILES';
  } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE' || multerError.field) {
    return 'ERRORS.VALID_MIME_TYPE_FILE';
  }
  return 'ERRORS.FILE_UPLOAD_FAILED';
};

export const extractCategoryAndIndex = (submitAction: string): [string, string] => {
  const parts = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  return [parts[0], parts[1]];
};

export const extractCategorySectionAndFileIndex = (submitAction: string): [string, string, string] => {
  const parts = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  return [parts[0], parts[1], parts[3]];
};

export const normaliseCaseDocuments = <T>(value: T | T[] | undefined | null): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

export const migrateLegacyCaseDocuments = (sections: Array<{caseDocuments?: unknown[]; caseDocument?: unknown}> | undefined): void => {
  sections?.forEach((section) => {
    if (!section.caseDocuments?.length && section.caseDocument) {
      section.caseDocuments = [section.caseDocument];
    }
  });
};

export const viewableCaseDocuments = (caseDocuments: CaseDocument | CaseDocument[] | undefined): CaseDocument[] =>
  normaliseCaseDocuments(caseDocuments).filter((caseDocument) => caseDocument?.documentLink?.document_binary_url);

export const migrateLegacyCaseDocumentsOnForm = (form: object | undefined): void => {
  if (!form) {
    return;
  }
  Object.values(form).forEach((value) => {
    if (Array.isArray(value)) {
      migrateLegacyCaseDocuments(value as Array<{caseDocuments?: unknown[]; caseDocument?: unknown}>);
    }
  });
};

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const parseCaseDocumentsJson = (rawCaseDocuments: string): unknown => {
  try {
    return JSON.parse(rawCaseDocuments);
  } catch (err: unknown) {
    Logger.getLogger('fileUploadUtils').error(`Error parsing case documents: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
};

export const parseCaseDocuments = (section: Record<string, unknown> | undefined): CaseDocument[] => {
  const rawCaseDocuments = section?.caseDocuments || section?.caseDocument;
  if (!rawCaseDocuments) {
    return [];
  }
  const caseDocuments = typeof rawCaseDocuments === 'string' ? parseCaseDocumentsJson(rawCaseDocuments) : rawCaseDocuments;
  return normaliseCaseDocuments(caseDocuments).filter(isObject) as CaseDocument[];
};

const toListIndex = (value: string, length: number): number | undefined => {
  const index = Number(value);
  return /^\d+$/.test(value ?? '') && index < length ? index : undefined;
};

export const removeUploadedFile = (categoryModel: unknown, index: string, fileIndex: string): boolean => {
  const sections = Array.isArray(categoryModel) ? categoryModel : [];
  const sectionIndex = toListIndex(index, sections.length);
  const section = sectionIndex === undefined ? undefined : sections[sectionIndex];
  const caseDocuments = normaliseCaseDocuments(section?.caseDocuments);
  const caseDocumentIndex = toListIndex(fileIndex, caseDocuments.length);
  if (!section || caseDocumentIndex === undefined) {
    return false;
  }
  caseDocuments.splice(caseDocumentIndex, 1);
  section.caseDocuments = caseDocuments;
  return true;
};

export const removeUploadedFileForAction = (model: object, deleteFileAction: string): boolean => {
  const [category, index, fileIndex] = extractCategorySectionAndFileIndex(deleteFileAction);
  return removeUploadedFile((model as Record<string, unknown>)[category], index, fileIndex);
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

type DocumentUploader = {uploadDocument: (req: Request, file: any) => Promise<any>};
type UploadSection = {fileUpload?: unknown; caseDocuments?: unknown};
type ReportSectionError = (constraintKey: string, constraintValue: string) => void;

interface SectionUpload {
  req: Request;
  section?: UploadSection;
  civilServiceClient: DocumentUploader;
  validator: Validator;
  logger: {error: (...args: unknown[]) => void};
  reportError: ReportSectionError;
}

const filesChosenFor = (req: Request, fieldName: string): Express.Multer.File[] =>
  ((req.files as Express.Multer.File[]) || []).filter((file) => file.fieldname === fieldName);

const firstConstraintOf = (validationErrors: ValidationError[]): [string, string] => {
  const constraints = validationErrors[0]?.constraints ?? {};
  const [constraintKey] = Object.keys(constraints);
  return [constraintKey || 'validationError', constraints[constraintKey] || 'ERRORS.FILE_UPLOAD_FAILED'];
};

const oneErrorPerSection = (form: {errors?: any[]}, category: string, index: string): ReportSectionError => {
  let sectionHasError = false;
  return (constraintKey, constraintValue) => {
    if (!sectionHasError) {
      form.errors.push(createFileUploadError(category, index, constraintKey, constraintValue));
      sectionHasError = true;
    }
  };
};

const addToUploadedDocuments = async (fileUpload: unknown, upload: SectionUpload): Promise<void> => {
  try {
    const uploadedDocument = await upload.civilServiceClient.uploadDocument(upload.req, fileUpload);
    if (!uploadedDocument?.documentLink) {
      upload.logger.error('[SAVE FILE] File upload response missing documentLink');
      upload.reportError('uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
      return;
    }
    upload.section.caseDocuments = [...normaliseCaseDocuments(upload.section.caseDocuments), uploadedDocument];
  } catch (uploadError) {
    upload.logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`, uploadError);
    upload.reportError('uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
  }
};

const validateAndUpload = async (file: Express.Multer.File, upload: SectionUpload): Promise<void> => {
  try {
    const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(file);
    if (upload.section) {
      upload.section.fileUpload = fileUpload;
    }
    const validationErrors = upload.validator.validateSync(fileUpload);
    if (validationErrors?.length) {
      upload.reportError(...firstConstraintOf(validationErrors));
    } else if (upload.section) {
      await addToUploadedDocuments(fileUpload, upload);
    }
  } catch (error) {
    upload.logger.error(`[SAVE FILE] Unexpected error: ${error?.message || error}`, error);
    upload.reportError('unexpectedError', 'ERRORS.FILE_UPLOAD_FAILED');
  } finally {
    if (upload.section) {
      delete upload.section.fileUpload;
    }
  }
};

export const uploadAndValidateFile = async (
  req: Request,
  submitAction: string,
  form: {model: Record<string, any>, errors?: any[]},
  civilServiceClient: DocumentUploader,
  loggerName = 'uploadDocumentsController',
): Promise<void> => {
  const [category, index] = extractCategoryAndIndex(submitAction);
  const fieldName = `${category}[${index}][fileUpload]`;
  const files = filesChosenFor(req, fieldName);
  const hasRejectedContent = (req as RequestWithRejectedFiles).rejectedFileFields?.includes(fieldName);
  if (!files.length && !hasRejectedContent) {
    return;
  }

  form.errors ??= [];
  const upload: SectionUpload = {
    req,
    section: form.model[category]?.[+index],
    civilServiceClient,
    validator: new Validator(),
    logger: Logger.getLogger(loggerName),
    reportError: oneErrorPerSection(form, category, index),
  };

  if (hasRejectedContent) {
    upload.reportError('multerError', getMulterErrorConstraint(createInvalidFileContentError()));
  }
  for (const file of files) {
    await validateAndUpload(file, upload);
  }
};
