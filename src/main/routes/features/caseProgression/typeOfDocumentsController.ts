import {NextFunction, Response, Router} from 'express';
import {TYPES_OF_DOCUMENTS_URL, UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();

function renderView(res: Response, claimId: string, claimantFullName: string, defendantFullName: string) {

  res.render(typeOfDocumentsViewPath, {form:new GenericForm(new Claim()),
    claimId,claimantFullName,defendantFullName,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(req.params.id);
      const claimantFullName = claim.getClaimantFullName();
      const defendantFullName = claim.getDefendantFullName();

      renderView(res, claimId, claimantFullName, defendantFullName);
    } catch (error) {
      next(error);
    }
  });

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    res.redirect(constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
  } catch (error) {
    next(error);
  }
});

export default typeOfDocumentsController;
