import {Claim} from 'models/claim';
import {t} from 'i18next';
import {
  FinaliseYourTrialSectionBuilder,
} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';

export const getHearingDurationAndOtherInformation = (claim: Claim, caseIdPrettified?: string) => {
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(t('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.TITLE'))
    .addLeadParagraph(t('COMMON.CLAIM_NUMBER')+': {{claimId}}', {claimId: caseIdPrettified}, 'govuk-!-margin-bottom-0')
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.HEARING_DURATION_TITLE')
    .addParagraphWithHTML(t('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.HEARING_DURATION_PARAGRAPH', {hearingDuration: claim.caseProgressionHearing.getHearingDurationFormatted()}))
    .addParagraph('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_LESS_TIME')
    .addInsetText('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_MORE_TIME')
    .addTitle('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .build();
};
