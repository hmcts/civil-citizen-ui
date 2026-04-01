import {NextFunction, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import { CASE_DOCUMENT_DOWNLOAD_URL, DEFENDANT_SUMMARY_URL } from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  isDashboardEnabledForCase,
  isCarmEnabledForCase,
  isGaForLipsEnabled,
  isQueryManagementEnabled, isWelshEnabledForMainCase,
} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {
  getCaseProgressionLatestUpdates,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {TabItem} from 'models/dashboard/tabItem';
import {TabId, TabLabel} from 'routes/tabs';
import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {DocumentType} from 'common/models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'common/models/document/systemGeneratedCaseDocuments';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';
import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {
  generateRedisKey,
  updateFieldDraftClaimFromStore,
} from 'modules/draft-store/draftStoreService';
import {extractOrderDocumentIdFromNotification, getContactCourtLink, getDashboardForm, getHelpSupportLinks, getHelpSupportTitle, getNotifications} from 'services/dashboard/dashboardService';
import {getClaimWithExtendedPaymentDeadline} from 'services/features/response/submitConfirmation/submitConfirmationService';
import {ClaimantOrDefendant} from 'models/partyType';
import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';
import {t} from 'i18next';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import { iWantToLinks } from 'common/models/dashboard/iWantToLinks';
import { getViewAllApplicationLink } from 'services/features/generalApplication/generalApplicationService';
import {getViewMessagesLink} from 'services/features/queryManagement/viewMessagesService';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryRedesignViewPath = 'features/dashboard/claim-summary-redesign';

const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const HearingUploadDocuments = 'Upload hearing documents';
const ResponseClaimTrack = 'responseClaimTrack';

claimSummaryController.get(DEFENDANT_SUMMARY_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const isDashboardEnabled = await isDashboardEnabledForCase(claim.submittedDate);
    const isGAFlagEnable = await isGaForLipsEnabled();

    if (isDashboardEnabled) {
      const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
      const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
      const isCarmApplicable = isCarmApplicableAndSmallClaim(carmEnabled, claim);
      const totalAmountWithInterestAndFees = (await getTotalAmountWithInterestAndFees(claim)).toString();
      const dashboardNotifications = await getNotifications(claimId, claim, totalAmountWithInterestAndFees, caseRole, req as AppRequest, lang);
      claim.orderDocumentId = extractOrderDocumentIdFromNotification(dashboardNotifications);
      const dashboardTaskList = await getDashboardForm(caseRole, claim, totalAmountWithInterestAndFees, claimId, req as AppRequest, isCarmApplicable, isGAFlagEnable);
      const [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] = await getSupportLinks(req, claim, lang, claimId, isGAFlagEnable);
      const claimIdPrettified = caseNumberPrettify(claimId);
      const claimAmountFormatted = currencyFormatWithNoTrailingZeros(claim.totalClaimAmount);
      const isQMFlagEnabled = await isQueryManagementEnabled(claim.submittedDate);
      await updateFieldDraftClaimFromStore(claimId, <AppRequest>req, ResponseClaimTrack, claim.responseClaimTrack?.toString());

      const hearing = dashboardTaskList?.items[2]?.tasks ? dashboardTaskList?.items[2]?.tasks : [];
      hearing.forEach((task) => {
        if (task.taskNameEn.search(HearingUploadDocuments)>0){
          req.session.dashboard = {taskIdHearingUploadDocuments:undefined};
          req.session.dashboard.taskIdHearingUploadDocuments = task.id;
        }
      });
      const welshEnabled = await isWelshEnabledForMainCase();
      const showWelshPartyBanner = welshEnabled && claim.isAnyPartyBilingual();
      const showErrorAwaitingTranslation = welshEnabled && 'errorAwaitingTranslation' in req.query;
      res.render(claimSummaryRedesignViewPath,
        {
          claim,
          claimId,
          claimIdPrettified,
          claimAmountFormatted,
          dashboardTaskList,
          dashboardNotifications,
          iWantToTitle,
          iWantToLinks,
          helpSupportTitle,
          helpSupportLinks,
          lang,
          isQMFlagEnabled,
          showWelshPartyBanner,
          showErrorAwaitingTranslation,
        },
      );
    } else {
      // RELEASE 1
      if (claim && !claim.isEmpty()) {
        await saveDocumentsToExistingClaim(generateRedisKey(<AppRequest>req), claim);
        const respondentPaymentDeadline =  await getClaimWithExtendedPaymentDeadline(claim, <AppRequest>req);
        const tabContent = await getTabs(claimId, claim, lang, respondentPaymentDeadline);
        const responseDetailsUrl = claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)) : undefined;
        res.render(claimSummaryViewPath, {claim, claimId, tabContent, responseDetailsUrl});
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getSupportLinks = async (req: AppRequest, claim: Claim, lng: string, claimId: string, isGAFlagEnable: boolean, isGAlinkEnabled = false) => {
  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO', { lng });
  const iWantToLinks : iWantToLinks[] = [];

  iWantToLinks.push(await getContactCourtLink(claimId, claim, isGAFlagEnable, lng));

  const viewAllApplicationLink = await getViewAllApplicationLink(req, claim, isGAFlagEnable, lng);
  const viewMessages = await getViewMessagesLink(req, claim, lng);
  if(viewAllApplicationLink) {
    iWantToLinks.push(viewAllApplicationLink);
  }
  if (viewMessages) {
    iWantToLinks.push(viewMessages);
  }
  const helpSupportTitle = getHelpSupportTitle(lng);
  const helpSupportLinks = getHelpSupportLinks(lng);

  return [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] as const;
};

async function getTabs(claimId: string, claim: Claim, lang: string, respondentPaymentDeadline?: Date): Promise<TabItem[]>
{
  const bundleAvailable = claim.isBundleStitched();
  const tabItems = [] as TabItem[];

  let latestUpdateTabLabel = TabLabel.LATEST_UPDATE;
  let latestUpdateTabId = TabId.LATEST_UPDATE;
  let latestUpdateContent = getLatestUpdateContent(claimId, claim, lang, respondentPaymentDeadline);

  let noticesTabLabel= TabLabel.DOCUMENTS;
  let noticesTabId = TabId.DOCUMENTS;
  const noticesContent: ClaimSummaryContent[] = await getDocumentsContent(claim, claimId, lang);

  let evidenceUploadTabLabel: TabLabel;
  let evidenceUploadTabId: TabId;
  let evidenceUploadContent: ClaimSummaryContent[];

  if(claim.hasSdoOrderDocument()) {
    latestUpdateContent = getCaseProgressionLatestUpdates(claim, lang);

    latestUpdateTabLabel = TabLabel.UPDATES;
    latestUpdateTabId = TabId.UPDATES;

    noticesTabLabel = TabLabel.NOTICES;
    noticesTabId = TabId.NOTICES;

    evidenceUploadTabLabel = TabLabel.DOCUMENTS;
    evidenceUploadTabId = TabId.DOCUMENTS;
    evidenceUploadContent = getEvidenceUploadContent(claim, lang);
  }

  tabItems.push(new TabItem(latestUpdateTabLabel, latestUpdateTabId, latestUpdateContent));
  tabItems.push(new TabItem(noticesTabLabel, noticesTabId, noticesContent));

  if (claim.hasSdoOrderDocument()) {
    tabItems.push(new TabItem(evidenceUploadTabLabel, evidenceUploadTabId, evidenceUploadContent));
  }

  if(bundleAvailable) {
    const bundleTabLabel = TabLabel.BUNDLES;
    const bundleTabId = TabId.BUNDLES;
    const bundleTabContent = getBundlesContent(claimId, claim, lang);

    tabItems.push(new TabItem(bundleTabLabel, bundleTabId, bundleTabContent));
  }

  return tabItems;
}

export default claimSummaryController;
