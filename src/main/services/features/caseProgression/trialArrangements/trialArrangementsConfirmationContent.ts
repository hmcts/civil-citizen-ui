import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {DEFENDANT_SUMMARY_TAB_URL, NOTICES_AND_ORDERS_URL} from 'routes/urls';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {TabId} from 'routes/tabs';

export function getConfirmationPageSection(claimId: string, claim: Claim, readyForTrialOrHearing: boolean): ClaimSummarySection[] {
  const title = 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT';
  const document = 'https://www.gov.uk/government/publications/form-n244-application-notice';
  const noticesAndOrdersLink = claim.isClaimant() ? NOTICES_AND_ORDERS_URL.replace(':id', claim.id) : DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES);

  if (readyForTrialOrHearing) {
    return new FinaliseYourTrialSectionBuilder()
      .addMainTitle(title)
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
        noticesAndOrdersLink,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
        document,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_THERE_ARE_ANY_CHANGES_TO_THE_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.AS_SOON_AS_POSSIBLE_AND_PAY',
        '',
        true)
      .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_PHONE')
      .build();
  }
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(title)
    .addWarning('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TRIAL_OR_HEARING_WILL_GO_AHEAD_AS_PLANNED')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
      document,
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_YOU_WANT_THE_DATE_OF_THE_HEARING',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TO_THE_COURT_AND_PAY',
      '',
      true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
      DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
    .build();
}
