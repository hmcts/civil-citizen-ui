import {NextFunction, RequestHandler, Router, Response} from 'express';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CASE_DOCUMENT_DOWNLOAD_URL, DASHBOARD_CLAIMANT_URL, OLD_DASHBOARD_CLAIMANT_URL} from '../../urls';
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
import {isCUIReleaseTwoEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimantClaimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimantClaimSummaryController.get(OLD_DASHBOARD_CLAIMANT_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const isCUIR2Enable = await isCUIReleaseTwoEnabled();
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
    if (claim && !claim.isEmpty() && !isCUIR2Enable) {
      await saveDocumentsToExistingClaim(generateRedisKey(req), claim);
      const tabContent = await getTabs(claim, lang);
      const responseDetailsUrl = claim.getDocumentDetails(DocumentType.CLAIMANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.CLAIMANT_DEFENCE)) : undefined;
      res.render(claimSummaryViewPath, {claim, claimId, tabContent, responseDetailsUrl});
    }else{
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function getTabs(claim: Claim, lang: string): Promise<TabItem[]>
{
  const tabItems = [] as TabItem[];
  const claimId= claim.id;
  const latestUpdateContent = getLatestUpdateContentForClaimant(claim, lang);

  const noticesContent: ClaimSummaryContent[] = await getDocumentsContent(claim, claimId, lang);

  tabItems.push(new TabItem(TabLabel.LATEST_UPDATE, TabId.LATEST_UPDATE, latestUpdateContent));
  tabItems.push(new TabItem(TabLabel.DOCUMENTS,  TabId.DOCUMENTS, noticesContent));

  return tabItems;
}

export default claimantClaimSummaryController;
