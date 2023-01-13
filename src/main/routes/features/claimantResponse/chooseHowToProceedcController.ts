import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';

const chooseHowToProceedViewPath = 'features/claimantResponse/choose-how-to-proceed';
const chooseHowToProceedController = Router();
const crPropertyName = 'option';
const crParentName = 'chooseHowToProceed';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(chooseHowToProceedViewPath, {form});
}

chooseHowToProceedController.get(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(req.params.id);
    renderView(new GenericForm(claimantResponse.chooseHowToProceed), res);
  } catch (error) {
    next(error);
  }
});

chooseHowToProceedController.post(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, async (req:Request, res:Response, next) => {
  try {
    const claimId = req.params.id;
    const claimantIntentionToProceed = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.SELECT_AN_OPTION'));
    claimantIntentionToProceed.validateSync();

    if (claimantIntentionToProceed.hasErrors()) {
      renderView(claimantIntentionToProceed, res);
    } else {
      await saveClaimantResponse(claimId, claimantIntentionToProceed.model.option, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default chooseHowToProceedController;
