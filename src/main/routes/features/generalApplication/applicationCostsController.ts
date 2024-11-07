import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_APPLICATION_COSTS_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_UPLOAD_N245_FORM_URL, INFORM_OTHER_PARTIES_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  ApplicationTypeOption, ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import { getApplicationCostsContent } from 'services/features/generalApplication/applicationCostsService';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {queryParamNumber} from 'common/utils/requestUtils';

const applicationCostsController = Router();
const viewPath = 'features/generalApplication/application-costs';
const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT];

async function renderView(claim: Claim, req: AppRequest, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationTypes = claim.generalApplication?.applicationTypes;
  const index  = queryParamNumber(req, 'index') || applicationTypes.length - 1;
  const selectedAppType = applicationTypes[applicationTypes.length - 1]?.option;
  const applicationType = getApplicationTypeOptionByTypeAndDescription(selectedAppType, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
  const gaFeeData = await gaApplicationFeeDetails(claim, req);
  const nextPageUrl = getRedirectUrl(req.params.id, claim, selectedAppType, index);
  const applicationCostsContent = getApplicationCostsContent(applicationTypes, gaFeeData, lang);
  const backLinkUrl = getBackUrl(req.params.id, claim, selectedAppType, index);
  res.render(viewPath, { backLinkUrl, nextPageUrl, applicationType, applicationCostsContent });
}

applicationCostsController.get(GA_APPLICATION_COSTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    await renderView(claim, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(claimId: string, claim: Claim, option: ApplicationTypeOption, index: number) {
  return (!claim.isClaimant() && option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) ?
    constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL),index) : constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL), index);
}

function getBackUrl(claimId: string, claim: Claim, applicationTypeOption: ApplicationTypeOption, index:number) {
  return (claim.generalApplication.agreementFromOtherParty === YesNo.YES || options.indexOf(applicationTypeOption) !== -1) ?
    constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL),index) : constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, INFORM_OTHER_PARTIES_URL), index);
}

export default applicationCostsController;
