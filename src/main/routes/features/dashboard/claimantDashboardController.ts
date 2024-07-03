import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  BREATHING_SPACE_INFO_URL,
  DASHBOARD_CLAIMANT_URL,
  DATE_PAID_URL,
  OLD_DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {
  extractOrderDocumentIdFromNotification,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {CaseState} from 'common/form/models/claimDetails';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isCUIReleaseTwoEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {t} from 'i18next';
import {isCarmApplicableAndSmallClaim, isCarmEnabledForCase} from 'common/utils/carmToggleUtils';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const HearingUploadDocuments = 'Upload hearing documents';

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId =  req.params.id;
    let claimIdPrettified;
    let claimAmountFormatted;
    const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
    if (isCUIR2Enabled){
      const lng = req.query.lang ? req.query.lang : req.cookies.lang;
      let claim: Claim;
      let caseRole: ClaimantOrDefendant;
      let dashboardId;

      if(claimId === 'draft') {
        caseRole = ClaimantOrDefendant.CLAIMANT;
        const userId = (<AppRequest>req)?.session?.user?.id.toString();
        claim = await getClaimById(userId, req);
        dashboardId = userId;
      } else {
        claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
        caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
        dashboardId = claimId;
        claimIdPrettified = caseNumberPrettify(claimId);
        claimAmountFormatted = currencyFormatWithNoTrailingZeros(claim.totalClaimAmount);
      }
      const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
      const isCarmApplicable = isCarmApplicableAndSmallClaim(carmEnabled, claim);
      const dashboardNotifications = await getNotifications(dashboardId, claim, caseRole, req, lng);
      claim.orderDocumentId = extractOrderDocumentIdFromNotification(dashboardNotifications);
      const dashboard = await getDashboardForm(caseRole, claim, dashboardId, req, isCarmApplicable);
      const [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] = getSupportLinks(claim, claimId, lng);
      const hearing = dashboard?.items[2]?.tasks ? dashboard?.items[2]?.tasks : [];
      hearing.forEach((task) => {
        if (task.taskNameEn.search(HearingUploadDocuments)>0){
          req.session.dashboard = {taskIdHearingUploadDocuments:undefined};
          req.session.dashboard.taskIdHearingUploadDocuments = task.id;
        }
      });

      res.render(claimantDashboardViewPath, {
        claim: claim,
        claimId,
        claimIdPrettified,
        claimAmountFormatted,
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

const getSupportLinks = (claim: Claim, claimId: string, lng: string) => {
  const showTellUsEndedLink = claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT ||
    claim.ccdState === CaseState.AWAITING_APPLICANT_INTENTION ||
    claim.ccdState === CaseState.IN_MEDIATION ||
    claim.ccdState === CaseState.JUDICIAL_REFERRAL ||
    claim.ccdState === CaseState.CASE_PROGRESSION ||
    claim.ccdState === CaseState.HEARING_READINESS ||
    claim.ccdState === CaseState.PREPARE_FOR_HEARING_CONDUCT_HEARING ||
    claim.ccdState === CaseState.DECISION_OUTCOME;

  const showGetDebtRespiteLink = claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT ||
    claim.ccdState === CaseState.AWAITING_APPLICANT_INTENTION ||
    claim.ccdState === CaseState.IN_MEDIATION ||
    claim.ccdState === CaseState.JUDICIAL_REFERRAL ||
    claim.ccdState === CaseState.PROCEEDS_IN_HERITAGE_SYSTEM ||
    claim.ccdState === CaseState.CASE_PROGRESSION ||
    claim.ccdState === CaseState.HEARING_READINESS ||
    claim.ccdState === CaseState.PREPARE_FOR_HEARING_CONDUCT_HEARING ||
    claim.ccdState === CaseState.DECISION_OUTCOME ||
    claim.ccdState === CaseState.All_FINAL_ORDERS_ISSUED;

  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO', { lng });
  const iWantToLinks = [];
  if (claim.ccdState && !claim.isCaseIssuedPending()) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', { lng }), url: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL) });
  }
  if (showTellUsEndedLink) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.TELL_US_ENDED', { lng }), url: constructResponseUrlWithIdParams(claimId, DATE_PAID_URL) });
  }
  if (showGetDebtRespiteLink && claim.isClaimant()) {
    iWantToLinks.push({ text: t('PAGES.DASHBOARD.SUPPORT_LINKS.GET_DEBT_RESPITE', { lng }), url: constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL) });
  }

  const helpSupportTitle = getHelpSupportTitle(lng);
  const helpSupportLinks = getHelpSupportLinks(lng);

  return [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] as const;
};

export default claimantDashboardController;
