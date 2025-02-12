import {Claim} from 'models/claim';
import {t} from 'i18next';
import {
  FinaliseYourTrialSectionBuilder,
} from 'common/models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getHearingDurationAndOtherInformation = (claimId:string, claim: Claim, lng: string) => {

  return new FinaliseYourTrialSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addTitle('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_TITLE')
    .addParagraphWithHTML(t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TRIAL_DURATION_PARAGRAPH', {lng, hearingDuration: HearingDurationFormatter.formatHearingDuration(claim.caseProgressionHearing, lng)}))
    .addParagraph('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_LESS_TIME')
    .addInsetText('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.REQUIRE_MORE_TIME')
    .addTitle('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .build();
};
