import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DATE_PAID_URL, OLD_DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {CaseState} from 'common/form/models/claimDetails';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {t} from 'i18next';
import { 
  applicationNoticeUrl, 
  feesHelpUrl, 
  findCourtTribunalUrl, 
  findLegalAdviceUrl, 
  findOutMediationUrl, 
  getDebtRespiteUrl, 
  representYourselfUrl, 
  whatToExpectUrl,
} from '../../../../test/utils/externalURLs';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId =  req.params.id;
    const isDashboardEnabled = await isDashboardServiceEnabled();
    if (isDashboardEnabled){
      const lng = req.query.lang ? req.query.lang : req.cookies.lang;
      let claim: Claim;
      let caseRole: ClaimantOrDefendant;
      let dashboardId;

      if(claimId == 'draft') {
        caseRole = ClaimantOrDefendant.CLAIMANT;
        const userId = (<AppRequest>req)?.session?.user?.id.toString();
        claim = await getClaimById(userId, req);
        dashboardId = userId;
      } else {
        claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
        caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
        dashboardId = claimId;  
      }
      const dashboardNotifications = await getNotifications(dashboardId, claim, caseRole, req);
      const dashboard = await getDashboardForm(caseRole, claim, dashboardId, req);
      const [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] = getSupportLinks(claim, claimId);

      res.render(claimantDashboardViewPath, {
        claim: claim,
        claimId,
        dashboardTaskList: dashboard,
        dashboardNotifications,
        iWantToTitle,
        iWantToLinks,
        helpSupportTitle,
        helpSupportLinks,
        lng,
      });

    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getSupportLinks = (claim: Claim, claimId: string) => {
  const showTellUsEndedLink = claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT ||
    claim.ccdState === CaseState.AWAITING_APPLICANT_INTENTION ||
    claim.ccdState === CaseState.IN_MEDIATION ||
    claim.ccdState === CaseState.JUDICIAL_REFERRAL ||
    claim.ccdState === CaseState.CASE_PROGRESSION ||
    claim.ccdState === CaseState.HEARING_READINESS ||
    claim.ccdState === CaseState.PREPARE_FOR_HEARING_CONDUCT_HEARING ||
    claim.ccdState === CaseState.DECISION_OUTCOME;

  const showGetDebtRespiteLink = claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT ||
    claim.ccdState === CaseState.AWAITING_APPLICANT_INTENTION;

  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO');
  const iWantToLinks = [];

  if (claim.isDefendantNotResponded()) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT'), url: applicationNoticeUrl })
  }
  if (showTellUsEndedLink) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.TELL_US_ENDED'), url: constructResponseUrlWithIdParams(claimId, DATE_PAID_URL) })
  }
  if (showGetDebtRespiteLink) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.GET_DEBT_RESPITE'), url: getDebtRespiteUrl })
  }

  const helpSupportTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT');
  const helpSupportLinks = [
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES'), url: feesHelpUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION'), url: findOutMediationUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING'), url: whatToExpectUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF'), url: representYourselfUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE'), url: findLegalAdviceUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT'), url: findCourtTribunalUrl },
  ]
  return [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] as const;
};

export default claimantDashboardController;
