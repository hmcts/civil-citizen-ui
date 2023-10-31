import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {
  buildFastTrackHearingRequirements,
} from 'services/features/common/buildFastTrackHearingRequirements';
import {
  buildSmallClaimHearingRequirements,
} from 'services/features/common/buildSmallClaimHearingRequirements';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {buildCommonHearingRequirements} from 'services/features/common/buildCommonHearingRequirements';

export const buildHearingRequirementsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  return buildHearingRequirementsSectionCommon(claim, claimId, lang, claim.directionQuestionnaire);
};

export const buildHearingRequirementsSectionCommon = (claim: Claim, claimId: string, lang: string | unknown, directionQuestionnaire: DirectionQuestionnaire): SummarySection => {
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

  if (claim.isFastTrackClaim) {
    buildFastTrackHearingRequirements(claim, hearingRequirementsSection, claimId, lng,directionQuestionnaire);
  } else {
    buildSmallClaimHearingRequirements(claim, hearingRequirementsSection, claimId, lng,directionQuestionnaire);
  }

  buildCommonHearingRequirements(claim, hearingRequirementsSection, claimId, lng,directionQuestionnaire);

  return hearingRequirementsSection;
};
