import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

const VIEW_ORDER = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER';

export const getViewFinalGeneralOrder = ():  ClaimSummarySection[] => {
  const title = `${VIEW_ORDER}.TITLE`;
  const judgeHasMadeOrder = `${VIEW_ORDER}.JUDGE_HAS_MADE_ORDER`;
  const orderIsAvailable = `${VIEW_ORDER}.ORDER_IS_AVAILABLE`;
  const viewOrderText = `${VIEW_ORDER}.VIEW_ORDER`;
  const viewOrderHref = 'href'; // TODO - add a correct URL once CIV-9958 is finished

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(title)
    .addParagraph(judgeHasMadeOrder)
    .addParagraph(orderIsAvailable)
    .addButton(viewOrderText, viewOrderHref);
  return latestUpdateSectionBuilder.build();
};
