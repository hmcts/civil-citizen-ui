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
import {
  createMulterErrorMiddleware,
  createFileUploadError,
  getMulterErrorConstraint,
  extractCategoryAndIndex,
} from 'common/utils/fileUploadUtils';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const dqPropertyName = 'defendantDocuments';
const dqPropertyNameClaimant = 'claimantDocuments';

const {Validator} = require('class-validator');
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadDocumentsController');
const validator = new Validator();

async function uploadSingleFile(req: Request, submitAction: string, form: GenericForm<UploadDocumentsUserForm>) {
  const [category, index] = extractCategoryAndIndex(submitAction);
  const target = `${category}[${index}][fileUpload]`;
  const inputFile = (req.files as Express.Multer.File[]).filter(file =>
    file.fieldname === target,
  );
  
  if (inputFile[0]){
    try {
      const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile[0] as Express.Multer.File);
      form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload = fileUpload;
      form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = undefined;
      
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
        form.errors.push(nestedError as any);
      } else {
        try {
          form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
        } catch (uploadError) {
          logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`, uploadError);
          
          const apiError = createFileUploadError(category, index, 'uploadError', 'ERRORS.FILE_UPLOAD_FAILED');
          form.errors.push(apiError as any);
        }
      }
      
      delete form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload;
    } catch (error) {
      logger.error(`[SAVE FILE] Unexpected error: ${error?.message || error}`, error);
      
      if (!form.errors) {
        form.errors = [];
      }
      const unexpectedError = createFileUploadError(category, index, 'unexpectedError', 'ERRORS.FILE_UPLOAD_FAILED');
      form.errors.push(unexpectedError as any);
    }
  }
}

async function renderView(res: Response, claim: Claim, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);
  const currentUrl = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  const isSmallClaims = claim.isSmallClaimsTrackDQ;

  if (!claim.isClaimant() && !form && claim.caseProgression?.defendantDocuments) {
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

const multerMiddleware = createMulterErrorMiddleware('uploadDocumentsController');

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, multerMiddleware, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const action = req.body.action;
    
    if ((req as any).multerError) {
      const multerError = (req as any).multerError;
      const claim: Claim = await getClaimById(claimId, req, true);
      const uploadDocumentsForm = getUploadDocumentsForm(req);
      const form = new GenericForm(uploadDocumentsForm);
      
      if (action?.includes('[uploadButton]')) {
        const [category, index] = extractCategoryAndIndex(action);
        
        if (!form.errors) {
          form.errors = [];
        }
        
        const errorConstraint = getMulterErrorConstraint(multerError);
        const multerErrorStructure = createFileUploadError(category, index, 'multerError', errorConstraint);
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
      await saveCaseProgression(req, form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    logger.error(`[POST HANDLER] Unexpected error: ${error?.message || error}`, error);
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
