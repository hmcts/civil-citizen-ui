import {
  getDisclosureSummarySection,
  getExpertSummarySection,
  getTrialSummarySection,
  getWitnessSummarySection,
} from 'services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {
  getBottomElements,
  getSummarySections,
  getTopElements,
  saveUploadedDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {documentUploadSections} from 'models/caseProgression/documentUploadSections';
import {SummarySections} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {t} from 'i18next';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {
  getMockEmptyUploadDocumentsUserForm,
  getMockFullUploadDocumentsUserForm,
} from '../../../../../utils/caseProgression/mockEvidenceUploadSections';
import {createCCDClaimForUploadedDocuments} from '../../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('i18next');
jest.mock('client/civilServiceClient');
jest.mock('services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

jest.mock('uuid', () => ({ v4: () => '1221' }));
const mockSubmitEvent = civilServiceClient.submitEvent as jest.Mock;
const mockTranslate = t as jest.Mock;
const mockWitnessSummarySection = getWitnessSummarySection as jest.Mock;
const mockExpertSummarySection = getExpertSummarySection as jest.Mock;
const mockDisclosureSummarySection = getDisclosureSummarySection as jest.Mock;
const mockTrialSummarySection = getTrialSummarySection as jest.Mock;
const returnValue = {sections: [{}]} as SummarySections;

mockTranslate.mockImplementation((stringToTranslate) => {
  return stringToTranslate;
});
mockWitnessSummarySection.mockReturnValue(returnValue);
mockExpertSummarySection.mockReturnValue(returnValue);
mockDisclosureSummarySection.mockReturnValue(returnValue);
mockTrialSummarySection.mockReturnValue(returnValue);
mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});

describe('checkAnswersServiceTest', () => {
  describe('return page elements', () => {
    test('return all evidence sections', () => {
      //given
      const uploadedDocuments = new UploadDocumentsUserForm();
      const claimId = '1234';
      const isSmallClaims = true;
      const lang = 'en';

      //when
      const summarySectionActual = getSummarySections(uploadedDocuments, claimId, isSmallClaims, lang);
      //then
      const summarySectionExpected = {
        witnessEvidenceSection: returnValue,
        disclosureEvidenceSection: returnValue,
        expertEvidenceSection: returnValue,
        trialEvidenceSection: returnValue,
      } as documentUploadSections;
      expect(summarySectionActual).toEqual(summarySectionExpected);
    });

    test('return top page elements', () => {
      //given
      const claim = new Claim();
      claim.id = '1234';
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = {partyName: 'John Smith', individualFirstName: 'John', individualLastName: 'Smith', individualTitle: 'Dr'} as PartyDetails;

      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = {partyName: 'John Smith', individualFirstName: 'John', individualLastName: 'Smith', individualTitle: 'Dr'} as PartyDetails;

      //when
      const topElementsActual = getTopElements(claim);
      //then
      const topElementsExpected = [
        {type: ClaimSummaryType.MAINTITLE, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_TITLE'}} as ClaimSummarySection,
        {type: ClaimSummaryType.LEAD_PARAGRAPH, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_REFERENCE_NUMBER', variables:{caseNumber: claim.id}}},
        {type: ClaimSummaryType.LEAD_PARAGRAPH, data: {text: 'COMMON.PARTIES', variables:{claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName()}}},
        {type: ClaimSummaryType.INSET_TEXT, data: {html: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_FULL'}},
      ];
      expect(topElementsActual).toEqual(topElementsExpected);
    });

    test('return bottom page elements', () => {

      //when
      const bottomElementsActual = getBottomElements();

      //then
      const bottomElementsExpected = [
        {type: ClaimSummaryType.MAINTITLE, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_CONFIRMATION'}},
        {type: ClaimSummaryType.WARNING, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_SHORT'}},
      ];
      expect(bottomElementsActual).toEqual(bottomElementsExpected);
    });

    describe('saveUploadedDocuments', () => {

      beforeEach(() => {
        emptyClaim.caseProgression.claimantUploadDocuments = {disclosure: [], witness: [], expert: [], trial: []} as UploadDocuments;
        emptyClaim.caseProgression.defendantUploadDocuments = {disclosure: [], witness: [], expert: [], trial: []} as UploadDocuments;

        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve, reject) => resolve(emptyClaim),
            ),
          );
      });

      const emptyClaim = new Claim();
      emptyClaim.caseProgression = new CaseProgression();

      const claimWithUploadedDocuments = new Claim();
      claimWithUploadedDocuments.caseProgression = new CaseProgression();
      claimWithUploadedDocuments.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
      claimWithUploadedDocuments.caseProgression.defendantDocuments = getMockFullUploadDocumentsUserForm();

      const claimWithoutUploadedDocuments = new Claim();
      claimWithoutUploadedDocuments.caseProgression = new CaseProgression();
      claimWithoutUploadedDocuments.caseProgression.claimantDocuments = getMockEmptyUploadDocumentsUserForm();
      claimWithoutUploadedDocuments.caseProgression.defendantDocuments = getMockEmptyUploadDocumentsUserForm();

      test('For claimant - all arrays filled', async ()=> {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, null);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', undefined, createCCDClaimForUploadedDocuments(2,true), null);

      });

      test('For claimant - all arrays empty', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithoutUploadedDocuments.caseRole = CaseRole.CLAIMANT;

        //when
        await saveUploadedDocuments(claimWithoutUploadedDocuments, null);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', undefined, createCCDClaimForUploadedDocuments(0,true), null);

      });
      test('For defendant - all arrays filled', async ()=> {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithUploadedDocuments.caseRole = CaseRole.DEFENDANT;

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, null);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', undefined, createCCDClaimForUploadedDocuments(2,false), null);

      });

      test('For defendant - all arrays empty', async() => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithoutUploadedDocuments.caseRole = CaseRole.DEFENDANT;

        //when
        await saveUploadedDocuments(claimWithoutUploadedDocuments, null);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', undefined, createCCDClaimForUploadedDocuments(0,false), null);
      });
    });
  });
});
