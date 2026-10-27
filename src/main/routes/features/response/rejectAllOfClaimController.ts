import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CITIZEN_REJECT_ALL_CLAIM_URL, RESPONSE_TASK_LIST_URL, SEND_RESPONSE_BY_EMAIL_URL} from '../../urls';
import {getRejectAllOfClaim, saveRejectAllOfClaim} from 'services/features/response/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const rejectAllOfClaimViewPath = 'features/response/reject-all-of-claim';
const rejectAllOfClaimController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectAllOfClaimController');

rejectAllOfClaimController.get(CITIZEN_REJECT_ALL_CLAIM_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq = <AppRequest>req;
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(appReq, caseId);
    const form = new GenericForm(await getRejectAllOfClaim(appReq));
    res.render(rejectAllOfClaimViewPath, {
      form,
      rejectAllOfClaimType: RejectAllOfClaimType,
      claimantName: claim.getClaimantFullName(),
    });
  } catch (error) {
    logger.error(`Error when getting rejecting all claims -  ${error.message}`);
    next(error);
  }
}) as RequestHandler);

rejectAllOfClaimController.post(CITIZEN_REJECT_ALL_CLAIM_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appReq = <AppRequest>req;
    const caseId = getRouteParam(req, 'id');
    const rejectAllOfClaim = new RejectAllOfClaim(req.body.option);
    const claim = await getResponseClaimById(appReq, caseId);
    const form = new GenericForm(rejectAllOfClaim);
    form.validateSync();
    if (form.hasErrors()) {
      logger.info(`form has error , caseId - ${caseId}`);
      res.render(rejectAllOfClaimViewPath, {
        form,
        rejectAllOfClaimType: RejectAllOfClaimType,
        claimantName: claim.getClaimantFullName(),
      });
    } else {
      logger.info(`form has no error , caseId - ${caseId}`);
      if (req.body.option === RejectAllOfClaimType.DISPUTE) {
        rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree();
        rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      }
      await saveRejectAllOfClaim(appReq, rejectAllOfClaim);
      if (req.body.option === RejectAllOfClaimType.COUNTER_CLAIM) {
        res.redirect(constructResponseUrlWithIdParams(caseId, SEND_RESPONSE_BY_EMAIL_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(caseId, RESPONSE_TASK_LIST_URL));
      }
    }
  } catch (error) {
    logger.error(`Error when posting rejecting all claims -  ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default rejectAllOfClaimController;
