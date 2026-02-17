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
import {
  getUploadDocumentsForm,
  saveCaseProgression,
  addAnother,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {AppRequest} from 'common/models/AppRequest';
import {getUploadDocumentsContents} from 'services/features/caseProgression/evidenceUploadDocumentsContent';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  createMulterErrorMiddleware,
  createFileUploadError,
  getMulterErrorConstraint,
  extractCategoryAndIndex,
  uploadAndValidateFile,
} from 'common/utils/fileUploadUtils';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadDocumentsController');

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const dqPropertyName = 'defendantDocuments';
const dqPropertyNameClaimant = 'claimantDocuments';

async function uploadSingleFile(req: Request, submitAction: string, form: GenericForm<UploadDocumentsUserForm>) {
  await uploadAndValidateFile(req, submitAction, form, civilServiceClientForDocRetrieve, 'uploadDocumentsController');
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
  const claimId = req.params.id;
  const action = req.body.action;
  const userId = (req as AppRequest)?.session?.user?.id;
  try {
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

    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);

    if (action?.includes('[uploadButton]')) {
      await uploadSingleFile(req, action, form);
    }

    let claim: Claim;
    try {
      claim = await getClaimById(claimId, req, true);
    } catch (getClaimError) {
      if (form.errors?.length) {
        const cachedClaim = await getCaseDataFromStore(generateRedisKey(req as AppRequest), true);
        if (cachedClaim && !cachedClaim.isEmpty()) {
          claim = cachedClaim;
          logger.warn(`[POST] getClaimById failed but using cached claim for upload error display (claimId=${claimId})`);
        } else {
          throw getClaimError;
        }
      } else {
        throw getClaimError;
      }
    }

    const userid = (req as AppRequest)?.session?.user?.id;

    logger.info('Upload documents request received from civil-citizen-ui', {
      claimId,
      userid,
      action,
      timestamp: new Date().toISOString(),
    });

    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    if (action?.includes('add_another-')) {
      addAnother(uploadDocumentsForm, action);
      return renderView(res, claim, claimId, form);
    } else if (action?.includes('[removeButton]')) {
      const [category, index] = action.split(/[[\]]/).filter((word: string) => word !== '');
      (form.model as any)[category].splice(Number(index), 1);
    }

    if (action) {
      logger.info('Action detected in uploadDocumentsController', {
        claimId,
        userid,
        action,
        timestamp: new Date().toISOString(),
      });
      await saveCaseProgression(req, form.model, isClaimant);
      return await renderView(res, claim, claimId, form);
    }

    form.validateSync();

    if (form.hasErrors()) {
      logger.warn('Upload documents form validation failed', {
        claimId,
        userid,
        action,
        timestamp: new Date().toISOString(),
        errors: form.getErrors?.() ?? 'validation errors present',
      });
      await renderView(res, claim, claimId, form);
    } else {
      logger.info(`Form valid for user: ${userid}, saving case progression and redirecting for claimId: ${claimId}`);
      await saveCaseProgression(req, form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    logger.error(`[POST HANDLER] Unexpected error (claimId=${claimId}, userId=${userId}): ${error?.message || error}`, error);
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
