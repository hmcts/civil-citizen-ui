import {NextFunction, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CASE_DOCUMENT_DOWNLOAD_URL, DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  isCUIReleaseTwoEnabled,
  isCaseProgressionV1Enable, isDashboardServiceEnabled,
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
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {extractOrderDocumentIdFromNotification, getDashboardForm, getHelpSupportLinks, getHelpSupportTitle, getNotifications} from 'services/dashboard/dashboardService';
import {getClaimWithExtendedPaymentDeadline} from 'services/features/response/submitConfirmation/submitConfirmationService';
import {ClaimantOrDefendant} from 'models/partyType';
import {isCarmApplicableAndSmallClaim, isCarmEnabledForCase} from 'common/utils/carmToggleUtils';
import {t} from 'i18next';
import {applicationNoticeUrl} from 'common/utils/externalURLs';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryRedesignViewPath = 'features/dashboard/claim-summary-redesign';

const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get(DEFENDANT_SUMMARY_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

    const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
    const isDashboardService = await isDashboardServiceEnabled();
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (isReleaseTwoEnabled && isDashboardService) {
      const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
      const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
      const isCarmApplicable = isCarmApplicableAndSmallClaim(carmEnabled, claim);
      const dashboardNotifications = await getNotifications(claimId, claim, caseRole, req as AppRequest, lang);
      claim.orderDocumentId = extractOrderDocumentIdFromNotification(dashboardNotifications);
      const dashboardTaskList = await getDashboardForm(caseRole, claim, claimId, req as AppRequest, isCarmApplicable);
      const [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] = getSupportLinks(lang);
      const claimIdPrettified = caseNumberPrettify(claimId);
      const claimAmountFormatted = currencyFormatWithNoTrailingZeros(claim.totalClaimAmount);

      if (dashboardTaskList.items[2]?.tasks[1]?.taskNameEn.search(t('PAGES.DASHBOARD.HEARINGS.UPLOAD_DOCUMENTS'))){
        req.session.dashboard = {taskIdHearingUploadDocuments:undefined};
        req.session.dashboard.taskIdHearingUploadDocuments = dashboardTaskList.items[2]?.tasks[1]?.id;
      }
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

const getSupportLinks = (lng: string) => {
  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO', { lng });
  const iWantToLinks = [
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', { lng }), url: applicationNoticeUrl },
  ];
  const helpSupportTitle = getHelpSupportTitle(lng);
  const helpSupportLinks = getHelpSupportLinks(lng);

  return [iWantToTitle, iWantToLinks, helpSupportTitle, helpSupportLinks] as const;
};

async function getTabs(claimId: string, claim: Claim, lang: string, respondentPaymentDeadline?: Date): Promise<TabItem[]>
{
  const caseProgressionEnabled = await isCaseProgressionV1Enable();
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

  if(caseProgressionEnabled && claim.hasSdoOrderDocument()) {
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

  if (caseProgressionEnabled && claim.hasSdoOrderDocument()) {
    tabItems.push(new TabItem(evidenceUploadTabLabel, evidenceUploadTabId, evidenceUploadContent));
  }

  if(caseProgressionEnabled && bundleAvailable) {
    const bundleTabLabel = TabLabel.BUNDLES;
    const bundleTabId = TabId.BUNDLES;
    const bundleTabContent = getBundlesContent(claimId, claim, lang);

    tabItems.push(new TabItem(bundleTabLabel, bundleTabId, bundleTabContent));
  }

  return tabItems;
}

export default claimSummaryController;
