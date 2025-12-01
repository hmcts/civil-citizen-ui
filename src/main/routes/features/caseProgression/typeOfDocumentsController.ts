import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CP_UPLOAD_DOCUMENTS_URL,
  TYPES_OF_DOCUMENTS_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
  APPLICATION_TYPE_URL,
} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {
  deleteUntickedDocumentsFromStore, getDocuments, getTypeDocumentForm, saveCaseProgression,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getTypeOfDocumentsContents} from 'services/features/caseProgression/evidenceUploadDocumentsContent';
import {getClaimById} from 'modules/utilityService';
import {isCuiGaNroEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();
const dqPropertyName = 'defendantUploadDocuments';
const dqPropertyNameClaimant = 'claimantUploadDocuments';

async function renderView(res: Response, req: AppRequest, claimId: string, form: GenericForm<UploadDocuments>, backLinkUrl: string) {
  const isGaNroEnabled = await isCuiGaNroEnabled();
  const claim = await getClaimById(claimId, req,true);
  const typeOfDocumentsContents = getTypeOfDocumentsContents(claimId, claim);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL);
  const isFastTrack = claim.isFastTrackClaim;
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  const applyGaApplication = constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL);
  claimId = caseNumberPrettify(claimId);

  res.render(typeOfDocumentsViewPath, {form,
    claimId,
    typeOfDocumentsContents,
    cancelUrl,
    isFastTrack,
    isSmallClaims,
    backLinkUrl,
    isGaNroEnabled,
    applyGaApplication,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const redisKey= generateRedisKey(req);
      const documentsList = await getDocuments(redisKey);
      const form = new GenericForm(documentsList);
      req.session.previousUrl = req.originalUrl;
      await renderView(res,req, claimId,form, constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const claim =  await getClaimById(claimId, req,true);
    const typeDocumentList= getTypeDocumentForm(req);
    const form = new GenericForm(typeDocumentList);
    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, <AppRequest>req, claimId,form, constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
    } else {
      await saveCaseProgression(req, form.model, isClaimant);
      await deleteUntickedDocumentsFromStore(req,claim.isClaimant());
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);
export default typeOfDocumentsController;
