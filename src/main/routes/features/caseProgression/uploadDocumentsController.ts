import {NextFunction, Response, RequestHandler, Router, Request} from 'express';
import {
  CP_CHECK_ANSWERS_URL,
  CP_EVIDENCE_UPLOAD_CANCEL,
  CP_UPLOAD_DOCUMENTS_URL,
  TYPES_OF_DOCUMENTS_URL,
} from '../../urls';
import {Claim} from 'models/claim';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {
  getDisclosureContent,
} from 'services/features/caseProgression/disclosureService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {AppRequest} from 'common/models/AppRequest';
import {getUploadDocumentsContents} from 'services/features/caseProgression/evidenceUploadDocumentsContent';
import {getClaimById} from 'modules/utilityService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ValidationError} from 'class-validator';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadDocumentsController');

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const dqPropertyName = 'defendantDocuments';
const dqPropertyNameClaimant = 'claimantDocuments';

const multer = require('multer');
const fileSize = Infinity;

const storage = multer.memoryStorage({
  limits: {
    fileSize: fileSize,
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSize,
  },
});

/**
 * Recursively checks if an error or any of its children match the target section
 * @param error - ValidationError object
 * @param category - The category name
 * @param index - The index of the section
 * @param pathPrefix - Current path prefix (for building full paths)
 * @returns true if this error or any child matches the section
 */
function hasErrorForSection(error: ValidationError, category: string, index: number, pathPrefix = ''): boolean {
  const sectionPath = `${category}[${category}][${index}]`;
  const currentPath = pathPrefix ? `${pathPrefix}[${error.property}]` : error.property;
  
  logger.debug(`hasErrorForSection: Checking error at path "${currentPath}" for section "${sectionPath}"`);
  
  // Check if current path matches the section
  if (currentPath.startsWith(sectionPath)) {
    logger.debug(`hasErrorForSection: Found matching error at path "${currentPath}"`);
    return true;
  }
  
  // Check children recursively
  if (error.children && error.children.length > 0) {
    logger.debug(`hasErrorForSection: Checking ${error.children.length} children of "${currentPath}"`);
    const hasMatch = error.children.some((child, childIndex) => {
      // At the category level, check if this is the target index
      if (error.property === category && pathPrefix === '') {
        const isTargetIndex = childIndex === index;
        logger.debug(`hasErrorForSection: At category level "${category}", checking child index ${childIndex} (target: ${index}, match: ${isTargetIndex})`);
        return isTargetIndex && hasErrorForSection(child, category, index, currentPath);
      }
      return hasErrorForSection(child, category, index, currentPath);
    });
    
    if (hasMatch) {
      logger.debug(`hasErrorForSection: Found matching child error in "${currentPath}"`);
    }
    return hasMatch;
  }
  
  logger.debug(`hasErrorForSection: No match found for "${currentPath}"`);
  return false;
}

/**
 * Recursively filters a ValidationError to only include errors for a specific section
 * @param error - ValidationError object
 * @param category - The category name (e.g., 'documentsForDisclosure', 'witnessStatement')
 * @param index - The index of the section
 * @param pathPrefix - Current path prefix (for recursion)
 * @returns Filtered ValidationError or null if no matching errors
 */
