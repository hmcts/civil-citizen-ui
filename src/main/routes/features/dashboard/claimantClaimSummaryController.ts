import {NextFunction, Router} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CASE_DOCUMENT_DOWNLOAD_URL, DASHBOARD_CLAIMANT_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getDocumentsContent } from 'services/features/dashboard/claimSummaryService';
import {
  getLatestUpdateContentForClaimant,
} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {TabItem} from 'models/dashboard/tabItem';
import {TabId, TabLabel} from 'routes/tabs';
import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {DocumentType} from 'common/models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'common/models/document/systemGeneratedCaseDocuments';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimantClaimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimantClaimSummaryController.get([DASHBOARD_CLAIMANT_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      await saveDocumentsToExistingClaim(generateRedisKey(<AppRequest>req), claim);
      const tabContent = await getTabs(claimId, claim, lang);
      const responseDetailsUrl = claim.getDocumentDetails(DocumentType.CLAIMANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.CLAIMANT_DEFENCE)) : undefined;
      res.render(claimSummaryViewPath, {claim, claimId, tabContent, responseDetailsUrl});
    }
  } catch (error) {
    next(error);
  }
});

async function getTabs(claimId: string, claim: Claim, lang: string): Promise<TabItem[]>
{
  const tabItems = [] as TabItem[];
  
  const latestUpdateTabLabel = TabLabel.LATEST_UPDATE;
  const latestUpdateTabId = TabId.LATEST_UPDATE;
  const latestUpdateContent = getLatestUpdateContentForClaimant(claimId, claim, lang);

  const noticesTabLabel= TabLabel.DOCUMENTS;
  const noticesTabId = TabId.DOCUMENTS;
  const noticesContent: ClaimSummaryContent[] = await getDocumentsContent(claim, claimId, lang);

  tabItems.push(new TabItem(latestUpdateTabLabel, latestUpdateTabId, latestUpdateContent));
  tabItems.push(new TabItem(noticesTabLabel, noticesTabId, noticesContent));

  return tabItems;
}

export default claimantClaimSummaryController;
