import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {
  getViewFinalGeneralOrder,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewFinalGeneralOrderContent';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {CaseDocument} from 'models/document/caseDocument';
import {DocumentType} from 'models/document/documentType';
import {Document} from 'models/document/document';

describe('test getViewFinalGeneralOrder method', () => {
  const VIEW_ORDER = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER';
  it('should have view final/general order content', () => {
    //Given
    const title = `${VIEW_ORDER}.TITLE`;
    const judgeHasMadeOrder = `${VIEW_ORDER}.JUDGE_HAS_MADE_ORDER`;
    const orderIsAvailable = `${VIEW_ORDER}.ORDER_IS_AVAILABLE`;
    const viewOrderText = `${VIEW_ORDER}.VIEW_ORDER`;
    const viewOrderHref = '/case/1234/view-documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6'; // TODO - add a correct URL once CIV-9958 is finished
    const claim = new Claim();
    claim.id = '1234';
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.finalOrderDocumentCollection = [new FinalOrderDocumentCollection('hello', {documentType: DocumentType.JUDGE_FINAL_ORDER, documentLink: {document_binary_url: 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary'} as Document} as CaseDocument)];

    const latestUpdateSectionBuilderExpected = new LatestUpdateSectionBuilder()
      .addTitle(title)
      .addParagraph(judgeHasMadeOrder)
      .addParagraph(orderIsAvailable)
      .addButtonOpensNewTab(viewOrderText, viewOrderHref)
      .build();

    //When
    const latestUpdateSectionBuilder = getViewFinalGeneralOrder(claim);

    //Then
    expect(latestUpdateSectionBuilder).toEqual(latestUpdateSectionBuilderExpected);
  });
});
