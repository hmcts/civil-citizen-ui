import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {buildCaseDocumentViewUrl} from 'common/utils/formatDocumentURL';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import {Claim} from 'models/claim';

const VIEW_ORDER = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER';

export const getViewFinalGeneralOrder = (claim: Claim):  ClaimSummarySection[] => {
  const title = `${VIEW_ORDER}.TITLE`;
  const judgeHasMadeOrder = `${VIEW_ORDER}.JUDGE_HAS_MADE_ORDER`;
  const orderIsAvailable = `${VIEW_ORDER}.ORDER_IS_AVAILABLE`;
  const viewOrderText = `${VIEW_ORDER}.VIEW_ORDER`;
  const viewOrderHref = buildCaseDocumentViewUrl(claim.id, getHearingDocumentsCaseDocumentIdByType(claim.caseProgression.finalOrderDocumentCollection, DocumentType.JUDGE_FINAL_ORDER));

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(title)
    .addParagraph(judgeHasMadeOrder)
    .addParagraph(orderIsAvailable);
  if (viewOrderHref) {
    latestUpdateSectionBuilder.addButtonOpensNewTab(`${viewOrderText}`, viewOrderHref);
  }
  return latestUpdateSectionBuilder.build();
};
