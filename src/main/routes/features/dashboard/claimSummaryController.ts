import {NextFunction, Router} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CASE_DOCUMENT_DOWNLOAD_URL, DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
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

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      await saveDocumentsToExistingClaim(claimId, claim);
      const tabContent = await getTabs(claimId, claim, lang);
      const responseDetailsUrl = claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)) : undefined;
      res.render(claimSummaryViewPath, {claim, claimId, tabContent, responseDetailsUrl});
    }
  } catch (error) {
    next(error);
  }
});

async function getTabs(claimId: string, claim: Claim, lang: string): Promise<TabItem[]>
{
  const caseProgressionEnabled = await isCaseProgressionV1Enable() && claim.hasCaseProgressionHearingDocuments();
  const bundleAvailable = claim.isBundleStitched();
  const tabItems = [] as TabItem[];

  let latestUpdateTabLabel = TabLabel.LATEST_UPDATE;
  let latestUpdateTabId = TabId.LATEST_UPDATE;
  let latestUpdateContent = getLatestUpdateContent(claimId, claim, lang);

  let noticesTabLabel= TabLabel.DOCUMENTS;
  let noticesTabId = TabId.DOCUMENTS;
  const noticesContent: ClaimSummaryContent[] = await getDocumentsContent(claim, claimId);

  let evidenceUploadTabLabel: TabLabel;
  let evidenceUploadTabId: TabId;
  let evidenceUploadContent: ClaimSummaryContent[];

  if(caseProgressionEnabled) {
    latestUpdateTabLabel = TabLabel.UPDATES;
    latestUpdateTabId = TabId.UPDATES;
    latestUpdateContent = getCaseProgressionLatestUpdates(claim, lang);

    noticesTabLabel = TabLabel.NOTICES;
    noticesTabId = TabId.NOTICES;

    evidenceUploadTabLabel = TabLabel.DOCUMENTS;
    evidenceUploadTabId = TabId.DOCUMENTS;
    evidenceUploadContent = getEvidenceUploadContent(claim);
  }

  tabItems.push(new TabItem(latestUpdateTabLabel, latestUpdateTabId, latestUpdateContent));
  tabItems.push(new TabItem(noticesTabLabel, noticesTabId, noticesContent));

  if (caseProgressionEnabled) {
    tabItems.push(new TabItem(evidenceUploadTabLabel, evidenceUploadTabId, evidenceUploadContent));
  }

  if(caseProgressionEnabled && bundleAvailable) {
    const bundleTabLabel = TabLabel.BUNDLES;
    const bundleTabId = TabId.BUNDLES;
    const bundleTabContent = getBundlesContent(claim);

    tabItems.push(new TabItem(bundleTabLabel, bundleTabId, bundleTabContent));
  }

  return tabItems;
}

export default claimSummaryController;
