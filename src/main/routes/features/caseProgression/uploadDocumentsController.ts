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

async function uploadSingleFile(req: Request, submitAction: string, form: GenericForm<UploadDocumentsUserForm>) {
  /* istanbul ignore next */
  const {Logger} = require('@hmcts/nodejs-logging');
  const logger = Logger.getLogger('uploadDocumentsController');
  
  const [category, index] = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  const target = `${category}[${index}][fileUpload]`;
  const inputFile = (req.files as Express.Multer.File[]).filter(file =>
    file.fieldname === target,
  );
  
  /* istanbul ignore next */
  logger.info(`[SAVE FILE] uploadSingleFile called: category=${category}, index=${index}, target=${target}, fileFound=${!!inputFile[0]}`);
  
  if (inputFile[0]){
    try {
      const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile[0] as Express.Multer.File);
      
      /* istanbul ignore next */
      logger.info(`[SAVE FILE] File mapped: filename=${fileUpload.originalname}, size=${fileUpload.size}, mimetype=${fileUpload.mimetype}`);
      
      /* istanbul ignore next */
      logger.info('[SAVE FILE] Checking file type (mimetype) before validation');
      const allowedMimeTypes: string[] = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/pdf',
        'application/rtf',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/bmp',
        'image/tiff',
        'text/rtf',
      ];
      
      const isAllowedMimeType = fileUpload.mimetype && allowedMimeTypes.includes(fileUpload.mimetype);
      
      /* istanbul ignore next */
      logger.info(`[SAVE FILE] File type check: mimetype=${fileUpload.mimetype}, isAllowed=${isAllowedMimeType}`);
      
      if (!isAllowedMimeType) {
        /* istanbul ignore next */
        logger.error(`[SAVE FILE] File type not allowed: mimetype=${fileUpload.mimetype}`);
        
        form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload = fileUpload;
        form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = undefined;
        form.errors = [];
        
        const Validator = require('class-validator').Validator;
        const validator = new Validator();
        const fileValidationErrors = validator.validateSync(fileUpload);
        
        if (fileValidationErrors && fileValidationErrors.length > 0) {
          const mimetypeError = fileValidationErrors.find((e: any) => e.property === 'mimetype');
          
          if (mimetypeError) {
            /* istanbul ignore next */
            logger.info(`[SAVE FILE] Mimetype error from validator: property=${mimetypeError.property}, constraints=${JSON.stringify(mimetypeError.constraints)}`);
            
            const fileTypeError = {
              property: category,
              children: [{
                property: index,
                children: [{
                  property: 'fileUpload',
                  constraints: {
                    isAllowedMimeType: 'ERRORS.VALID_MIME_TYPE_FILE',
                  },
                }],
              }],
            };
            
            form.errors.push(fileTypeError as any);
            /* istanbul ignore next */
            logger.info(`[SAVE FILE] File type error added to form.errors. Error structure: category=${category}, index=${index}`);
            
            const expectedErrorPath = `${category}[${category}][${index}][fileUpload]`;
            const foundError = form.errorFor(expectedErrorPath, category);
            /* istanbul ignore next */
            logger.info(`[SAVE FILE] ErrorFor verification: path=${expectedErrorPath}, found=${!!foundError}, message=${foundError || 'NOT FOUND'}`);
          } else {
            /* istanbul ignore next */
            logger.warn(`[SAVE FILE] File validation errors found but no mimetype error: ${JSON.stringify(fileValidationErrors.map((e: any) => e.property))}`);
          }
        }
        
        return;
      }
      
      /* istanbul ignore next */
      logger.info('[SAVE FILE] File type allowed, validating file object (size and mimetype only)');
      const Validator = require('class-validator').Validator;
      const validator = new Validator();
      const fileErrors = validator.validateSync(fileUpload);
      
      /* istanbul ignore next */
      logger.info(`[SAVE FILE] File validation complete: hasErrors=${!!fileErrors && fileErrors.length > 0}, errorCount=${fileErrors?.length || 0}`);
      
      if (fileErrors && fileErrors.length > 0) {
        /* istanbul ignore next */
        logger.error(`[SAVE FILE] File validation failed: errors=${JSON.stringify(fileErrors.map((e: any) => ({property: e.property, constraints: e.constraints})))}`);
        
        form.errors = [];
        
        const firstError = fileErrors[0];
        const firstConstraintKey = firstError?.constraints ? Object.keys(firstError.constraints)[0] : null;
        const firstConstraintValue = firstError?.constraints?.[firstConstraintKey];
        
        const nestedError = {
          property: category,
          children: [{
            property: index,
            children: [{
              property: 'fileUpload',
              constraints: firstConstraintValue ? {
                [firstConstraintKey]: firstConstraintValue,
              } : undefined,
            }],
          }],
        };
        form.errors.push(nestedError as any);
        /* istanbul ignore next */
        logger.info(`[SAVE FILE] File validation errors added to form.errors. Error structure: category=${category}, index=${index}, errorCount=${fileErrors.length}`);
        
        const expectedErrorPath = `${category}[${category}][${index}][fileUpload]`;
        const foundError = form.errorFor(expectedErrorPath, category);
        /* istanbul ignore next */
        logger.info(`[SAVE FILE] ErrorFor verification: path=${expectedErrorPath}, found=${!!foundError}, message=${foundError || 'NOT FOUND'}`);
        
        fileErrors.forEach((error: any, idx: number) => {
          /* istanbul ignore next */
          logger.info(`[SAVE FILE] File error ${idx}: property=${error.property}, constraints=${JSON.stringify(error.constraints)}`);
        });
      } else {
        // File validation passed, proceed with upload
        /* istanbul ignore next */
        logger.info('[SAVE FILE] File validation passed, uploading to API');
        
        try {
          form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
          /* istanbul ignore next */
          logger.info(`[SAVE FILE] File uploaded successfully: documentName=${form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument?.documentName}`);
        } catch (uploadError) {
          /* istanbul ignore next */
          logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`, uploadError);
          
          // Add API upload error to form
          if (!form.errors) {
            form.errors = [];
          }
          const apiError = {
            property: category,
            children: [{
              property: index,
              children: [{
                property: 'fileUpload',
                constraints: {
                  uploadError: 'ERRORS.FILE_UPLOAD_FAILED',
                },
              }],
            }],
          };
          form.errors.push(apiError as any);
        }
      }
      
      delete form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload;
    } catch (error) {
      /* istanbul ignore next */
      logger.error(`[SAVE FILE] Unexpected error: ${error?.message || error}`, error);
      
      // Add unexpected error to form
      if (!form.errors) {
        form.errors = [];
      }
      const unexpectedError = {
        property: category,
        children: [{
          property: index,
          children: [{
            property: 'fileUpload',
            constraints: {
              unexpectedError: 'ERRORS.FILE_UPLOAD_FAILED',
            },
          }],
        }],
      };
      form.errors.push(unexpectedError as any);
    }
  } else {
    /* istanbul ignore next */
    logger.warn(`[SAVE FILE] No file found for upload: target=${target}`);
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

// Wrap multer middleware to catch errors and handle them gracefully
const multerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  /* istanbul ignore next */
  const {Logger} = require('@hmcts/nodejs-logging');
  const logger = Logger.getLogger('uploadDocumentsController');
  logger.info(`[MULTER MIDDLEWARE] Processing request: claimId=${req.params?.id}, contentType=${req.headers['content-type']}`);
  
  upload.any()(req, res, (err: any) => {
    if (err) {
      /* istanbul ignore next */
      logger.error(`[MULTER ERROR] Multer middleware error: ${err?.message || err}, code=${err?.code}, field=${err?.field}`, err);
      
      // Store multer error in request so we can handle it in the POST handler
      (req as any).multerError = err;
    } else {
      /* istanbul ignore next */
      logger.info(`[MULTER MIDDLEWARE] Multer processing complete: filesCount=${req.files?.length || 0}`);
    }
    next();
  });
};

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, multerMiddleware, (async (req, res, next) => {
  /* istanbul ignore next */
  const {Logger} = require('@hmcts/nodejs-logging');
  const logger = Logger.getLogger('uploadDocumentsController');
  
  try {
    /* istanbul ignore next */
    const filesInfo = req.files ? (req.files as Express.Multer.File[]).map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    })) : [];
    logger.info(`[POST HANDLER] POST request received: claimId=${req.params.id}, action=${req.body?.action}, hasMulterError=${!!(req as any).multerError}, filesCount=${req.files?.length || 0}, files=${JSON.stringify(filesInfo)}`);
    
    const claimId = req.params.id;
    const action = req.body.action;
    
    if ((req as any).multerError) {
      /* istanbul ignore next */
      logger.error('[POST HANDLER] Multer error detected, handling gracefully');
      const multerError = (req as any).multerError;
      const claim: Claim = await getClaimById(claimId, req, true);
      const uploadDocumentsForm = getUploadDocumentsForm(req);
      const form = new GenericForm(uploadDocumentsForm);
      
      // Extract category and index from action if available
      if (action?.includes('[uploadButton]')) {
        const [category, index] = action.split(/[[\]]/).filter((word: string) => word !== '');
        
        if (!form.errors) {
          form.errors = [];
        }
        
        let errorConstraint = 'ERRORS.FILE_UPLOAD_FAILED';
        if (multerError.code === 'LIMIT_FILE_SIZE') {
          errorConstraint = 'ERRORS.VALID_SIZE_FILE';
        } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE' || multerError.field) {
          errorConstraint = 'ERRORS.VALID_MIME_TYPE_FILE';
        }
        
        const multerErrorStructure = {
          property: category,
          children: [{
            property: index,
            children: [{
              property: 'fileUpload',
              constraints: {
                multerError: errorConstraint,
              },
            }],
          }],
        };
        form.errors.push(multerErrorStructure as any);
        
        return await renderView(res, claim, claimId, form);
      }
    }
    
    const claim: Claim = await getClaimById(claimId, req, true);
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    if (action?.includes('[uploadButton]')) {
      await uploadSingleFile(req, action, form);
      return await renderView(res, claim, claimId, form);
    }

    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claim, claimId, form);
    } else {
      await saveCaseProgression(req,form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    /* istanbul ignore next */
    logger.error(`[POST HANDLER] Unexpected error: ${error?.message || error}`, error);
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
