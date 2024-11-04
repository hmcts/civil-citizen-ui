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
  const directionQuestionnaire = Object.assign(new DirectionQuestionnaire(), claim.directionQuestionnaire);
  return buildHearingRequirementsSectionCommon(claim, claimId, lang, directionQuestionnaire, mintiApplicable);
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

  if (claim.isSmallClaimsTrackDQ) {
    buildSmallClaimHearingRequirements(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaire);
  } else {
    buildHearingRequirementsForTrack(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaire, mintiApplicable);
  }

  buildCommonHearingRequirements(claim, hearingRequirementsSection, claimId, lng, directionQuestionnaire);

  return hearingRequirementsSection;
};
