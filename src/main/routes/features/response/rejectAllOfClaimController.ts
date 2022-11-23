import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_REJECT_ALL_CLAIM_URL, CLAIM_TASK_LIST_URL, SEND_RESPONSE_BY_EMAIL_URL} from '../../urls';
import {getRejectAllOfClaim, saveRejectAllOfClaim} from '../../../services/features/response/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';

const rejectAllOfClaimViewPath = 'features/response/reject-all-of-claim';
const rejectAllOfClaimController = Router();

rejectAllOfClaimController.get(CITIZEN_REJECT_ALL_CLAIM_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(await getRejectAllOfClaim(claimId));
    res.render(rejectAllOfClaimViewPath, {
      form,
      rejectAllOfClaimType: RejectAllOfClaimType,
      claimantName: claim.getClaimantName(),
    });
  } catch (error) {
    next(error);
  }
});

rejectAllOfClaimController.post(CITIZEN_REJECT_ALL_CLAIM_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const rejectAllOfClaim = new RejectAllOfClaim(req.body.option);
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(rejectAllOfClaim);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(rejectAllOfClaimViewPath, {
        form,
        rejectAllOfClaimType: RejectAllOfClaimType,
        claimantName: claim.getClaimantName(),
      });
    } else {
      if (req.body.option === RejectAllOfClaimType.DISPUTE) {
        rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree();
        rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      }
      await saveRejectAllOfClaim(claimId, rejectAllOfClaim);
      if (req.body.option === RejectAllOfClaimType.COUNTER_CLAIM) {
        res.redirect(constructResponseUrlWithIdParams(claimId, SEND_RESPONSE_BY_EMAIL_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default rejectAllOfClaimController;
