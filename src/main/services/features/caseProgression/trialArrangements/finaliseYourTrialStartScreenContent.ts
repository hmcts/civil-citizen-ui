import {Claim} from 'models/claim';
import {
  CASE_DOCUMENT_DOWNLOAD_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  IS_CASE_READY_URL,
} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {FinaliseYourTrialSectionBuilder} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getFinaliseTrialArrangementContents = (claimId: string, claim: Claim) => {
  let defendantOrClaimant;
  let cancelUrl;

  if (claim?.isClaimant()) {
    defendantOrClaimant = DirectionQuestionnaireType.CLAIMANT;
    cancelUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claim.id);
  } else {
    defendantOrClaimant = DirectionQuestionnaireType.DEFENDANT;
    cancelUrl = DEFENDANT_SUMMARY_URL.replace(':id', claim.id);
  }

  return new FinaliseYourTrialSectionBuilder()
    .addMicroText('PAGES.FINALISE_TRIAL_ARRANGEMENTS.PAGE_TITLE')
    .addMainTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addWarning('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_HAVE_UNTIL_DATE',{hearingDueDate:claim.bundleStitchingDeadline})
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_FINALISE')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IS_THE_CASE_READY_FOR_TRIAL')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.DIRECTIONS_ORDER', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SDO_ORDER)),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_ARE_ASKING_YOU',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_HAVE_RECEIVED','', true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOUR_CASE_NOT_READY')
    .addCustomInsetText('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_NEED_TO_MAKE_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_AN_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.HEARING_ADJUSTMENTS_AND_DURATION')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.DIRECTIONS_QUESTIONNAIRE', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DIRECTIONS_QUESTIONNAIRE, defendantOrClaimant)),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_WILL_BE_ASKED',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_REVIEW','', true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_WILL_REMIND_YOU')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_FEEL_THAT')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TEXT')
    .addStartButtonWithLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.START_NOW', IS_CASE_READY_URL.replace(':id', claim.id), cancelUrl)
    .build();
};
