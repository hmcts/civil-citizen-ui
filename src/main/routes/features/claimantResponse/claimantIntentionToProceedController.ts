import {Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../services/features/claimantResponse/claimantResponseService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const claimantIntentionToProceedController = Router();
const claimantIntentionToProceedViewPath = 'features/claimantResponse/claimant-intention-to-proceed';
const crPropertyName = 'option';
const crParentName = 'intentionToProceed';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(claimantIntentionToProceedViewPath, {form});
}

claimantIntentionToProceedController.get(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, async (req, res, next) => {
  try {
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm(claimantResponse.intentionToProceed), res);
  } catch (error) {
    next(error);
  }
});

claimantIntentionToProceedController.post(CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const claimantIntentionToProceed = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    claimantIntentionToProceed.validateSync();

    if (claimantIntentionToProceed.hasErrors()) {
      renderView(claimantIntentionToProceed, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), claimantIntentionToProceed.model.option, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIntentionToProceedController;
