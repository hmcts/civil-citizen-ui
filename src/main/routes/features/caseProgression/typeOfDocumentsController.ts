import {NextFunction, Response, Router} from 'express';
import {TYPES_OF_DOCUMENTS_URL, UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {getDocuments, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {ClaimantOrDefendant} from 'models/partyType';
import {UploadDocuments} from 'form/models/caseProgression/uploadDocumentstype';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();
const dqPropertyName = 'DefendantUploadDocuments';

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocuments>) {
  const claim = await getCaseDataFromStore(claimId);
  const claimantFullName = claim.getClaimantFullName();
  const defendantFullName = claim.getDefendantFullName();
  res.render(typeOfDocumentsViewPath, {form:new GenericForm(new Claim()),
    claimId,claimantFullName,defendantFullName,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const documentslist = await getDocuments(req.params.id,ClaimantOrDefendant.DEFENDANT);

      const form = new GenericForm(documentslist);
      renderView(res, claimId,form);
    } catch (error) {
      next(error);
    }
  });

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const documentslist = await getDocuments(claimId,ClaimantOrDefendant.DEFENDANT);
    const form = new GenericForm(documentslist);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(res, claimId,form);
    } else {
      saveCaseProgression(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default typeOfDocumentsController;