function filterErrorRecursive(error: ValidationError, category: string, index: number, pathPrefix = ''): ValidationError | null {
  const sectionPath = `${category}[${category}][${index}]`;
  const currentPath = pathPrefix ? `${pathPrefix}[${error.property}]` : error.property;
  const isInSection = currentPath.startsWith(sectionPath);
  
  logger.debug(`filterErrorRecursive: Processing error at path "${currentPath}" (in section: ${isInSection})`);
  
  // Filter children recursively
  let filteredChildren: ValidationError[] = [];
  if (error.children && error.children.length > 0) {
    logger.debug(`filterErrorRecursive: Filtering ${error.children.length} children of "${currentPath}"`);
    filteredChildren = error.children
      .map((child, childIndex) => {
        // At the category level (top level), only process the child at target index
        if (error.property === category && pathPrefix === '') {
          if (childIndex === index) {
            logger.debug(`filterErrorRecursive: Processing child at index ${childIndex} (matches target index ${index})`);
            return filterErrorRecursive(child, category, index, currentPath);
          }
          logger.debug(`filterErrorRecursive: Skipping child at index ${childIndex} (target index: ${index})`);
          return null;
        }
        // Otherwise, recursively filter all children
        return filterErrorRecursive(child, category, index, currentPath);
      })
      .filter((child): child is ValidationError => child !== null);
    
    logger.debug(`filterErrorRecursive: Filtered to ${filteredChildren.length} children for "${currentPath}"`);
  }
  
  // Include this error if:
  // 1. It's in the target section and has constraints, OR
  // 2. It has filtered children (meaning it's a parent of errors in the section)
  const hasConstraints = !!error.constraints;
  const shouldInclude = (isInSection && hasConstraints) || filteredChildren.length > 0;
  
  if (shouldInclude) {
    logger.debug(`filterErrorRecursive: Including error at "${currentPath}" (hasConstraints: ${hasConstraints}, filteredChildren: ${filteredChildren.length})`);
    return {
      ...error,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
    };
  }
  
  logger.debug(`filterErrorRecursive: Excluding error at "${currentPath}"`);
  return null;
}

/**
 * Filters validation errors to only include errors for a specific category and index
 * @param errors - Array of ValidationError objects
 * @param category - The category name (e.g., 'documentsForDisclosure', 'witnessStatement')
 * @param index - The index of the section
 * @returns Filtered array of ValidationError objects
 */
function filterErrorsBySection(errors: ValidationError[], category: string, index: number): ValidationError[] {
  logger.info(`filterErrorsBySection: Starting error filtering for category="${category}", index=${index}`);
  
  if (!errors || errors.length === 0) {
    logger.info('filterErrorsBySection: No errors to filter');
    return [];
  }
  
  logger.info(`filterErrorsBySection: Processing ${errors.length} top-level errors`);
  
  // First, filter to only errors that have matches for this section
  const errorsWithMatches = errors.filter(error => hasErrorForSection(error, category, index));
  logger.info(`filterErrorsBySection: Found ${errorsWithMatches.length} errors with matches for section`);
  
  // Then recursively filter each error
  const filteredErrors = errorsWithMatches
    .map(error => {
      logger.debug(`filterErrorsBySection: Filtering error with property="${error.property}"`);
      return filterErrorRecursive(error, category, index);
    })
    .filter((error): error is ValidationError => error !== null);
  
  logger.info(`filterErrorsBySection: Filtered to ${filteredErrors.length} errors for category="${category}", index=${index}`);
  
  return filteredErrors;
}

