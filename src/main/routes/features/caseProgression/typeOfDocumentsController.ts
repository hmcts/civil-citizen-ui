import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CP_UPLOAD_DOCUMENTS_URL,
  TYPES_OF_DOCUMENTS_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, UPLOAD_YOUR_DOCUMENTS_URL,
} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {
  deleteUntickedDocumentsFromStore, getDocuments, getTypeDocumentForm, saveCaseProgression,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getTypeOfDocumentsContents} from 'services/features/caseProgression/evidenceUploadDocumentsContent';
import {getClaimById} from 'modules/utilityService';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();
const dqPropertyName = 'defendantUploadDocuments';
const dqPropertyNameClaimant = 'claimantUploadDocuments';

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocuments>, backLinkUrl: string) {

  const claim = await getCaseDataFromStore(claimId);
  const typeOfDocumentsContents = getTypeOfDocumentsContents(claimId, claim);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL);
  const isFastTrack = claim.isFastTrackClaim;
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  claimId = caseNumberPrettify(claimId);

  res.render(typeOfDocumentsViewPath, {form,
    claimId, typeOfDocumentsContents, cancelUrl, isFastTrack, isSmallClaims, backLinkUrl,
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
      await renderView(res, claimId,form, constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
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
      await renderView(res, claimId,form, constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
    } else {
      await saveCaseProgression(claimId,req, form.model, isClaimant);
      await deleteUntickedDocumentsFromStore(claimId, claim.isClaimant());
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);
export default typeOfDocumentsController;
