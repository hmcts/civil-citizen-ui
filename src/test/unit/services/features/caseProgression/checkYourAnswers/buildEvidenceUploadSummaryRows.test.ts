import {
  getMockEmptyUploadDocumentsUserForm,
  getMockFullUploadDocumentsUserForm,
} from '../../../../../utils/caseProgression/mockEvidenceUploadSections';
import {
  getDisclosureSummarySection,
  getExpertSummarySection, getTrialSummarySection,
  getWitnessSummarySection,
} from 'services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows';
import {SummarySection, SummarySections} from 'models/summaryList/summarySections';
import {SummaryList, SummaryRow} from 'models/summaryList/summaryList';
import {
  getDocumentReferredToSummaryRow,
  getDocumentTypeSummaryRow, getExpertEvidenceSummaryRow, getExpertOtherPartySummaryRow, getFileOnlySummaryRow,
  getWitnessEvidenceSummaryRow,
} from '../../../../../utils/caseProgression/mockEvidenceUploadSummaryRows';
import {t} from 'i18next';

jest.mock('i18next');

const mockTranslate = t as jest.Mock;
mockTranslate.mockImplementation((textToTranslate) => {
  return textToTranslate;
});

describe('buildEvidenceUploadedSummaryRows', () => {

  describe('getWitnessSummary', () => {
    test('should return summary rows for all claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockFullUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getWitnessSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      const expectedWitnessEvidenceSection = {} as SummarySections;
      expectedWitnessEvidenceSection.sections = [] as SummarySection[];
      const witnessSummarySection = {} as SummarySection;
      witnessSummarySection.summaryList = {} as SummaryList;
      witnessSummarySection.summaryList.rows = [
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', '1234'),
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', '1234'),
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', '1234'),
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', '1234'),
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', '1234'),
        getWitnessEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', '1234'),
        getDocumentReferredToSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT'+' '+1,  '1234'),
        getDocumentReferredToSummaryRow('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT'+' '+2,  '1234'),
      ] as SummaryRow[];
      expectedWitnessEvidenceSection.sections.push(witnessSummarySection);

      expect(actualSummaryRows.sections[0]).toEqual(expectedWitnessEvidenceSection.sections[0]);
    });

    test('should return no summary rows for claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockEmptyUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getWitnessSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      expect(actualSummaryRows.sections[0]).toBeUndefined();
    });
  });
  describe('getExpertSummary', () => {
    test('should return summary rows for all claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockFullUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getExpertSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      const expectedExpertEvidenceSection = {} as SummarySections;
      expectedExpertEvidenceSection.sections = [] as SummarySection[];
      const expertSummarySection = {} as SummarySection;
      expertSummarySection.summaryList = {} as SummaryList;
      expertSummarySection.summaryList.rows = [
        getExpertEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', '1234'),
        getExpertEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', '1234'),
        getExpertEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES','PAGES.UPLOAD_DOCUMENTS.DATE', '1234'),
        getExpertEvidenceSummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES','PAGES.UPLOAD_DOCUMENTS.DATE', '1234'),
        getExpertOtherPartySummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '1234'),
        getExpertOtherPartySummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '1234'),
        getExpertOtherPartySummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS'+' '+1, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '1234'),
        getExpertOtherPartySummaryRow('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS'+' '+2, 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '1234'),
      ] as SummaryRow[];
      expectedExpertEvidenceSection.sections.push(expertSummarySection);

      expect(actualSummaryRows.sections[0]).toEqual(expectedExpertEvidenceSection.sections[0]);
    });
    test('should return no summary rows for claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockEmptyUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getExpertSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      expect(actualSummaryRows.sections[0]).toBeUndefined();
    });
  });
  describe('getDisclosureSummary', () => {
    test('should return summary rows for all claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockFullUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getDisclosureSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      const expectedDisclosureEvidenceSection = {} as SummarySections;
      expectedDisclosureEvidenceSection.sections = [] as SummarySection[];
      const disclosureSummarySection = {} as SummarySection;
      disclosureSummarySection.summaryList = {} as SummaryList;
      disclosureSummarySection.summaryList.rows = [
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS'+' '+1,  '1234'),
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS'+' '+2,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST'+' '+2,  '1234'),
      ] as SummaryRow[];
      expectedDisclosureEvidenceSection.sections.push(disclosureSummarySection);

      expect(actualSummaryRows.sections[0]).toEqual(expectedDisclosureEvidenceSection.sections[0]);
    });

    test('should return no summary rows for claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockEmptyUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getDisclosureSummarySection(uploadDocumentsUserForm, '1234', 'en');
      //then
      expect(actualSummaryRows.sections[0]).toBeUndefined();
    });
  });
  describe('getTrialSummary', () => {
    test('should return summary rows for all small claims claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockFullUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getTrialSummarySection(uploadDocumentsUserForm, true, '1234', 'en');
      //then
      const expectedDisclosureEvidenceSection = {} as SummarySections;
      expectedDisclosureEvidenceSection.sections = [] as SummarySection[];
      const disclosureSummarySection = {} as SummarySection;
      disclosureSummarySection.summaryList = {} as SummaryList;
      disclosureSummarySection.summaryList.rows = [
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY'+' '+1,  '1234'),
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY'+' '+2,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL'+' '+2,  '1234'),
      ] as SummaryRow[];
      expectedDisclosureEvidenceSection.sections.push(disclosureSummarySection);

      expect(actualSummaryRows.sections[0]).toEqual(expectedDisclosureEvidenceSection.sections[0]);
    });
    test('should return summary rows for all fast track claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockFullUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getTrialSummarySection(uploadDocumentsUserForm, false, '1234', 'en');
      //then
      const expectedDisclosureEvidenceSection = {} as SummarySections;
      expectedDisclosureEvidenceSection.sections = [] as SummarySection[];
      const disclosureSummarySection = {} as SummarySection;
      disclosureSummarySection.summaryList = {} as SummaryList;
      disclosureSummarySection.summaryList.rows = [
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY'+' '+2,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON'+' '+2,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL'+' '+2,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS'+' '+1,  '1234'),
        getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS'+' '+2,  '1234'),
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY'+' '+1,  '1234'),
        getDocumentTypeSummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY'+' '+2,  '1234'),
      ] as SummaryRow[];
      expectedDisclosureEvidenceSection.sections.push(disclosureSummarySection);

      expect(actualSummaryRows.sections[0]).toEqual(expectedDisclosureEvidenceSection.sections[0]);
    });

    test('should return summary rows for all fast track claimant values', () => {
      //given
      const uploadDocumentsUserForm = getMockEmptyUploadDocumentsUserForm();
      //when
      const actualSummaryRows = getTrialSummarySection(uploadDocumentsUserForm, false, '1234', 'en');
      //then
      expect(actualSummaryRows.sections[0]).toBeUndefined();
    });
  });
});
