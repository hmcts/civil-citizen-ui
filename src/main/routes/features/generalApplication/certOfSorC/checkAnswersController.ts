import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_COSC_CONFIRM_URL,BACK_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl, saveStatementOfTruth} from 'services/features/generalApplication/generalApplicationService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getCoScSummarySections} from 'services/features/generalApplication/checkAnswers/checkAnswersService';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {submitCoScApplication} from 'services/features/generalApplication/submitApplication';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

const coscCheckAnswersController = Router();
const viewPath = 'features/generalApplication/check-answers';

async function renderView(claimId: string, claim: Claim, form: GenericForm<StatementOfTruthForm>, req: AppRequest, res: Response): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const claimIdPrettified = caseNumberPrettify(claimId);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summaryRows = getCoScSummarySections(claimId, claim, lang);
  const headerTitle = 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT';

  const backLinkUrl = BACK_URL;
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle, claimIdPrettified, claim, summaryRows });
}

coscCheckAnswersController.get(GA_CHECK_YOUR_ANSWERS_COSC_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const statementOfTruthForm = claim.generalApplication?.statementOfTruth || new StatementOfTruthForm();
    const form = new GenericForm(statementOfTruthForm);
    await renderView(claimId, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

coscCheckAnswersController.post(GA_CHECK_YOUR_ANSWERS_COSC_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const statementOfTruth = new StatementOfTruthForm(req.body.signed, req.body.name);
    const applicationFee = convertToPoundsFilter(claim?.generalApplication?.applicationFee?.calculatedAmountInPence);
    const form = new GenericForm(new StatementOfTruthForm(req.body.signed, req.body.name));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, req, res);
    } else {
      await saveStatementOfTruth(redisKey, statementOfTruth);
      const claimResponse = await submitCoScApplication(req);
      const genApps = claimResponse.generalApplications;
      const genAppId = genApps ? genApps[genApps.length - 1].id : undefined;
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(getRedirectUrl(claimId, claim, applicationFee,genAppId));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(claimId: string, claim: Claim, applicationFee: number,genAppId: string ): string {
  return constructResponseUrlWithIdParams(claimId, GA_COSC_CONFIRM_URL)+ '?appFee='+ applicationFee + `&id=${genAppId}`;
}
export default coscCheckAnswersController;
