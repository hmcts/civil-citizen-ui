import {Claim} from 'models/claim';
import {
  CASE_DOCUMENT_DOWNLOAD_URL,
  DEFENDANT_SUMMARY_URL, IS_CASE_READY_URL} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {FinaliseYourTrialSectionBuilder} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

export const getFinaliseTrialArrangementContents = (claimId: string, claim: Claim) => {
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE')
    .addLeadParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CASE_REFERENCE', {claimId:caseNumberPrettify( claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addWarning('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_HAVE_UNTIL_DATE',{hearingDueDate:claim.bundleStitchingDeadline})
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_FINALISE')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IS_THE_CASE_READY_FOR_TRIAL')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.DIRECTIONS_ORDER', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SDO_ORDER)),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_ARE_ASKING_YOU',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_HAVE_RECEIVED','', true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOUR_CASE_NOT_READY')
    .addCustomInsetText('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_NEED_TO_MAKE_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_AN_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.HEARING_ADJUSTMENTS_AND_DURATION')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.DIRECTIONS_QUESTIONNAIRE', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_WILL_BE_ASKED',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_REVIEW','', true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_WILL_REMIND_YOU')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_FEEL_THAT')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TEXT')
    .addStartButtonWithLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.START_NOW', IS_CASE_READY_URL.replace(':id', claim.id),DEFENDANT_SUMMARY_URL.replace(':id', claim.id) )
    .build();
};
