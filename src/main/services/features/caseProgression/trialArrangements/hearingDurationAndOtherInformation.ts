import {Claim} from 'models/claim';
import {t} from 'i18next';
import {
  FinaliseYourTrialSectionBuilder,
} from 'common/models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';

export const getHearingDurationAndOtherInformation = (claim: Claim, caseIdPrettified?: string) => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TITLE'))
    .addLeadParagraph(t('COMMON.CLAIM_NUMBER')+': {{claimId}}', {claimId: caseIdPrettified}, 'govuk-!-margin-bottom-0')
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_TITLE')
    .addParagraphWithHTML(t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_PARAGRAPH', {hearingDuration: HearingDurationFormatter.formatHearingDuration(claim.caseProgressionHearing.hearingDuration)}))
    .addParagraph('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_LESS_TIME')
    .addInsetText('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_MORE_TIME')
    .addTitle('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .build();
};
