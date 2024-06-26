import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CITIZEN_REJECT_ALL_CLAIM_URL, RESPONSE_TASK_LIST_URL, SEND_RESPONSE_BY_EMAIL_URL} from '../../urls';
import {getRejectAllOfClaim, saveRejectAllOfClaim} from 'services/features/response/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {AppRequest} from 'common/models/AppRequest';

const rejectAllOfClaimViewPath = 'features/response/reject-all-of-claim';
const rejectAllOfClaimController = Router();

rejectAllOfClaimController.get(CITIZEN_REJECT_ALL_CLAIM_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(await getRejectAllOfClaim(claimId));
    res.render(rejectAllOfClaimViewPath, {
      form,
      rejectAllOfClaimType: RejectAllOfClaimType,
      claimantName: claim.getClaimantFullName(),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

rejectAllOfClaimController.post(CITIZEN_REJECT_ALL_CLAIM_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const rejectAllOfClaim = new RejectAllOfClaim(req.body.option);
    const claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(rejectAllOfClaim);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(rejectAllOfClaimViewPath, {
        form,
        rejectAllOfClaimType: RejectAllOfClaimType,
        claimantName: claim.getClaimantFullName(),
      });
    } else {
      if (req.body.option === RejectAllOfClaimType.DISPUTE) {
        rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree();
        rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      }
      await saveRejectAllOfClaim(redisKey, rejectAllOfClaim);
      if (req.body.option === RejectAllOfClaimType.COUNTER_CLAIM) {
        res.redirect(constructResponseUrlWithIdParams(claimId, SEND_RESPONSE_BY_EMAIL_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default rejectAllOfClaimController;
