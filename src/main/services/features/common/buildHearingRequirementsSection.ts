import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {
  buildHearingRequirementsForTrack,
} from 'services/features/common/buildFastTrackHearingRequirements';
import {
  buildSmallClaimHearingRequirements,
} from 'services/features/common/buildSmallClaimHearingRequirements';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {buildCommonHearingRequirements} from 'services/features/common/buildCommonHearingRequirements';

export const buildHearingRequirementsSection = (claim: Claim, claimId: string, lang: string, mintiApplicable: boolean ): SummarySection => {
  return buildHearingRequirementsSectionCommon(claim, claimId, lang, claim.directionQuestionnaire, mintiApplicable);
};

export const buildHearingRequirementsSectionCommon = (claim: Claim, claimId: string, lang: string, directionQuestionnaire: DirectionQuestionnaire, mintiApplicable: boolean): SummarySection => {
  const lng = getLng(lang);
  let hearingRequirementsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE', {lng}),
    summaryRows: [],
  });
  if (!claim.directionQuestionnaire) {
    hearingRequirementsSection = summarySection({
      title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_HEARING_REQUIREMENTS_TITLE', {lng}),
      summaryRows: [],
    });
  }

  const directionQuestionnaireObj = Object.assign(new DirectionQuestionnaire(), directionQuestionnaire);
  if (claim.isSmallClaimsTrackDQ) {
    buildSmallClaimHearingRequirements(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaireObj);
  } else {
    buildHearingRequirementsForTrack(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaireObj, mintiApplicable);
  }

  buildCommonHearingRequirements(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaireObj);

  return hearingRequirementsSection;
};
