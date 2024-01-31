import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {documentIdExtractor} from 'common/utils/stringUtils';

const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';

export const getViewTrialArrangements = (isOtherParty: boolean, claim: Claim) => {
  const viewTrialArrangementsTitle = isOtherParty
    ? `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`
    : `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`;

  const viewTrialArrangementsParagraph = isOtherParty
    ? `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`
    : `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`;

  const isClaimant = claim.isClaimant();
  const claimantTrialArrangementsDocument = claim.caseProgression.claimantTrialArrangements?.trialArrangementsDocument;
  const defendantTrialArrangementsDocument = claim.caseProgression.defendantTrialArrangements?.trialArrangementsDocument;
  let documentId;
  if (isClaimant) {
    documentId = isOtherParty ? documentIdExtractor(defendantTrialArrangementsDocument?.value.documentLink.document_binary_url)
      : documentIdExtractor(claimantTrialArrangementsDocument?.value.documentLink.document_binary_url);
  } else {
    documentId = isOtherParty ? documentIdExtractor(claimantTrialArrangementsDocument?.value.documentLink.document_binary_url)
      : documentIdExtractor(defendantTrialArrangementsDocument?.value.documentLink.document_binary_url);
  }

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(viewTrialArrangementsTitle)
    .addParagraph(viewTrialArrangementsParagraph)
    .addButtonOpensNewTab(`${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`, CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', documentId));
  return latestUpdateSectionBuilder.build();
};
