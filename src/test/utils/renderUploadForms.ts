import {GenericForm} from 'common/form/models/genericForm';
import {UploadDocumentsUserForm, TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {EvidenceUploadDisclosure} from 'models/document/documentType';
import {formControlsEnvironment, formControlForm, formControlTranslate} from './renderFormControls';
import * as disclosure from 'services/features/caseProgression/disclosureContentBuilder';
import * as witness from 'services/features/caseProgression/witnessContentBuilder';
import * as expert from 'services/features/caseProgression/expertContentBuilder';
import * as trial from 'services/features/caseProgression/trialContentBuilder';
import {buildYourStatementSection} from 'services/features/mediation/uploadDocuments/yourStatementContentBuilder';
import {buildDocumentsReferredSection} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredContentBuilder';

export const uploadCategories = [
  ['documentsForDisclosure', 'disclosureContent', 'disclosure', disclosure.buildDisclosureDocumentSection],
  ['disclosureList', 'disclosureContent', 'disclosureList', disclosure.buildDisclosureListSection],
  ['witnessStatement', 'witnessContent', 'witness', witness.buildWitnessStatement],
  ['witnessSummary', 'witnessContent', 'witnessSummary', witness.buildWitnessSummary],
  ['noticeOfIntention', 'witnessContent', 'noticeOfIntention', witness.buildNoticeOfIntention],
  ['documentsReferred', 'witnessContent', 'documentsReferred', witness.buildDocumentsReferred],
  ['expertReport', 'expertContent', 'expertReport', expert.buildExpertReportSection],
  ['expertStatement', 'expertContent', 'expertStatement', expert.buildJointStatementSection],
  ['questionsForExperts', 'expertContent', 'questionsForExperts', (row: ReturnType<typeof uploadRow>, i: number) => expert.buildQuestionsForOtherSection([], row, i)],
  ['answersForExperts', 'expertContent', 'answersForExperts', (row: ReturnType<typeof uploadRow>, i: number) => expert.buildAnswersToQuestionsSection([], row, i)],
  ['trialCaseSummary', 'trialContent', 'trialCaseSummary', trial.buildTrialCaseSummarySection],
  ['trialSkeletonArgument', 'trialContent', 'trialSkeletonArgument', trial.buildTrialSkeletonSection],
  ['trialAuthorities', 'trialContent', 'trialAuthorities', trial.buildTrialLegalSection],
  ['trialCosts', 'trialContent', 'trialCosts', trial.buildTrialCostSection],
  ['trialDocumentary', 'trialContent', 'trialDocumentary', (row: ReturnType<typeof uploadRow>, i: number) => trial.buildTrialDocumentarySection(false, row, i)],
] as const;
export const uploadPages = [
  'features/generalApplication/upload_documents.njk',
  'features/generalApplication/response/respondent-upload-documents.njk',
  'features/generalApplication/additionalDocuments/upload-additional-documents.njk',
  'features/generalApplication/additionalInfoUpload/upload-documents.njk',
  'features/generalApplication/directionsOrderUpload/upload-documents.njk',
  'features/generalApplication/upload-n245-form.njk',
  'features/queryManagement/createQuery.njk',
  'features/queryManagement/sendFollowUpQuery.njk',
];
export function uploadRow(i = 0) {
  return Object.assign(new TypeOfDocumentSection('1', '2', '2024'), {
    typeOfDocument: `Description ${i}`, witnessName: `Witness ${i}`, expertName: `Expert ${i}`,
    multipleExpertsName: `Experts ${i}`, fieldOfExpertise: `Field ${i}`, otherPartyName: `Other ${i}`,
    questionDocumentName: `Question ${i}`, otherPartyQuestionsDocumentName: `Questions ${i}`, yourName: `Person ${i}`,
    caseDocument: {createdBy: 'fixture-user', documentName: `saved-${i}.pdf`, documentSize: 100,
      documentLink: {document_url: `http://localhost/documents/${i}`, document_binary_url: `http://localhost/documents/${i}/binary`, document_filename: `saved-${i}.pdf`},
      documentType: EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, createdDatetime: new Date('2024-01-01T12:00:00Z')},
  });
}
export function uploadContext(language = 'en') {
  return {t: formControlTranslate(language), lang: language, csrf: 'fixture-csrf', currentUrl: '/case/1/upload?source=fixture', cancelUrl: '/cancel',
    form: formControlForm(), formattedSummary: {summaryList: {rows: [] as unknown[]}}, documentName: '', claimId: '1', partyInformation: {claimantName: 'Alex', defendantName: 'Morgan'},
    pageTitle: 'PAGES.UPLOAD_DOCUMENTS.TITLE', pageHeaders: {pageTitle: 'PAGES.QM.QUERY_FORM.SUBJECT_TITLE', caption: 'COMMON.GENERAL_APPLICATION', heading: 'PAGES.QM.QUERY_FORM.SUBJECT_TITLE'},
    headerTitle: 'COMMON.GENERAL_APPLICATION', applicationType: 'COMMON.GENERAL_APPLICATION', directionOrderDocUrl: '/order', subtitle: '', paragraph: '', sectionTitle: ''};
}
export function renderUploadPage(view: string, language = 'en', extra: Record<string, unknown> = {}, viewsDirectory?: string) {
  return formControlsEnvironment(viewsDirectory).render(view, {...uploadContext(language), ...extra});
}
export function renderRepeatedUpload(language = 'en', mediation = false, count = 2, viewsDirectory?: string) {
  const content: Record<string, unknown[][]> = {disclosureContent: [], witnessContent: [], expertContent: [], trialContent: [], yourStatementContent: [], documentsReferredContent: []};
  if (mediation) {
    content.yourStatementContent = [Array.from({length: count}, (_, i) => ({contentSections: buildYourStatementSection(uploadRow(i), i)}))];
    content.documentsReferredContent = [Array.from({length: count}, (_, i) => ({contentSections: buildDocumentsReferredSection(uploadRow(i), i)}))];
  } else for (const [, group, , builder] of uploadCategories) content[group].push(Array.from({length: count}, (_, i) => ({contentSections: builder(uploadRow(i), i)})));
  return renderUploadPage(mediation ? 'features/mediation/uploadDocuments/upload-documents.njk' : 'features/caseProgression/upload-documents.njk', language, {...content, uploadDocumentsContents: [], form: new GenericForm(new UploadDocumentsUserForm())}, viewsDirectory);
}
