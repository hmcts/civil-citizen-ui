import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CP_EVIDENCE_UPLOAD_CANCEL,
  CP_UPLOAD_DOCUMENTS_URL,
  TYPES_OF_DOCUMENTS_URL,
} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {
  deleteUntickedDocumentsFromStore, getDocuments, getTypeDocumentForm, saveCaseProgression,
} from 'services/features/caseProgression/caseProgressionService';
import {ClaimantOrDefendant} from 'models/partyType';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();
const dqPropertyName = 'defendantUploadDocuments';

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocuments>) {
  const latestUploadUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);
  const claim = await getCaseDataFromStore(claimId);
  const claimantFullName = claim.getClaimantFullName();
  const defendantFullName = claim.getDefendantFullName();
  const isFastTrack = claim.isFastTrackClaim;
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  claimId = caseNumberPrettify(claimId);

  res.render(typeOfDocumentsViewPath, {form,
    claimId,claimantFullName,defendantFullName, latestUploadUrl, isFastTrack, isSmallClaims,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const documentsList = await getDocuments(claimId,ClaimantOrDefendant.DEFENDANT);
      const form = new GenericForm(documentsList);
      req.session.previousUrl = req.originalUrl;
      await renderView(res, claimId,form);
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const typeDocumentList= getTypeDocumentForm(req);
    const form = new GenericForm(typeDocumentList);

    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claimId,form);
    } else {
      await saveCaseProgression(claimId, form.model, dqPropertyName);
      await deleteUntickedDocumentsFromStore(claimId, ClaimantOrDefendant.DEFENDANT);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);
export default typeOfDocumentsController;
