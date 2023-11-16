import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {addSupportRequiredListCommon} from 'services/features/common/addSupportRequiredList';

export const addSupportRequiredList = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {
  const directionQuestionnaire = claim.directionQuestionnaire;

  addSupportRequiredListCommon(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaire);
};

