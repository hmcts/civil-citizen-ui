import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {
  getViewFinalGeneralOrder,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewFinalGeneralOrderContent';

describe('test getViewFinalGeneralOrder method', () => {
  const VIEW_ORDER = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER';
  it('should have view final/general order content', () => {
    //Given
    const title = `${VIEW_ORDER}.TITLE`;
    const judgeHasMadeOrder = `${VIEW_ORDER}.JUDGE_HAS_MADE_ORDER`;
    const orderIsAvailable = `${VIEW_ORDER}.ORDER_IS_AVAILABLE`;
    const viewOrderText = `${VIEW_ORDER}.VIEW_ORDER`;
    const viewOrderHref = 'href'; // TODO - add a correct URL once CIV-9958 is finished

    const latestUpdateSectionBuilderExpected = new LatestUpdateSectionBuilder()
      .addTitle(title)
      .addParagraph(judgeHasMadeOrder)
      .addParagraph(orderIsAvailable)
      .addButton(viewOrderText, viewOrderHref)
      .build();

    //When
    const latestUpdateSectionBuilder = getViewFinalGeneralOrder();

    //Then
    expect(latestUpdateSectionBuilder).toEqual(latestUpdateSectionBuilderExpected);
  });
});