async function uploadSingleFile(req: Request, submitAction: string, form: GenericForm<UploadDocumentsUserForm>) {
  const [category, index] = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  const target = `${category}[${index}][fileUpload]`;
  
  logger.info(`uploadSingleFile: Processing file upload for category="${category}", index=${index}, target="${target}"`);
  
  const inputFile = (req.files as Express.Multer.File[]).filter(file =>
    file.fieldname === target,
  );
  
  if (inputFile[0]){
    logger.info(`uploadSingleFile: File found for target "${target}", originalname="${inputFile[0].originalname}", size=${inputFile[0].size}, mimetype="${inputFile[0].mimetype}"`);
    
    const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile[0] as Express.Multer.File);
    form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload = fileUpload;
    form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = undefined;

    // Validate the entire form
    logger.info('uploadSingleFile: Starting form validation');
    form.validateSync();
    
    const initialErrorCount = form.errors?.length || 0;
    logger.info(`uploadSingleFile: Validation completed with ${initialErrorCount} initial errors`);
    
    if (initialErrorCount > 0) {
      logger.debug(`uploadSingleFile: Initial errors: ${JSON.stringify(form.errors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2)}`);
    }
    
    // Filter errors to only include errors for this specific section
    if (form.errors && form.errors.length > 0) {
      const errorsBeforeFilter = form.errors.length;
      form.errors = filterErrorsBySection(form.errors, category, +index);
      const errorsAfterFilter = form.errors.length;
      logger.info(`uploadSingleFile: Error filtering completed - ${errorsBeforeFilter} errors before, ${errorsAfterFilter} errors after filtering`);
      
      if (errorsAfterFilter > 0) {
        logger.debug(`uploadSingleFile: Filtered errors: ${JSON.stringify(form.errors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2)}`);
      }
    }
    
    delete form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload; //release memory
    const errorFieldNamePrefix = `${category}[${category}][${index}][fileUpload]`;
    
    const sizeError = form?.errorFor(`${errorFieldNamePrefix}[size]`, `${category}`);
    const mimetypeError = form?.errorFor(`${errorFieldNamePrefix}[mimetype]`, `${category}`);
    const fileUploadError = form?.errorFor(`${errorFieldNamePrefix}`, `${category}`);
    
    if (sizeError) {
      logger.warn(`uploadSingleFile: File size validation error for "${target}": ${sizeError}`);
    }
    if (mimetypeError) {
      logger.warn(`uploadSingleFile: MIME type validation error for "${target}": ${mimetypeError}`);
    }
    if (fileUploadError) {
      logger.warn(`uploadSingleFile: File upload validation error for "${target}": ${fileUploadError}`);
    }
    
    if (!sizeError && !mimetypeError && !fileUploadError) {
      logger.info(`uploadSingleFile: No validation errors, proceeding with document upload for "${target}"`);
      try {
        form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
        logger.info(`uploadSingleFile: Document uploaded successfully for "${target}"`);
      } catch (error) {
        logger.error(`uploadSingleFile: Error uploading document for "${target}":`, error);
        throw error;
      }
    } else {
      logger.info(`uploadSingleFile: Validation errors found, skipping document upload for "${target}"`);
    }
  } else {
    logger.warn(`uploadSingleFile: No file found for target "${target}"`);
  }
}

async function renderView(res: Response, claim: Claim, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);
  const currentUrl = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  const isSmallClaims = claim.isSmallClaimsTrackDQ;

  if(!claim.isClaimant() && !form && claim.caseProgression?.defendantDocuments)
  {
    form = new GenericForm(claim.caseProgression?.defendantDocuments);
  } else if (claim.isClaimant() && !form && claim.caseProgression?.claimantDocuments) {
    form = new GenericForm(claim.caseProgression?.claimantDocuments);
  }

  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claim, form);
    const expertContent = getExpertContent(claim, form);
    const trialContent = getTrialContent(claim, form, isSmallClaims);
    const uploadDocumentsContents= getUploadDocumentsContents(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, TYPES_OF_DOCUMENTS_URL);
    res.render(uploadDocumentsViewPath, {
      currentUrl,
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      cancelUrl,
      isSmallClaims,
      uploadDocumentsContents,
      backLinkUrl,
    });
  }
}

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    req.session.previousUrl = req.originalUrl;
    const claim: Claim = await getClaimById(claimId, req, true);
    await renderView(res, claim, claimId, null);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, upload.any(), (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const action = req.body.action;
    
    logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Request received for claimId="${claimId}", action="${action}"`);
    
    const claim: Claim = await getClaimById(claimId, req, true);
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    if (action?.includes('[uploadButton]')) {
      logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Upload button clicked, processing file upload`);
      await uploadSingleFile(req, action, form);
      logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: File upload processed, rendering view with ${form.errors?.length || 0} errors`);
      return await renderView(res, claim, claimId, form);
    }

    logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Continue button clicked, validating entire form`);
    form.validateSync();
    
    const errorCount = form.errors?.length || 0;
    logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Form validation completed with ${errorCount} errors`);
    
    if (form.hasErrors()) {
      logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Form has errors, rendering view with errors`);
      await renderView(res, claim, claimId, form);
    } else {
      logger.info(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Form validation passed, saving case progression and redirecting`);
      await saveCaseProgression(req,form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    logger.error(`POST ${CP_UPLOAD_DOCUMENTS_URL}: Error processing request:`, error);
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
