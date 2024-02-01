import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_TOTAL_URL,
  CLAIM_INTEREST_TYPE_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import InterestClaimOption from '../../../../common/form/models/claim/interest/interestClaimOption';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';

const interestTypeController = Router();
const interestTypeViewPath = 'features/claim/interest/interest-type';
const propertyName = 'interestClaimOptions';

function renderView(form: GenericForm<InterestClaimOption>, res: Response) {
  res.render(interestTypeViewPath, {form});
}

interestTypeController.get(CLAIM_INTEREST_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.session?.user?.id;
  try {
    const interest = await getInterest(claimId);
    renderView(new GenericForm(new InterestClaimOption(interest.interestClaimOptions)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

interestTypeController.post(CLAIM_INTEREST_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session?.user?.id;
    const interestTypeForm = new GenericForm(new InterestClaimOption(req.body.interestType));
    interestTypeForm.validateSync();

    if (interestTypeForm.hasErrors()) {
      renderView(interestTypeForm, res);
    } else {
      await saveInterest(claimId, interestTypeForm.model.interestType, propertyName);
      if (interestTypeForm.model.interestType == InterestClaimOptionsType.SAME_RATE_INTEREST) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_INTEREST_RATE_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_INTEREST_TOTAL_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default interestTypeController;
