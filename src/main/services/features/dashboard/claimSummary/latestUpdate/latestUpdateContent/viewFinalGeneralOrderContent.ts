import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

export const getViewFinalGeneralOrder = ():  ClaimSummarySection[] => {
  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder();
  return latestUpdateSectionBuilder.build();
};
