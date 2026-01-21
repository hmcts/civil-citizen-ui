import {Request} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {AppRequest} from 'common/models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('fileUploadHelper');

interface UploadFileConfig {
  useDoubleCategoryInErrorPath: boolean; // true for case progression, false for mediation
  findFileMethod: 'filter' | 'find'; // 'filter' for case progression, 'find' for mediation
}

/**
 * Shared utility function to handle single file upload with validation and error handling
 * @param req - Express request object
 * @param submitAction - Action string containing category and index (e.g., "category[0][uploadButton]")
 * @param form - GenericForm instance containing the form model
 * @param civilServiceClient - CivilServiceClient instance for uploading documents
 * @param config - Configuration object for error path structure and file finding method
 */
export async function uploadSingleFileWithValidation<T extends Record<string, any>>(
  req: Request,
  submitAction: string,
  form: GenericForm<T>,
  civilServiceClient: CivilServiceClient,
  config: UploadFileConfig,
): Promise<void> {
  const [category, index] = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  const target = `${category}[${index}][fileUpload]`;
  
  /* istanbul ignore next */
  logger.info(`[FILE UPLOAD HELPER] Starting: category=${category}, index=${index}, target=${target}, findMethod=${config.findFileMethod}`);
  /* istanbul ignore next */
  const availableFiles = req.files ? (req.files as Express.Multer.File[]).map(f => f.fieldname) : [];
  logger.info(`[FILE UPLOAD HELPER] Available files in request: ${JSON.stringify(availableFiles)}`);
  
  // Find the file using the configured method
  const inputFile = config.findFileMethod === 'filter'
    ? (req.files as Express.Multer.File[]).filter(file => file.fieldname === target)[0]
    : (req.files as Express.Multer.File[]).find(file => file.fieldname === target);
  
  /* istanbul ignore next */
  logger.info(`[FILE UPLOAD HELPER] File search result: found=${!!inputFile}, target=${target}`);
  
  if (inputFile) {
    try {
      const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile as Express.Multer.File);
      
      /* istanbul ignore next */
      logger.info(`[FILE UPLOAD HELPER] File mapped: category=${category}, index=${index}, filename=${fileUpload.originalname}, size=${fileUpload.size}, mimetype=${fileUpload.mimetype}`);
      
      /* istanbul ignore next */
      // Validate only the file object itself, not the entire form
      // This prevents validation errors from other incomplete fields on the page
      logger.info('[FILE UPLOAD HELPER] Starting file validation');
      const Validator = require('class-validator').Validator;
      const validator = new Validator();
      const fileErrors = validator.validateSync(fileUpload);
      
      /* istanbul ignore next */
      logger.info(`[FILE UPLOAD HELPER] Validation complete: hasErrors=${!!fileErrors && fileErrors.length > 0}, errorCount=${fileErrors?.length || 0}`);
      
      // If file validation passes, upload it
      if (!fileErrors || fileErrors.length === 0) {
        /* istanbul ignore next */
        logger.info('[FILE UPLOAD HELPER] Validation passed, starting API upload');
        try {
          /* istanbul ignore next */
          logger.info('[FILE UPLOAD HELPER] Calling API to upload document');
          form.model[category as keyof T][+index].caseDocument = await civilServiceClient.uploadDocument(<AppRequest>req, fileUpload);
          /* istanbul ignore next */
          logger.info(`[FILE UPLOAD HELPER] API upload successful: category=${category}, index=${index}, documentName=${form.model[category as keyof T][+index].caseDocument?.documentName}`);
        } catch (uploadError) {
          /* istanbul ignore next */
          logger.error(`Error uploading file to API: category=${category}, index=${index}, error=${uploadError?.message || uploadError}`, uploadError);
          // Store API upload error
          if (!form.errors) {
            form.errors = [];
          }
          const apiError = createErrorStructure(category, index, {
            uploadError: 'ERRORS.FILE_UPLOAD_FAILED',
          }, config.useDoubleCategoryInErrorPath);
          form.errors.push(apiError as any);
        }
      } else {
        /* istanbul ignore next */
        logger.error(`File validation failed: category=${category}, index=${index}, errors=${JSON.stringify(fileErrors.map((e: any) => ({property: e.property, constraints: e.constraints})))}`);
        // Store validation errors for this specific file field only
        if (!form.errors) {
          form.errors = [];
        }
        const nestedError = createErrorStructure(category, index, null, config.useDoubleCategoryInErrorPath, fileErrors);
        form.errors.push(nestedError as any);
      }
      
      // Release memory
      delete form.model[category as keyof T][+index].fileUpload;
    } catch (error) {
      /* istanbul ignore next */
      logger.error(`Unexpected error in uploadSingleFile: category=${category}, index=${index}, error=${error?.message || error}`, error);
      // Store unexpected error
      if (!form.errors) {
        form.errors = [];
      }
      const unexpectedError = createErrorStructure(category, index, {
        unexpectedError: 'ERRORS.FILE_UPLOAD_FAILED',
      }, config.useDoubleCategoryInErrorPath);
      form.errors.push(unexpectedError as any);
    }
  } else {
    /* istanbul ignore next */
    logger.warn(`No file found for upload: category=${category}, index=${index}, target=${target}`);
  }
}

/**
 * Creates error structure matching the expected format for the view
 * @param category - Category name (e.g., "witnessStatement")
 * @param index - Index of the item in the array
 * @param constraints - Error constraints object (for API/unexpected errors)
 * @param useDoubleCategory - Whether to use double category in error path (case progression) or single (mediation)
 * @param children - Child errors from validation (for file validation errors)
 */
function createErrorStructure(
  category: string,
  index: string,
  constraints: Record<string, string> | null,
  useDoubleCategory: boolean,
  children?: any[],
): any {
  const fileUploadError: any = {
    property: 'fileUpload',
  };
  
  if (constraints) {
    fileUploadError.constraints = constraints;
  }
  
  if (children) {
    fileUploadError.children = children;
    fileUploadError.constraints = children[0]?.constraints;
  }
  
  if (useDoubleCategory) {
    // Case progression format: ${category}[${category}][${index}][fileUpload]
    return {
      property: category,
      children: [{
        property: category,
        children: [{
          property: index.toString(),
          children: [fileUploadError],
        }],
      }],
    };
  } else {
    // Mediation format: ${category}[${index}][fileUpload]
    return {
      property: category,
      children: [{
        property: index.toString(),
        children: [fileUploadError],
      }],
    };
  }
}
