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
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {uploadSingleFileWithValidation} from 'common/utils/fileUploadHelper';

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
  logger.info(`[SAVE FILE] uploadSingleFile called: submitAction=${submitAction}, filesCount=${req.files?.length || 0}`);
  
  await uploadSingleFileWithValidation(
    req,
    submitAction,
    form,
    civilServiceClientForDocRetrieve,
    {
      useDoubleCategoryInErrorPath: true, // Case progression uses ${category}[${category}][${index}][fileUpload]
      findFileMethod: 'filter', // Case progression uses filter()[0]
    },
  );
  
  /* istanbul ignore next */
  logger.info('[SAVE FILE] uploadSingleFileWithValidation completed');
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
    logger.info(`[SAVE FILE BUTTON CLICKED] POST upload documents: claimId=${req.params.id}, action=${req.body?.action}, filesCount=${req.files?.length || 0}, files=${JSON.stringify(filesInfo)}`);
    
    const claimId = req.params.id;
    const action = req.body.action;
    
    /* istanbul ignore next */
    logger.info(`[SAVE FILE] Getting claim data: claimId=${claimId}`);
    const claim: Claim = await getClaimById(claimId, req, true);
    
    /* istanbul ignore next */
    logger.info('[SAVE FILE] Building form from request');
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    if (action?.includes('[uploadButton]')) {
      /* istanbul ignore next */
      logger.info(`[SAVE FILE] Upload button action detected: action=${action}`);
      try {
        await uploadSingleFile(req, action, form);
        /* istanbul ignore next */
        logger.info('[SAVE FILE] uploadSingleFile completed successfully, rendering view');
      } catch (error) {
        /* istanbul ignore next */
        // If uploadSingleFile throws an error, catch it and add to form errors instead of redirecting to error page
        logger.error(`Error in uploadSingleFile: ${error?.message || error}`, error);
        
        // Ensure form has errors array
        if (!form.errors) {
          form.errors = [];
        }
        
        // Extract category and index from action to create proper error structure
        const [category] = action.split(/[[\]]/).filter((word: string) => word !== '');
        const errorStructure = {
          property: category,
          children: [{
            property: category,
            children: [{
              property: '0',
              children: [{
                property: 'fileUpload',
                constraints: {
                  uploadError: 'ERRORS.FILE_UPLOAD_FAILED',
                },
              }],
            }],
          }],
        };
        form.errors.push(errorStructure as any);
      }
      /* istanbul ignore next */
      logger.info('[SAVE FILE] Rendering view after upload button action');
      return await renderView(res, claim, claimId, form);
    }

    /* istanbul ignore next */
    logger.info('[SAVE FILE] Not an upload button action, validating full form');
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claim, claimId, form);
    } else {
      await saveCaseProgression(req,form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    /* istanbul ignore next */
    // Catch any unexpected errors and try to display on form if it's an upload action
    logger.error(`Unexpected error in upload documents POST: ${error?.message || error}`, error);
    
    // If this is an upload button action, try to show error on form instead of redirecting
    if (req.body?.action?.includes('[uploadButton]')) {
      try {
        const claimId = req.params.id;
        const claim: Claim = await getClaimById(claimId, req, true);
        const uploadDocumentsForm = getUploadDocumentsForm(req);
        const form = new GenericForm(uploadDocumentsForm);
        
        if (!form.errors) {
          form.errors = [];
        }
        const [category] = req.body.action.split(/[[\]]/).filter((word: string) => word !== '');
        const errorStructure = {
          property: category,
          children: [{
            property: category,
            children: [{
              property: '0',
              children: [{
                property: 'fileUpload',
                constraints: {
                  uploadError: 'ERRORS.FILE_UPLOAD_FAILED',
                },
              }],
            }],
          }],
        };
        form.errors.push(errorStructure as any);
        return await renderView(res, claim, claimId, form);
      } catch (renderError) {
        // If we can't render the view, fall back to error handler
        next(error);
      }
    } else {
      // Not an upload action, use normal error handling
      next(error);
    }
  }
}) as RequestHandler);

export default uploadDocumentsController;
