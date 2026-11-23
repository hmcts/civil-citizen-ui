import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {
  buildSystemGeneratedCaseDocumentUrl,
  getSystemGeneratedCaseDocumentIdByType,
} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {Claim} from 'models/claim';

const VIEW_ORDER = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER';

export const getViewFinalGeneralOrder = (claim: Claim):  ClaimSummarySection[] => {
  const title = `${VIEW_ORDER}.TITLE`;
  const judgeHasMadeOrder = `${VIEW_ORDER}.JUDGE_HAS_MADE_ORDER`;
  const orderIsAvailable = `${VIEW_ORDER}.ORDER_IS_AVAILABLE`;
  const viewOrderText = `${VIEW_ORDER}.VIEW_ORDER`;
  const viewOrderHref = buildSystemGeneratedCaseDocumentUrl(
    claim.id,
    getSystemGeneratedCaseDocumentIdByType(claim.caseProgression.finalOrderDocumentCollection, DocumentType.JUDGE_FINAL_ORDER),
    CASE_DOCUMENT_VIEW_URL,
  );

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(title)
    .addParagraph(judgeHasMadeOrder)
    .addParagraph(orderIsAvailable);

  if (viewOrderHref) {
    latestUpdateSectionBuilder.addButtonOpensNewTab(`${viewOrderText}`, viewOrderHref);
  } else {
    latestUpdateSectionBuilder.addParagraph('COMMON.DOCUMENT_NOT_AVAILABLE_YET');
  }
  return latestUpdateSectionBuilder.build();
};
