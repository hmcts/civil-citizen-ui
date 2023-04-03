import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {
  buildFastTrackHearingRequirements,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';
import {
  buildSmallClaimHearingRequirements,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildSmallClaimHearingRequirements';
import {
  buildCommonHearingRequirements,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildCommonHearingRequirements';

export const buildHearingRequirementsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const hearingRequirementsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE', {lng}),
    summaryRows: [],
  });

  if (claim.isFastTrackClaim) {
    buildFastTrackHearingRequirements(claim, hearingRequirementsSection, claimId, lng);
  } else {
    buildSmallClaimHearingRequirements(claim, hearingRequirementsSection, claimId, lng);
  }

  buildCommonHearingRequirements(claim, hearingRequirementsSection, claimId, lng);

  return hearingRequirementsSection;
};
