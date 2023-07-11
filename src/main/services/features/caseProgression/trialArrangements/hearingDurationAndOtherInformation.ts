import {Claim} from 'models/claim';
import {t} from 'i18next';
import {
  FinaliseYourTrialSectionBuilder,
} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';

export const getHearingDurationAndOtherInformation = (claim: Claim, caseIdPrettified?: string) => {
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(t('PAGES.TRIAL_ARRANGEMENTS.TITLE'))
    .addLeadParagraph(t('COMMON.CLAIM_NUMBER')+': {{claimId}}', {claimId: caseIdPrettified})
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.TRIAL_ARRANGEMENTS.HEARING_DURATION_TITLE')
    .addParagraphWithHTML(t('PAGES.TRIAL_ARRANGEMENTS.HEARING_DURATION_PARAGRAPH', {hearingDuration: claim.caseProgressionHearing.getHearingDurationFormatted()}))
    .addParagraph('PAGES.TRIAL_ARRANGEMENTS.REQUIRE_LESS_TIME')
    .addInsetText('PAGES.TRIAL_ARRANGEMENTS.REQUIRE_MORE_TIME')
    .addTitle('PAGES.TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .build();
};
