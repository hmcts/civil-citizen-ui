import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_CHECK_ANSWERS_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
  GA_APPLICATION_SUBMITTED_URL, BACK_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl, getDynamicHeaderForMultipleApplications, saveStatementOfTruth} from 'services/features/generalApplication/generalApplicationService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getSummaryCardSections, getSummarySections} from 'services/features/generalApplication/checkAnswers/checkAnswersService';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {submitApplication} from 'services/features/generalApplication/submitApplication';
import {checkYourAnswersGAGuard} from 'routes/guards/checkYourAnswersGAGuard';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {YesNo} from 'form/models/yesNo';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

const gaCheckAnswersController = Router();
const viewPath = 'features/generalApplication/check-answers';

async function renderView(claimId: string, claim: Claim, form: GenericForm<StatementOfTruthForm>, req: AppRequest, res: Response): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const claimIdPrettified = caseNumberPrettify(claimId);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationTypeCards = getSummaryCardSections(claimId, claim, lang);
  const summaryRows = getSummarySections(claimId, claim, lang);
  const headerTitle = getDynamicHeaderForMultipleApplications(claim);
  const isBusiness = (claim.isClaimant() && claim.isClaimantBusiness()) || (claim.isDefendant() && claim.isBusiness());
  const backLinkUrl = BACK_URL;
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle, claimIdPrettified, claim, applicationTypeCards, summaryRows, isBusiness });
}

gaCheckAnswersController.get(GA_CHECK_ANSWERS_URL, checkYourAnswersGAGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
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

gaCheckAnswersController.post(GA_CHECK_ANSWERS_URL, checkYourAnswersGAGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    let statementOfTruth: StatementOfTruthForm | QualifiedStatementOfTruth;
    if ((claim.isClaimant() && claim.isClaimantBusiness()) || (claim.isDefendant() && claim.isBusiness())) {
      statementOfTruth = new QualifiedStatementOfTruth(req.body.signed, req.body.name, req.body.title);
    } else {
      statementOfTruth = new StatementOfTruthForm(req.body.signed, req.body.name);

    }
    const applicationFee = convertToPoundsFilter(claim?.generalApplication?.applicationFee?.calculatedAmountInPence);
    const form = new GenericForm(statementOfTruth);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, req, res);
      return;
    } else {
      await saveStatementOfTruth(redisKey, statementOfTruth);
      const claimResponse = await submitApplication(req);
      const genApps = claimResponse.generalApplications;
      const genAppId = genApps ? genApps[genApps.length - 1].id : undefined;
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(getRedirectUrl(claimId, claim, applicationFee,genAppId));
    }
  } catch (error) {
    next(error);
    return;
  }
}) as RequestHandler);

function getRedirectUrl(claimId: string, claim: Claim, applicationFee: number,genAppId: string ): string {
  if (claim.generalApplication?.applicationTypes?.length === 1 && claim.generalApplication.applicationTypes[0].option === ApplicationTypeOption.ADJOURN_HEARING
    && isWithConsent(claim)
    && hearingMoreThan14DaysInFuture(claim)) {
    return constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUBMITTED_URL);
  } else {
    return constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL)+ '?appFee='+ applicationFee + `&id=${genAppId}`;
  }
}

function isWithConsent(claim: Claim): boolean {
  return claim.generalApplication?.agreementFromOtherParty === YesNo.YES;
}

function hearingMoreThan14DaysInFuture(claim: Claim): boolean {
  const today = new Date();
  const hearingDate = claim.caseProgressionHearing?.hearingDate;
  const future = hearingDate && getNumberOfDaysBetweenTwoDays(today, hearingDate) > 14;
  return future;
}

export default gaCheckAnswersController;
